// Package scheduler is the worker's control loop. It leases due work with a
// bounded batch, dispatches to a fixed worker pool, finalizes results
// idempotently, advances schedules without long-term drift, heartbeats, reaps
// expired leases, and drains gracefully on shutdown.
package scheduler

import (
	"context"
	"encoding/json"
	"log/slog"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"

	contracts "github.com/fajita-io/monitor-contracts"
	"github.com/fajita-io/monitor-worker/internal/config"
	"github.com/fajita-io/monitor-worker/internal/crypto"
	"github.com/fajita-io/monitor-worker/internal/executor"
	"github.com/fajita-io/monitor-worker/internal/lease"
	"github.com/fajita-io/monitor-worker/internal/telemetry"
)

type Scheduler struct {
	cfg      *config.Config
	store    *lease.Store
	exec     *executor.Executor
	log      *slog.Logger
	metrics  *telemetry.Metrics
	workerID string

	jobs     chan lease.Work
	inflight atomic.Int64
	succ     atomic.Int64
	fail     atomic.Int64
	draining atomic.Bool
	ready    atomic.Bool
}

func New(cfg *config.Config, store *lease.Store, exec *executor.Executor, log *slog.Logger, m *telemetry.Metrics) *Scheduler {
	return &Scheduler{cfg: cfg, store: store, exec: exec, log: log, metrics: m}
}

// Ready reports whether the worker can lease and execute checks.
func (s *Scheduler) Ready() bool { return s.ready.Load() && !s.draining.Load() }

// Run registers the worker and blocks until ctx is canceled, then drains.
func (s *Scheduler) Run(ctx context.Context) error {
	id, err := s.store.Register(ctx, s.cfg.WorkerKey, s.cfg.Region, s.cfg.Version,
		s.cfg.BuildCommit, s.cfg.DeployID, s.cfg.ContractVersion, s.cfg.Concurrency)
	if err != nil {
		return err
	}
	s.workerID = id
	s.ready.Store(true)
	s.log.Info("worker registered", "worker_id", id, "region", s.cfg.Region, "concurrency", s.cfg.Concurrency)

	s.jobs = make(chan lease.Work, s.cfg.Concurrency)
	var pool sync.WaitGroup
	for i := 0; i < s.cfg.Concurrency; i++ {
		pool.Add(1)
		go func() {
			defer pool.Done()
			for w := range s.jobs {
				s.process(ctx, w)
				s.inflight.Add(-1)
			}
		}()
	}

	pollT := time.NewTicker(time.Duration(s.cfg.PollIntervalMS) * time.Millisecond)
	hbT := time.NewTicker(time.Duration(s.cfg.HeartbeatSeconds) * time.Second)
	reapT := time.NewTicker(time.Duration(s.cfg.ReaperSeconds) * time.Second)
	evalT := time.NewTicker(time.Duration(s.cfg.EvalDrainSeconds) * time.Second)
	defer pollT.Stop()
	defer hbT.Stop()
	defer reapT.Stop()
	defer evalT.Stop()

	for {
		select {
		case <-ctx.Done():
			s.drain(&pool)
			return nil
		case <-pollT.C:
			s.pollOnce(ctx)
		case <-hbT.C:
			s.heartbeat(ctx, string(contracts.WorkerHealthy))
		case <-reapT.C:
			if n, err := s.store.ExpireStale(ctx); err != nil {
				s.metrics.DatabaseErrors.Add(1)
				s.log.Warn("expire stale leases failed", "error", err.Error())
			} else if n > 0 {
				s.metrics.LeaseExpirations.Add(int64(n))
			}
		case <-evalT.C:
			s.evaluateOnce(ctx)
		}
	}
}

// evaluateOnce records overdue heartbeat misses, then drains the incident
// evaluation queue. Heartbeat detection runs first so freshly missed pings are
// evaluated in the same tick. This is decoupled from check execution: it never
// blocks the worker pool and is safe to run concurrently across workers because
// both app functions lock rows with FOR UPDATE SKIP LOCKED.
func (s *Scheduler) evaluateOnce(ctx context.Context) {
	if n, err := s.store.DetectMissedHeartbeats(ctx); err != nil {
		s.metrics.DatabaseErrors.Add(1)
		s.log.Warn("detect missed heartbeats failed", "error", err.Error())
	} else if n > 0 {
		s.metrics.HeartbeatMisses.Add(int64(n))
	}
	if n, err := s.store.ProcessIncidentEvaluations(ctx, s.cfg.EvalBatchLimit); err != nil {
		s.metrics.DatabaseErrors.Add(1)
		s.log.Warn("process incident evaluations failed", "error", err.Error())
	} else if n > 0 {
		s.metrics.IncidentEvaluations.Add(int64(n))
	}
}

