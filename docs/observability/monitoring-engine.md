# Monitoring engine observability

Phase 4. Structured logging, metrics, and security events for the worker and the
web integration.

## Structured logging

`internal/telemetry` provides `NewLogger` (JSON via `slog`) and a `RedactURL`
utility. Execution logs carry safe fields: correlation id, execution id, monitor
id, pseudonymous organization id, worker id, region, attempt, phase, duration,
result category.

### Never logged

Full URLs with sensitive query strings, authorization headers, request bodies,
response bodies, secret header values, heartbeat tokens, invitation tokens,
encryption keys, database credentials, customer names, customer emails.

### URL redaction

`RedactURL` strips query parameters, user info, fragments, and embedded
credentials. `TestRedactURLNeverLeaksQuery` asserts sensitive query keys never
survive redaction.

## Metrics

`internal/telemetry` exposes atomic counters via `Metrics.Snapshot`, served at
`/metrics` (token-protected when `MONITOR_WORKER_METRICS_TOKEN` is set):

Checks scheduled/leased/completed/succeeded/failed/blocked/timed out; retry
attempts; queue lag; lease expirations; duplicate executions; worker active
leases and utilization; execution/DNS/connect/TLS durations; response size;
assertion failures; SSRF blocks; redirect blocks; heartbeat ingestion; database
errors.

### Label discipline

Metrics use bounded labels only. Never labeled by full URL, customer name,
organization name, user email, monitor name, or high-cardinality query strings.

## Security events

`monitor_security_events` records blocked private/metadata addresses, unsupported
schemes, blocked ports, DNS-rebinding attempts, redirects to blocked
destinations, excessive redirects, oversized responses, repeated abusive tests,
invalid heartbeat-token volume, and rate-limit enforcement. Events are
organization-scoped where applicable, visible to platform admins, summarized
safely, and never contain secrets. Written from the app
(`src/lib/monitoring/security-events.ts`) and from the worker
(`app.record_monitor_security_event`).

## Health

`/healthz`, `/readyz`, `/version`, `/metrics`. Readiness reflects the worker's
ability to lease and execute (DB reachable, config valid, contract compatible,
not draining). See `docs/engineering/worker-deployment.md`.

## Failure behavior

Telemetry failure never blocks check completion. Database failure never
fabricates success. When dependencies fail the worker enters a degraded state and
readiness reflects the inability to execute. Errors are not swallowed silently.
