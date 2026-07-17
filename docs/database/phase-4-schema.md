# Phase 4 database schema

Migration `supabase/migrations/20260718000000_phase4_monitoring_engine.sql`
(plus RLS in `...000100...` and the lease-function fix in `...000200...`).
Applied to project `olvnjsqspvywvwfchtuc`.

## Tables (15)

| Table | Purpose |
| --- | --- |
| `monitors` | Durable monitor record and rollup fields |
| `monitor_versions` | Immutable configuration snapshots; every result references one |
| `monitor_assertions` | Typed assertion rows per version |
| `monitor_secrets` | Encrypted credentials (envelope), masked labels, key version |
| `check_schedules` | Per-monitor next-run state and lease lock fields |
| `monitor_leases` | Explicit active-claim records for observability and reaping |
| `check_executions` | Operational lifecycle record per run (attempts, timing) |
| `check_results` | Normalized measurements and diagnostics |
| `check_assertion_results` | Per-assertion outcomes linked to a result |
| `monitor_regions` | Region registry |
| `monitor_workers` | Worker registry |
| `monitor_worker_heartbeats` | Worker heartbeat history |
| `monitor_security_events` | SSRF blocks, abuse, rate-limit enforcement |
| `heartbeat_tokens` | Hashed heartbeat/cron tokens |
| `heartbeat_events` | Received heartbeat pings with bounded metadata |

## Conventions

- Tenant-scoped tables carry `organization_id`.
- Durations use explicit unit suffixes (`_ms`, `_seconds`, `_bytes`); units are
  never mixed within a field.
- Foreign keys, unique constraints, and check constraints enforce integrity at
  the database, not only in application code.
- `monitors.current_version_id` references `monitor_versions` (deferred FK).
- Structured columns are used for all critical scheduling and querying fields;
  JSON is used only for bounded metadata and extensibility. There is no single
  giant JSON table.

## Monitor types and statuses

Types: `http`, `https`, `api`, `ssl`, `heartbeat`. Statuses: `draft`, `active`,
`paused`, `disabled`, `pending_deletion`, `deleted`. Configuration lifecycle is
kept separate from result state: a monitor can be `active` while its latest
result is failing.

## Idempotency

`check_executions` carries an idempotency key derived from monitor id, monitor
version, scheduled time, and schedule generation, backed by a unique constraint.
Duplicate finalize is a no-op. Execution records are immutable after finalization
except controlled repair metadata.

## Result taxonomy

Statuses: `success`, `failure`, `error`, `timed_out`, `blocked`, `canceled`.
Failure categories: `dns_failure`, `blocked_destination`, `connection_refused`,
`connection_reset`, `connect_timeout`, `tls_failure`, `tls_expired`,
`tls_hostname_mismatch`, `response_timeout`, `unexpected_status`,
`response_too_large`, `invalid_json`, `assertion_failed`, `redirect_blocked`,
`redirect_limit`, `unsupported_scheme`, `invalid_configuration`, `worker_error`,
`heartbeat_missed`, `canceled`, `unknown`.

## Indexes

Scheduler lookups (`next_check_at`, lock state), organization-scoped result
history, and idempotency uniqueness are indexed. Result tables are designed for
efficient later aggregation (see `docs/database` and Phase 6). Retention: see
`docs/privacy/phase-4-data-map.md`.