func (s *Scheduler) pollOnce(ctx context.Context) {
	if s.draining.Load() {
		return
	}
	capacity := int(int64(s.cfg.Concurrency) - s.inflight.Load())
	if capacity <= 0 {
		return
	}
	batch := capacity
	if batch > s.cfg.LeaseBatchSize {
		batch = s.cfg.LeaseBatchSize
	}
	work, err := s.store.LeaseDue(ctx, s.workerID, s.cfg.Region, batch, s.cfg.LeaseSeconds)
	if err != nil {
		s.metrics.DatabaseErrors.Add(1)
		s.log.Warn("lease failed", "error", err.Error())
		return
	}
	for _, w := range work {
		s.inflight.Add(1)
		s.metrics.ChecksLeased.Add(1)
		s.jobs <- w
	}
	s.metrics.ActiveLeases.Store(s.inflight.Load())
}

func (s *Scheduler) process(ctx context.Context, w lease.Work) {
	leasedAt := time.Now()
	cfgSnap, encSecrets, err := s.store.LoadMonitor(ctx, w.MonitorID, w.MonitorVersionID)
	if err != nil {
		s.metrics.DatabaseErrors.Add(1)
		s.log.Warn("load monitor failed", "monitor_id", w.MonitorID, "error", err.Error())
		return
	}
	if cfgSnap == nil {
		// Monitor or version vanished; let the lease expire and be reclaimed.
		s.log.Info("monitor not found for lease; skipping", "monitor_id", w.MonitorID)
		return
	}

	secrets, decErr := s.decryptSecrets(encSecrets)

	req := executor.Request{
		IdempotencyKey: w.IdempotencyKey,
		MonitorID:      w.MonitorID,
		VersionID:      w.MonitorVersionID,
		OrganizationID: w.OrganizationID,
		ScheduledFor:   w.ScheduledFor,
		Config:         *cfgSnap,
		Secrets:        secrets,
		CorrelationID:  w.IdempotencyKey,
	}

	var res executor.Result
	if decErr != nil {
		// Never fabricate success when a secret cannot be decrypted.
		res = executor.Result{
			Status:           contracts.StatusError,
			FailureCategory:  contracts.FailInvalidConfig,
			SafeErrorMessage: "A monitor secret could not be decrypted.",
			StartedAt:        time.Now(),
			CompletedAt:      time.Now(),
			AttemptCount:     1,
		}
	} else {
		res = s.exec.Execute(ctx, req)
	}

	s.finalize(ctx, w, leasedAt, cfgSnap, res)
	s.recordMetrics(res)
	s.recordSecurity(ctx, w, res)
}

func (s *Scheduler) finalize(ctx context.Context, w lease.Work, leasedAt time.Time, cfg *contracts.MonitorConfigSnapshot, res executor.Result) {
	assertJSON, _ := json.Marshal(assertionRows(res))
	var tlsSummary *string
	if res.Cert != nil {
		if b, err := json.Marshal(res.Cert); err == nil {
			str := string(b)
			tlsSummary = &str
		}
	}

	params := lease.FinalizeParams{
		IdempotencyKey:    w.IdempotencyKey,
		MonitorID:         w.MonitorID,
		MonitorVersionID:  w.MonitorVersionID,
		OrganizationID:    w.OrganizationID,
		WorkerID:          s.workerID,
		Region:            s.cfg.Region,
		ScheduledFor:      w.ScheduledFor,
		LeasedAt:          leasedAt,
		StartedAt:         res.StartedAt,
		CompletedAt:       res.CompletedAt,
		AttemptCount:      max(res.AttemptCount, 1),
		Status:            string(res.Status),
		FailureCategory:   strPtr(string(res.FailureCategory)),
		HTTPStatus:        intPtr(res.HTTPStatus),
		FinalURL:          strPtr(res.FinalURL),
		RedirectCount:     res.RedirectCount,
		ResponseBytes:     res.ResponseBytes,
		DNSMS:             res.Timings.DNSMS,
		ConnectMS:         res.Timings.ConnectMS,
		TLSMS:             res.Timings.TLSMS,
		TTFBMS:            res.Timings.TTFBMS,
		TotalMS:           res.Timings.TotalMS,
		TLSSummary:        tlsSummary,
		DiagnosticSnippet: strPtr(res.DiagnosticSnippet),
		SafeErrorMessage:  strPtr(res.SafeErrorMessage),
		AssertionResults:  string(assertJSON),
		CorrelationID:     strPtr(w.IdempotencyKey),
		IsTest:            false,
		NextCheckAt:       s.nextCheckAt(w.ScheduledFor, cfg.CheckIntervalSeconds),
	}
	if _, err := s.store.Finalize(ctx, params); err != nil {
		s.metrics.DatabaseErrors.Add(1)
		s.log.Warn("finalize failed", "monitor_id", w.MonitorID, "error", err.Error())
	}
}

// nextCheckAt advances from the intended tick (drift-free), resynchronizing when
// far behind (bounded catch-up), with small jitter to avoid synchronized spikes.
func (s *Scheduler) nextCheckAt(scheduledFor time.Time, intervalSeconds int) time.Time {
	if intervalSeconds <= 0 {
		intervalSeconds = 300
	}
	interval := time.Duration(intervalSeconds) * time.Second
	next := scheduledFor.Add(interval)
	now := time.Now()
	if next.Before(now.Add(-interval)) {
		next = now.Add(interval) // too far behind: skip missed intervals
	}
	jitterMax := interval / 10
	if jitterMax > 15*time.Second {
		jitterMax = 15 * time.Second
	}
	if jitterMax > 0 {
		next = next.Add(time.Duration(rand.Int63n(int64(jitterMax))))
	}
	return next
}

