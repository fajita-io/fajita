# Incident engine observability

Operational health of the engine, distinct from customer product analytics.

## Worker metrics

Exposed on the worker `/metrics` endpoint (`internal/telemetry`). Phase 6 adds:

- `heartbeat_misses` — heartbeat tokens newly marked missed per tick.
- `incident_evaluations` — queued evaluations processed per tick.
- `database_errors` — increments when a drain or heartbeat call fails.

Existing counters (`checks_*`, `lease_expirations`, `queue_lag_seconds`, etc.)
remain. The evaluation drain runs every `MONITOR_WORKER_EVAL_DRAIN_SECONDS`
(default 5s), batch `MONITOR_WORKER_EVAL_BATCH` (default 100). Heartbeat
detection runs first each tick so fresh misses evaluate immediately.

## Signals worth alerting on (Phase 7 wiring)

Evaluation queue lag (pending rows in `monitor_state_evaluations` growing),
repeated `database_errors`, reconciliation repairs above baseline, and
dead-letter evaluations. Use bounded labels only. Never label metrics with
customer names, URLs, or incident titles.

## Reconciliation

`public.reconcile_incident_state` runs in dry-run by default and reports drift:
stale active-incident pointers, missing projections, and counter mismatches.
Repairs create records; history is never silently rewritten. Run it on a schedule
(platform-admin/service context) and record repair counts.

## Replay

`public.replay_check_evaluation(execution_id)` re-runs the evaluator for a
finalized result. Platform-admin only, idempotent, version aware, no external
delivery, no publishing.

## Targets not yet measured

Evaluation latency, incident-open latency, recovery-resolution latency, queue
lag under burst, and reconciliation throughput are documented as targets in
`../performance/incident-engine-budget.md`. They are not yet benchmarked.
