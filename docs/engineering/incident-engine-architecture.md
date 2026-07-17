# Incident engine architecture

Phase 6. Independently authored. Converts finalized monitor results into reliable
operational states and incidents without treating every failed request as an
outage.

Core principle: one bad request is noise, a confirmed outage is a signal.

## Where the logic lives

The runtime state machine lives in PostgreSQL, in the `app` schema, as
`SECURITY DEFINER` functions. SQL owns the transitions because it can guarantee
transactional integrity, row locking, and idempotency across the incident,
timeline, evidence, outbox, and projection writes in a single statement. A
duplicate result or two concurrent workers cannot open two incidents.

| Layer | Location | Role |
| --- | --- | --- |
| Runtime evaluator | `app.evaluate_check_result` (migration `20260720000100_phase6_incident_engine.sql`) | The authoritative state machine. |
| Enqueue | `app.finalize_check` inserts into `public.monitor_state_evaluations` | Decouples evaluation from check execution in the same transaction. |
| Drain | `app.process_incident_evaluations(limit, version)` | Pulls queued rows with `FOR UPDATE SKIP LOCKED` and evaluates each. |
| Heartbeat misses | `app.detect_missed_heartbeats` + `app.record_synthetic_result` | Turns overdue pings into synthetic failure results, then enqueues them. |
| Reconciliation | `app.reconcile_incident_state` | Detects and repairs safe derived-state drift. |
| Public API | `public.*` wrappers (migration `20260720000300_phase6_incident_api.sql`) | Granted to `service_role` for the Next.js app; manual operations run atomically. |
| Worker driver | `services/monitor-worker` scheduler `evaluateOnce` | Ticks heartbeat detection then the drain via the `fajita_monitor_worker` role. |
| Pure mirror | `src/lib/incidents/state-machine.ts` | Documented, unit-tested TypeScript copy of the transition rules. Used for tests and the incident lab. Never the runtime authority. |

The pure TypeScript evaluator and the SQL evaluator must be changed together and
share `EVALUATION_VERSION` (currently 1). If they diverge, the SQL evaluator
wins at runtime; the mirror exists to make the rules legible and testable.

## Three separate state layers

The implementation never overloads one field for three concerns:

1. Monitor lifecycle: `public.monitors.status` (draft, active, paused, etc.).
2. Latest check result: `public.check_results.status` / category.
3. Operational state: `public.monitor_operational_states.state`.

A monitor can be lifecycle active, latest check failed, and operational state
`verifying_failure` with no incident open.

## Evaluation flow

```
check finalized (app.finalize_check)
  -> enqueue monitor_state_evaluations (same txn)
worker tick (evaluateOnce)
  -> app.detect_missed_heartbeats        (synthesize + enqueue heartbeat misses)
  -> app.process_incident_evaluations    (drain with SKIP LOCKED)
       -> app.evaluate_check_result       (per row, one transaction):
            lock operational state row
            idempotency guard (last_evaluated_execution_id)
            maintenance suppression check
            classify result (eligibility, family, degraded/down)
            update counters
            transition + open/continue/recover/resolve incident
            append timeline event + evidence + outbox + projection
            advance operational state (optimistic lock_version)
```

## Why a queue

Evaluation must not block check execution and must survive worker restarts. The
queue is a durable Postgres table, drained by the worker on a short ticker
(`MONITOR_WORKER_EVAL_DRAIN_SECONDS`, default 5s). The same public wrapper lets
the app trigger a drain for internal testing. No external event platform is
used; a Postgres outbox is sufficient at this scale.

## What this phase does not do

No external alert delivery (Phase 7). No public status page rendering or
subscriber notifications (Phase 8). The outbox and public projection tables
exist and are populated, but nothing is delivered or published. See
`incident-outbox.md` and `public-incident-projection.md`.
