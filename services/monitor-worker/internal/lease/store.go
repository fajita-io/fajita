// Package lease is the worker's only database interface. It calls the restricted
// SECURITY DEFINER functions in the app schema (register, heartbeat, lease,
// load, finalize, expire). The worker's database role has EXECUTE on these
// functions and no direct table privileges, so it cannot read unrelated
// customer data or forge results (see docs/security/worker-authentication.md).
package lease

import (
	"context"
	"encoding/json"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	contracts "github.com/fajita-io/monitor-contracts"
)

type Store struct {
	pool *pgxpool.Pool
}

// New opens a bounded connection pool.
func New(ctx context.Context, dsn string) (*Store, error) {
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	cfg.MaxConns = 8
	cfg.MinConns = 1
	cfg.MaxConnIdleTime = 60 * time.Second
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	return &Store{pool: pool}, nil
}

func (s *Store) Close() { s.pool.Close() }

func (s *Store) Ping(ctx context.Context) error { return s.pool.Ping(ctx) }

// Register upserts this worker and returns its internal id.
func (s *Store) Register(ctx context.Context, workerKey, region, version, commit, deployID string, contractVersion, capacity int) (string, error) {
	var id string
	err := s.pool.QueryRow(ctx,
		`select app.worker_register($1,$2,$3,$4,$5,$6,$7)::text`,
		workerKey, region, version, commit, deployID, contractVersion, capacity,
	).Scan(&id)
	return id, err
}

// Heartbeat reports liveness and returns whether a drain was requested.
func (s *Store) Heartbeat(ctx context.Context, workerID, status string, active, lag, avg, succDelta, failDelta int) (bool, error) {
	var shutdown bool
	err := s.pool.QueryRow(ctx,
		`select app.worker_heartbeat($1::uuid,$2,$3,$4,$5,$6,$7)`,
		workerID, status, active, lag, avg, succDelta, failDelta,
	).Scan(&shutdown)
	return shutdown, err
}

// Work is one leased unit.
type Work struct {
	MonitorID        string
	OrganizationID   string
	MonitorVersionID string
	ScheduledFor     time.Time
	Generation       int64
	IdempotencyKey   string
}

