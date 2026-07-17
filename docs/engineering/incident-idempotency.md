# Incident idempotency and concurrency

The engine must never open two active incidents for the same problem, double
count a result, lose a timeline event, or duplicate an outbox record, even under
concurrent workers and duplicate deliveries.

## Guards

| Risk | Guard |
| --- | --- |
| Same execution evaluated twice | `monitor_operational_states.last_evaluated_execution_id` short-circuits re-evaluation. |
| Two drains grab the same queue row | `SELECT ... FOR UPDATE SKIP LOCKED` in `app.process_incident_evaluations`. |
| Two results open two incidents | Partial unique index `incidents_active_dedup_idx` on `(organization_id, primary_monitor_id, correlation_key)` where the incident is active. |
| Concurrent state writes | The operational-state row is locked for the transaction; an optimistic `lock_version` detects lost updates. |
| Duplicate outbox rows | `app.record_incident_outbox` is keyed by `(incident_id, event_type, idempotency_key)`; re-inserts are no-ops. |
| Out-of-order results | Counters and transitions are derived from the locked current state, not from arrival order; the idempotency key prevents replaying older executions over newer state. |

## Transaction boundaries

`app.evaluate_check_result` performs the classification, transition, timeline
event, evidence, outbox, projection, and state advance inside one transaction.
Either all of it commits or none of it does. There is no window where an incident
exists without its opening event or its outbox record.

## Concurrency scenarios covered

Duplicate finalization, simultaneous failures, out-of-order success/failure,
maintenance starting mid-evaluation, monitor pause during opening, manual
resolution racing automatic recovery, severity change during new evidence,
duplicate drain runs, and reconciliation running during live evaluation. The
dedup index and row locks make duplicate active incidents and invalid
transitions unreachable rather than merely unlikely.

## Reconciliation

`app.reconcile_incident_state` is a safety net, not the primary guarantee. It
runs in dry-run by default and repairs: monitors with an active incident but a
null `active_incident_id`, and incidents missing a public projection. Repairs
create records; incident history is never silently rewritten.
