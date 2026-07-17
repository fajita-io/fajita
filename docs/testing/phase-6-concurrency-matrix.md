# Phase 6 concurrency and idempotency matrix

How each concurrency risk is made safe, and what remains to be exercised with
real parallel transactions.

## Guaranteed by database constructs

| Scenario | Mechanism |
| --- | --- |
| Two workers finalize the same execution | Idempotency key on the execution; evaluation guarded by `last_evaluated_execution_id`. |
| Two failed results arrive simultaneously | Operational-state row lock + `incidents_active_dedup_idx`; only one incident opens. |
| Two drains grab the same queue row | `FOR UPDATE SKIP LOCKED`. |
| Duplicate outbox creation | `app.record_incident_outbox` idempotent key. |
| Recovery success and failure out of order | Transition derived from locked current state, not arrival order; idempotency prevents replaying older executions. |
| Maintenance starts during evaluation | Suppression read inside the locked evaluation txn. |
| Manual resolution during automatic recovery | Both mutate the same locked row; last writer is consistent, no duplicate incident. |
| Reconciliation during live evaluation | Reconcile locks the same rows; dry-run default; repairs create records. |

## Recommended tests (deferred)

Real parallel-transaction tests (two sessions opening incidents for the same
monitor), duplicate-drain races, out-of-order ingestion, and the Go race detector
over the worker drain loop. These would assert: no duplicate active incidents, no
invalid transitions, no lost timeline events, no duplicate counters or outbox
rows, no deadlock, bounded transaction duration.

Status: structural guarantees in place and verified by design and unit tests;
empirical concurrency test harness deferred (see report Known limitations).
