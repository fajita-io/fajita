# Check execution lifecycle

Phase 4. How a single scheduled check moves from due to finalized.

## Stages

1. **Due.** `check_schedules.next_check_at <= now()` for an active monitor whose
   organization is not suspended and which is not paused or deleted.
2. **Lease.** A worker calls `app.lease_due_checks(worker_id, region, max,
   lease_seconds)`. The function selects due rows with `FOR UPDATE SKIP LOCKED`,
   writes a `monitor_leases` row, stamps `locked_at`, `locked_by_worker_id`, and
   `lease_expires_at`, and returns the monitor id, version id, scheduled time,
   schedule generation, and a computed idempotency key.
3. **Load.** The worker calls `app.worker_load_monitor(monitor_version_id)` to
   fetch the immutable configuration snapshot plus encrypted secret rows. The
   snapshot is the exact version that will produce the result.
4. **Execute.** The executor runs the check outside any database transaction:
   - Validate the destination URL (scheme, port, host hygiene).
   - Resolve DNS and classify every returned IP.
   - Dial the validated IP through the rebinding-safe dialer.
   - Perform the HTTP request or TLS inspection with bounded timeouts and body
     size.
   - Evaluate each typed assertion independently.
   - Classify the outcome into a status and failure category.
   - Retry only transient failures, up to the configured retry count.
5. **Finalize.** The worker calls `app.finalize_check(...)` with the idempotency
   key, timings, status, failure category, safe message, and assertion results.
   The function inserts `check_executions` and `check_results` rows, records
   `check_assertion_results`, updates the monitor's rollup fields
   (`last_result_status`, `consecutive_successes`/`failures`, timestamps), and
   advances `check_schedules` to the next slot. The unique idempotency key makes
   a duplicate finalize a no-op.
6. **Advance.** The next scheduled time is computed from the intended schedule
   plus jitter, with bounded catch-up so a worker returning after downtime does
   not replay every missed interval.

## Timing captured

Durations are stored in milliseconds with explicit `_ms` names and never mixed
with other units:

- DNS duration, connect duration, TLS duration
- Time to first byte, total duration
- HTTP status, final URL, redirect count, response byte count
- TLS summary (issuer, validity window, days remaining, hostname match, chain
  validity, TLS version, fingerprint)

## Failure isolation

Each execution runs inside a panic-recovery boundary. A single malformed
response, hostile server, or unexpected panic finalizes that one check as
`error`/`worker_error` and never crashes the worker process. See
`docs/engineering/postgres-scheduler.md` for crash and lease-expiry recovery.

## Idempotency

The idempotency key is derived from monitor id, monitor version, scheduled
execution time, and schedule generation. It is enforced by a unique constraint,
not by application checks alone. See "Idempotency" in
`docs/database/phase-4-schema.md`.
