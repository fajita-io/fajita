# Incident engine acquisition transfer

Everything a future owner needs to run and reason about the incident engine.

## Components

- Incident tables and monitor columns: `phase6_incident_schema` migration.
- State-machine version: `EVALUATION_VERSION = 1` (SQL + `state-machine.ts`).
- Evaluation service: `app.evaluate_check_result`, drained by
  `app.process_incident_evaluations`.
- Processing runtime: the Go monitor worker (`services/monitor-worker`), ticker
  `evaluateOnce` (heartbeat detection then drain).
- Outbox: `incident_delivery_outbox` (Phase 7). Projection:
  `incident_public_projections` (Phase 8).
- Reconciliation: `app.reconcile_incident_state`. Replay:
  `public.replay_check_evaluation`.
- Maintenance scheduler: `public.maintenance_tick` activates/completes
  occurrences.

## Environment and infrastructure

New env: `MONITOR_WORKER_EVAL_DRAIN_SECONDS`, `MONITOR_WORKER_EVAL_BATCH`. No new
managed services, queues, or third-party dependencies. No secrets added.

## Background-job ownership

The worker owns heartbeat detection, evaluation draining, and lease reaping.
Maintenance ticking is invoked via the public wrapper (schedule from a
service/cron context). No separate job runner was introduced.

## Operational metrics and thresholds

Worker `/metrics`: `incident_evaluations`, `heartbeat_misses`,
`database_errors`, `queue_lag_seconds`. Alerting thresholds are proposed in
`../observability/incident-engine.md` and wired in Phase 7.

## Failure recovery and rollback

The engine is additive. Rolling back means reverting the four migrations and the
worker changes; check execution continues unaffected because finalize only
enqueues. The queue is durable across restarts.

## Cost impact

One short DB query loop per worker every few seconds plus small per-transition
writes. No new infrastructure cost.

## A buyer can determine

Why an incident opened or did not (timeline + evidence + evaluation version), how
to change confirmation/recovery policies (monitor columns and evaluator
defaults), how to replay and reconcile, how to disable processing, how to inspect
outbox growth, how to manage maintenance, and how internal/public/delivery
content stay separated.
