# Incident evaluation pipeline

The pipeline consumes finalized eligible check results and produces operational
state and incident transitions. It is idempotent, transactional, replayable,
versioned, and safe under concurrency.

## Enqueue

`app.finalize_check` writes the check execution, result, and assertion results,
then inserts a row into `public.monitor_state_evaluations` in the same
transaction. Test-before-save and manual test checks are not enqueued.

## Drain

`app.process_incident_evaluations(p_limit, p_evaluation_version)` selects pending
rows with `FOR UPDATE SKIP LOCKED`, calls `app.evaluate_check_result` for each,
and marks them processed. Concurrent drains never process the same row twice.
The worker calls it every `MONITOR_WORKER_EVAL_DRAIN_SECONDS` (default 5s) with a
batch limit `MONITOR_WORKER_EVAL_BATCH` (default 100).

## Per-result evaluation (`app.evaluate_check_result`)

In one transaction:

1. Lock the `monitor_operational_states` row (insert a default row if absent).
2. Idempotency: if `last_evaluated_execution_id` already equals this execution,
   return without side effects.
3. Load monitor lifecycle and organization status. Skip non-active monitors.
4. Look up an active maintenance occurrence for the monitor.
5. Classify the result: eligibility (`success | eligible | config | platform |
   ignore`), failure family, and degraded vs down.
6. Update consecutive failure/success counters.
7. Apply maintenance suppression when policy requires it.
8. Determine the transition and open, continue, recover, or resolve the incident.
9. Append the timeline event, attach evidence (a reference to the check
   execution, not a copy of the payload), write the outbox event, and upsert the
   public projection.
10. Advance the operational state with an optimistic `lock_version`.

## Idempotency

See `incident-idempotency.md`. Duplicate executions, duplicate drains, and
re-runs are all guarded by `last_evaluated_execution_id`, the queue's
`FOR UPDATE SKIP LOCKED`, and the active-incident dedup index.

## Heartbeat path

`app.detect_missed_heartbeats` finds overdue heartbeat tokens, marks them missed,
and calls `app.record_synthetic_result` to create a synthetic execution + result
(category `heartbeat_missed`) which enqueues normally. Heartbeat misses therefore
flow through the identical machine as HTTP failures.

## Replay and reconciliation

- `public.replay_check_evaluation(execution_id)` re-runs the evaluator for a
  finalized result. Platform-admin only, version aware, no external delivery.
- `public.reconcile_incident_state(...)` repairs safe derived-state drift (stale
  active-incident pointers, missing projections). See `incident-idempotency.md`
  and the observability doc.