func (s *Scheduler) recordMetrics(res executor.Result) {
	s.metrics.ChecksCompleted.Add(1)
	switch res.Status {
	case contracts.StatusSuccess:
		s.metrics.ChecksSucceeded.Add(1)
		s.succ.Add(1)
	case contracts.StatusBlocked:
		s.metrics.ChecksBlocked.Add(1)
		s.metrics.SSRFBlocks.Add(1)
		s.fail.Add(1)
	case contracts.StatusTimedOut:
		s.metrics.ChecksTimedOut.Add(1)
		s.fail.Add(1)
	default:
		s.metrics.ChecksFailed.Add(1)
		s.fail.Add(1)
	}
	if res.AttemptCount > 1 {
		s.metrics.RetryAttempts.Add(int64(res.AttemptCount - 1))
	}
	if res.FailureCategory == contracts.FailRedirectBlocked {
		s.metrics.RedirectBlocks.Add(1)
	}
	if res.FailureCategory == contracts.FailAssertion || res.FailureCategory == contracts.FailUnexpectedStatus {
		s.metrics.AssertionFailures.Add(1)
	}
}

func (s *Scheduler) recordSecurity(ctx context.Context, w lease.Work, res executor.Result) {
	if res.SecurityEvent == nil {
		return
	}
	orgID := w.OrganizationID
	monID := w.MonitorID
	if err := s.store.RecordSecurityEvent(ctx, &orgID, &monID,
		string(res.SecurityEvent.Type), res.SecurityEvent.Severity, res.SecurityEvent.Summary, "", s.workerID); err != nil {
		s.log.Warn("record security event failed", "error", err.Error())
	}
}

func (s *Scheduler) decryptSecrets(enc []lease.EncSecret) ([]executor.Secret, error) {
	out := make([]executor.Secret, 0, len(enc))
	for _, e := range enc {
		plain, err := crypto.Decrypt(s.cfg.Keyring, e.EncryptedPayload)
		if err != nil {
			return nil, err
		}
		out = append(out, executor.Secret{
			Type:       contracts.SecretType(e.SecretType),
			HeaderName: e.HeaderName,
			Value:      string(plain),
		})
	}
	return out, nil
}

func (s *Scheduler) heartbeat(ctx context.Context, status string) {
	if s.draining.Load() {
		status = string(contracts.WorkerDraining)
	}
	succ := int(s.succ.Swap(0))
	fail := int(s.fail.Swap(0))
	shutdown, err := s.store.Heartbeat(ctx, s.workerID, status, int(s.inflight.Load()), int(s.metrics.QueueLagSeconds.Load()), 0, succ, fail)
	if err != nil {
		s.metrics.DatabaseErrors.Add(1)
		s.log.Warn("heartbeat failed", "error", err.Error())
		s.ready.Store(false)
		return
	}
	s.ready.Store(true)
	if shutdown {
		s.draining.Store(true)
	}
}

func (s *Scheduler) drain(pool *sync.WaitGroup) {
	s.draining.Store(true)
	s.log.Info("draining: stopping new leases, finishing in-flight checks")
	deadline := time.Now().Add(25 * time.Second)
	for s.inflight.Load() > 0 && time.Now().Before(deadline) {
		time.Sleep(100 * time.Millisecond)
	}
	close(s.jobs)
	pool.Wait()
	// Final heartbeat marks the worker offline.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, _ = s.store.Heartbeat(ctx, s.workerID, string(contracts.WorkerOffline), 0, 0, 0, int(s.succ.Swap(0)), int(s.fail.Swap(0)))
	s.log.Info("drain complete")
}

type assertionRow struct {
	AssertionID     string `json:"assertion_id"`
	AssertionType   string `json:"assertion_type"`
	Passed          bool   `json:"passed"`
	ExpectedSummary string `json:"expected_summary"`
	ActualSummary   string `json:"actual_summary"`
	FailureReason   string `json:"failure_reason"`
	EvaluationMS    int    `json:"evaluation_ms"`
	Position        int    `json:"position"`
}

func assertionRows(res executor.Result) []assertionRow {
	rows := make([]assertionRow, 0, len(res.Assertions))
	for _, a := range res.Assertions {
		rows = append(rows, assertionRow{
			AssertionID:     a.AssertionID,
			AssertionType:   string(a.Type),
			Passed:          a.Passed,
			ExpectedSummary: a.ExpectedSummary,
			ActualSummary:   a.ActualSummary,
			FailureReason:   a.FailureReason,
			Position:        a.Position,
		})
	}
	return rows
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func intPtr(n int) *int {
	if n == 0 {
		return nil
	}
	return &n
}