// LeaseDue leases up to max due schedules.
func (s *Store) LeaseDue(ctx context.Context, workerID, region string, max, leaseSeconds int) ([]Work, error) {
	rows, err := s.pool.Query(ctx,
		`select monitor_id::text, organization_id::text, monitor_version_id::text,
		        scheduled_for, schedule_generation, idempotency_key
		   from app.lease_due_checks($1::uuid,$2,$3,$4)`,
		workerID, region, max, leaseSeconds,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Work
	for rows.Next() {
		var w Work
		if err := rows.Scan(&w.MonitorID, &w.OrganizationID, &w.MonitorVersionID, &w.ScheduledFor, &w.Generation, &w.IdempotencyKey); err != nil {
			return nil, err
		}
		out = append(out, w)
	}
	return out, rows.Err()
}

// EncSecret is an encrypted secret reference for a monitor.
type EncSecret struct {
	ID               string `json:"id"`
	SecretType       string `json:"secret_type"`
	HeaderName       string `json:"header_name"`
	EncryptedPayload string `json:"encrypted_payload"`
	KeyVersion       int    `json:"encryption_key_version"`
}

type loadResult struct {
	Config  contracts.MonitorConfigSnapshot `json:"config"`
	Secrets []EncSecret                     `json:"secrets"`
}

// LoadMonitor returns the version-faithful config snapshot and encrypted secret
// references.
func (s *Store) LoadMonitor(ctx context.Context, monitorID, versionID string) (*contracts.MonitorConfigSnapshot, []EncSecret, error) {
	var raw []byte
	err := s.pool.QueryRow(ctx,
		`select app.worker_load_monitor($1::uuid,$2::uuid)`,
		monitorID, versionID,
	).Scan(&raw)
	if err != nil {
		return nil, nil, err
	}
	if len(raw) == 0 || string(raw) == "null" {
		return nil, nil, nil
	}
	var lr loadResult
	if err := json.Unmarshal(raw, &lr); err != nil {
		return nil, nil, err
	}
	return &lr.Config, lr.Secrets, nil
}

// FinalizeParams carries every field persisted for one execution.
type FinalizeParams struct {
	IdempotencyKey    string
	MonitorID         string
	MonitorVersionID  string
	OrganizationID    string
	WorkerID          string
	Region            string
	ScheduledFor      time.Time
	LeasedAt          time.Time
	StartedAt         time.Time
	CompletedAt       time.Time
	AttemptCount      int
	Status            string
	Phase             string
	FailureCategory   *string
	HTTPStatus        *int
	FinalURL          *string
	RedirectCount     int
	ResponseBytes     int64
	DNSMS             int
	ConnectMS         int
	TLSMS             int
	TTFBMS            int
	TotalMS           int
	TLSSummary        *string // JSON text or nil
	DiagnosticSnippet *string
	SafeErrorMessage  *string
	AssertionResults  string // JSON array text
	CorrelationID     *string
	IsTest            bool
	NextCheckAt       time.Time
}

// Finalize persists the execution idempotently and returns the execution id.
func (s *Store) Finalize(ctx context.Context, p FinalizeParams) (string, error) {
	var execID string
	err := s.pool.QueryRow(ctx, `
		select app.finalize_check(
			$1, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6,
			$7::timestamptz, $8::timestamptz, $9::timestamptz, $10::timestamptz,
			$11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
			$24::jsonb, $25, $26, $27::jsonb, $28::uuid, $29, $30::timestamptz
		)::text`,
		p.IdempotencyKey, p.MonitorID, p.MonitorVersionID, p.OrganizationID, p.WorkerID, p.Region,
		p.ScheduledFor, p.LeasedAt, p.StartedAt, p.CompletedAt,
		p.AttemptCount, p.Status, nullStr(p.Phase), p.FailureCategory, p.HTTPStatus, p.FinalURL,
		p.RedirectCount, p.ResponseBytes, p.DNSMS, p.ConnectMS, p.TLSMS, p.TTFBMS, p.TotalMS,
		p.TLSSummary, p.DiagnosticSnippet, p.SafeErrorMessage, p.AssertionResults, p.CorrelationID,
		p.IsTest, p.NextCheckAt,
	).Scan(&execID)
	return execID, err
}

// ExpireStale reclaims expired leases and returns how many.
func (s *Store) ExpireStale(ctx context.Context) (int, error) {
	var n int
	err := s.pool.QueryRow(ctx, `select app.expire_stale_leases()`).Scan(&n)
	return n, err
}

// DetectMissedHeartbeats records synthetic failure results for heartbeat
// monitors whose grace window has elapsed, enqueueing them for evaluation.
// Returns how many tokens were newly marked missed.
func (s *Store) DetectMissedHeartbeats(ctx context.Context) (int, error) {
	var n int
	err := s.pool.QueryRow(ctx, `select app.detect_missed_heartbeats()`).Scan(&n)
	return n, err
}

// ProcessIncidentEvaluations drains the operational-state evaluation queue,
// running the incident state machine per queued check result. Returns how many
// evaluations were processed in this batch.
func (s *Store) ProcessIncidentEvaluations(ctx context.Context, limit int) (int, error) {
	var n int
	err := s.pool.QueryRow(ctx, `select app.process_incident_evaluations($1, 1)`, limit).Scan(&n)
	return n, err
}

// RecordSecurityEvent appends a safe security event.
func (s *Store) RecordSecurityEvent(ctx context.Context, orgID, monitorID *string, evtType, severity, summary, metadataJSON string, workerID string) error {
	_, err := s.pool.Exec(ctx,
		`select app.record_monitor_security_event($1::uuid,$2::uuid,$3,$4,$5,$6::jsonb,$7::uuid,null)`,
		orgID, monitorID, evtType, severity, summary, nullStr(metadataJSON), workerID,
	)
	return err
}

func nullStr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
