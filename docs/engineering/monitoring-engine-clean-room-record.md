# Monitoring engine clean-room record

Phase 4. This document records that Fajita's monitoring engine is independently
authored and contains no source, structure, syntax, or data shapes copied from
Gatus or any other monitoring product.

## Clean-room statement

The Fajita monitoring engine (the Go worker under `services/monitor-worker`, the
monitoring database schema under `supabase/migrations`, the shared contracts
under `packages/monitor-contracts`, and the internal application APIs under
`src/lib/monitoring`) was designed and written from product requirements and
public technical standards only.

No external monitoring engine's code, package layout, algorithms, configuration
syntax, condition/assertion syntax, test fixtures, documentation wording,
dashboard logic, data structures, API response shapes, comments, assets, or
naming conventions were forked, imported, adapted, translated, or copied. This
explicitly includes Gatus and every competitor uptime product.

No competitor code snippets exist anywhere in this repository.

## Product requirements used

The engine implements the Phase 4 requirements in the Fajita product
constitution: securely execute scheduled checks for websites, HTTP/HTTPS APIs,
TLS certificates, keyword and JSON assertions, and cron/heartbeat signals, with
strong tenant isolation, deterministic PostgreSQL-backed scheduling, SSRF and
DNS-rebinding defense, encrypted monitor secrets, and complete operational
visibility. Incident detection, customer alerting, public status pages, billing,
affiliates, and the Pamphlet chatbot are explicitly out of scope for this phase.

## Public standards and concepts referenced

Only vendor-neutral public material informed the design:

- HTTP semantics: RFC 9110 (HTTP Semantics), RFC 9112 (HTTP/1.1).
- URI syntax: RFC 3986.
- TLS: RFC 8446 (TLS 1.3), RFC 5280 (X.509 certificate/CRL profile).
- IP address ranges: RFC 1918 (private IPv4), RFC 4193 (IPv6 ULA), RFC 3927
  and RFC 4291 (link-local), RFC 6598 (CGN 100.64.0.0/10), RFC 5737 / RFC 3849
  (documentation ranges), RFC 6890 (special-purpose registry).
- Cloud/container metadata endpoint addresses are public, widely documented
  facts (for example the 169.254.169.254 link-local metadata address).
- PostgreSQL row-locking for queue/lease patterns: the public `FOR UPDATE SKIP
  LOCKED` feature documented in the PostgreSQL manual.
- General SSRF defense guidance from public web-security literature (validate
  resolved IPs, pin the connection to a validated address, revalidate redirects,
  defend against DNS rebinding). No third-party code was used.

## Original architectural decisions

- A single PostgreSQL database is the source of truth. No Kafka, RabbitMQ, or
  Redis is introduced. Scheduling and leasing are Postgres-native.
- The scheduler leases due work from `check_schedules` with `FOR UPDATE SKIP
  LOCKED`, records an append-only lease grant in `monitor_leases` for duplicate
  detection and audit, executes outside the lease transaction, writes an
  immutable `check_executions` row plus a normalized `check_results` row, then
  advances the schedule from the intended tick (drift-free) with bounded
  catch-up and jitter.
- Execution is idempotent through a deterministic idempotency key
  (`monitor_id : monitor_version_id : scheduled_for : schedule_generation`),
  enforced by a unique constraint, so duplicate workers cannot create duplicate
  finalized results.
- Every target is validated at the application layer on every execution: scheme
  allowlist, port allowlist, URL hygiene, DNS resolution, per-address IP-range
  classification, connection pinning to a validated address, and redirect
  revalidation. Network egress restrictions are defense-in-depth, not the gate.
- Monitor configuration is versioned. Every execution references the exact
  `monitor_version_id` that produced it. Secrets live in a separate encrypted
  table and are referenced, never inlined into version snapshots.

## Original data model

Authored in `supabase/migrations/20260718000000_phase4_monitoring_engine.sql`:
`monitors`, `monitor_versions`, `monitor_assertions`, `monitor_secrets`,
`check_schedules`, `monitor_leases`, `check_executions`, `check_results`,
`check_assertion_results`, `monitor_workers`, `monitor_worker_heartbeats`,
`monitor_regions`, `monitor_security_events`, `heartbeat_tokens`,
`heartbeat_events`. Column names, enums, and constraints were chosen for Fajita's
own model and are not derived from any competitor schema.

## Original scheduler design

See `docs/engineering/postgres-scheduler.md`. Lease-based, at-least-once,
idempotent, drift-free advancement, lease expiry recovery, paused/deleted/
suspended exclusion, per-organization fairness, bounded jitter. Fajita does not
claim exactly-once execution; the model is designed for safe duplicates.

## Original assertion model

See `docs/engineering/assertion-system.md`. A typed, non-programmable assertion
system (no expression language, no `eval`, no regex by default). Assertion types,
operators, and value typing are Fajita's own vocabulary.

## Original result and error taxonomy

See `docs/engineering/check-execution-lifecycle.md`. Overall statuses
(`success`, `failure`, `error`, `timed_out`, `blocked`, `canceled`) and failure
categories (`dns_failure`, `blocked_destination`, `tls_expired`, ...) are
Fajita-defined and shared through `packages/monitor-contracts`.

## Original security controls

SSRF and DNS-rebinding defense (`docs/security/monitoring-ssrf-defense.md`,
`docs/security/dns-rebinding-defense.md`), authenticated-encryption secret
storage (`docs/security/monitor-secret-encryption.md`), restricted worker
identity (`docs/security/worker-authentication.md`), egress isolation
(`docs/security/outbound-network-isolation.md`), and abuse prevention
(`docs/security/monitoring-abuse-prevention.md`).

## Files and packages authored (Phase 4)

- `services/monitor-worker/**` (Go worker: `cmd/worker`, `internal/{config,
  crypto,destination,executor,httpcheck,tlscheck,assertions,lease,scheduler,
  results,workers,telemetry,health}`, `internal/testfixture`, tests).
- `packages/monitor-contracts/**` (shared TS + Go contract with a version).
- `supabase/migrations/20260718000000_phase4_monitoring_engine.sql`,
  `supabase/migrations/20260718000100_phase4_monitoring_rls.sql`.
- `supabase/tests/phase4_monitoring_rls.sql`.
- `src/lib/monitoring/**` (encryption, monitor service, test-before-save,
  heartbeat ingestion helpers).
- `src/app/api/heartbeat/[token]/route.ts`.
- `src/app/internal/monitor-engine-lab/**`, platform-admin worker view.
- `docs/engineering/**`, `docs/security/**`, `docs/database/**`,
  `docs/privacy/**`, `docs/observability/**`, `docs/performance/**`,
  `docs/testing/**`, `docs/handoff/**` (Phase 4 additions).

## Dependency and license note

The Go worker uses the Go standard library plus `github.com/jackc/pgx` (MIT) for
PostgreSQL access. No monitoring-specific third-party engine is used. See
`docs/handoff/monitor-worker-transfer.md` for the full dependency and license
inventory.

## Confirmation

No external monitoring engine code was incorporated. The implementation is a
clean-room, independently authored work owned by Fajita and transferable
independently of unrelated portfolio products.
