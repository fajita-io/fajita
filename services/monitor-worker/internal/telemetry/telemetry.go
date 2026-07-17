// Package telemetry provides structured logging, URL redaction, and bounded
// operational metrics for the monitoring worker. It never logs secrets, request
// or response bodies, full sensitive URLs, tokens, credentials, or customer
// identities (see docs/observability/monitoring-engine.md).
package telemetry

import (
	"log/slog"
	"net/url"
	"os"
	"strings"
	"sync"
	"sync/atomic"
)

// NewLogger returns a JSON structured logger at the given level.
func NewLogger(level string) *slog.Logger {
	var lvl slog.Level
	switch strings.ToLower(level) {
	case "debug":
		lvl = slog.LevelDebug
	case "warn":
		lvl = slog.LevelWarn
	case "error":
		lvl = slog.LevelError
	default:
		lvl = slog.LevelInfo
	}
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: lvl}))
}

// RedactURL returns a log-safe form of a URL: scheme, host, and path only.
// Query parameters, fragments, and any embedded userinfo are removed because
// they can carry tokens, keys, or personal data.
func RedactURL(raw string) string {
	if raw == "" {
		return ""
	}
	u, err := url.Parse(raw)
	if err != nil {
		return "[unparseable-url]"
	}
	safe := &url.URL{Scheme: u.Scheme, Host: u.Host, Path: u.Path}
	// Drop userinfo, query, and fragment entirely.
	safe.User = nil
	return safe.String()
}

// Metrics is a small, dependency-free counter set with bounded, low-cardinality
// fields. Labels that would explode cardinality (full URL, monitor/org/customer
// names, query strings) are deliberately never recorded.
type Metrics struct {
	ChecksScheduled     atomic.Int64
	ChecksLeased        atomic.Int64
	ChecksCompleted     atomic.Int64
	ChecksSucceeded     atomic.Int64
	ChecksFailed        atomic.Int64
	ChecksBlocked       atomic.Int64
	ChecksTimedOut      atomic.Int64
	RetryAttempts       atomic.Int64
	LeaseExpirations    atomic.Int64
	DuplicateExec       atomic.Int64
	SSRFBlocks          atomic.Int64
	RedirectBlocks      atomic.Int64
	HeartbeatIngest     atomic.Int64
	DatabaseErrors      atomic.Int64
	AssertionFailures   atomic.Int64
	HeartbeatMisses     atomic.Int64
	IncidentEvaluations atomic.Int64
	QueueLagSeconds     atomic.Int64 // last observed
	ActiveLeases        atomic.Int64
	execDurations       sync.Map // not exposed; reserved for future histogram
}

// Snapshot returns a bounded map for the metrics endpoint.
func (m *Metrics) Snapshot() map[string]int64 {
	return map[string]int64{
		"checks_scheduled":     m.ChecksScheduled.Load(),
		"checks_leased":        m.ChecksLeased.Load(),
		"checks_completed":     m.ChecksCompleted.Load(),
		"checks_succeeded":     m.ChecksSucceeded.Load(),
		"checks_failed":        m.ChecksFailed.Load(),
		"checks_blocked":       m.ChecksBlocked.Load(),
		"checks_timed_out":     m.ChecksTimedOut.Load(),
		"retry_attempts":       m.RetryAttempts.Load(),
		"lease_expirations":    m.LeaseExpirations.Load(),
		"duplicate_exec":       m.DuplicateExec.Load(),
		"ssrf_blocks":          m.SSRFBlocks.Load(),
		"redirect_blocks":      m.RedirectBlocks.Load(),
		"heartbeat_ingest":     m.HeartbeatIngest.Load(),
		"database_errors":      m.DatabaseErrors.Load(),
		"assertion_failures":   m.AssertionFailures.Load(),
		"heartbeat_misses":     m.HeartbeatMisses.Load(),
		"incident_evaluations": m.IncidentEvaluations.Load(),
		"queue_lag_seconds":    m.QueueLagSeconds.Load(),
		"active_leases":        m.ActiveLeases.Load(),
	}
}
