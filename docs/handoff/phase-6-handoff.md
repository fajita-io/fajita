# Phase 6 handoff

## What shipped

An independently authored incident engine: a versioned state machine in
PostgreSQL, a durable evaluation queue, worker-driven draining, failure and
recovery confirmation, degraded/down distinction, flapping containment,
deduplication, maintenance suppression, manual incident operations, an immutable
timeline with evidence, a Phase 7 outbox, a Phase 8 public projection, RLS on all
new tables, and the incident/maintenance application surfaces.

## Key locations

| Concern | Path |
| --- | --- |
| Schema | `supabase/migrations/20260720000000_phase6_incident_schema.sql` |
| Engine (SQL) | `supabase/migrations/20260720000100_phase6_incident_engine.sql` |
| RLS | `supabase/migrations/20260720000200_phase6_incident_rls.sql` |
| Public API | `supabase/migrations/20260720000300_phase6_incident_api.sql` |
| Pure mirror + tests | `src/lib/incidents/state-machine.ts`, `tests/incidents-*.test.ts` |
| Data layer | `src/lib/incidents/`, `src/lib/app/actions/incidents.ts`, `.../maintenance.ts` |
| UI | `src/app/(app)/app/incidents/**`, `.../maintenance/**` |
| Worker driver | `services/monitor-worker/internal/scheduler` (`evaluateOnce`), `internal/lease/store.go` |
| Lab | `src/app/internal/incident-lab/**` |

## Environment variables

Worker: `MONITOR_WORKER_EVAL_DRAIN_SECONDS` (default 5),
`MONITOR_WORKER_EVAL_BATCH` (default 100). No new app env vars. No new
infrastructure or dependencies.

## How to operate

- Change confirmation/recovery policy: monitor columns
  (`failure_confirmation_threshold`, `recovery_confirmation_threshold`,
  `incident_reopen_window_seconds`) and the defaults in the SQL evaluator +
  `state-machine.ts` (bump `EVALUATION_VERSION` if transition rules change).
- Replay an evaluation: `public.replay_check_evaluation(execution_id)`
  (service/platform-admin).
- Repair derived state: `public.reconcile_incident_state(...)` (dry-run first).
- Disable processing: stop the worker drain (set a long drain interval) or pause
  monitors; the queue persists.
- Inspect outbox growth: count `incident_delivery_outbox` where status =
  `pending`.

## Phase 7 contract

Consume `incident_delivery_outbox` (`pending`, respect `suppressed`). Treat the
allowlisted payload as source of truth; do not read internal tables for
customer-facing content. See `../engineering/incident-outbox.md`.

## Phase 8 contract

Read `incident_public_projections` where `public_visibility = 'published'`. Never
read internal incident tables. See `../engineering/public-incident-projection.md`.

## Known limitations

See the Phase 6 end-of-phase report: empirical load/latency numbers, SQL-level
RLS/concurrency test harness, incident report export, and recurring maintenance
are deferred. One-time maintenance is fully implemented.
