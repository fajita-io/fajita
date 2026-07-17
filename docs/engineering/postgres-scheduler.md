# PostgreSQL-backed scheduler

Phase 4. The scheduler uses PostgreSQL as the source of truth and a lease-based
claim model. No Kafka, RabbitMQ, or Redis.

## Tables

- `check_schedules`: one row per active monitor. Holds `next_check_at`,
  `interval_seconds`, `priority`, `schedule_generation`, `monitor_version_id`,
  and the lock fields (`locked_at`, `locked_by_worker_id`, `lease_expires_at`,
  `attempt_count`).
- `monitor_leases`: an explicit record of each active claim, used for
  observability and stale-lease reaping.

## Leasing

`app.lease_due_checks(p_worker_id, p_region, p_max, p_lease_seconds)`:

```sql
with due as (
  select s.monitor_id, ...
  from check_schedules s
  join monitors m on m.id = s.monitor_id
  join organizations o on o.id = m.organization_id
  where s.next_check_at <= now()
    and s.locked_at is null                 -- not already leased
    and m.status = 'active'
    and m.deleted_at is null
    and m.paused_at is null
    and o.status = 'active'                  -- suspended orgs excluded
  order by s.priority desc, s.next_check_at
  limit p_max
  for update skip locked                     -- concurrent workers never collide
)
update check_schedules set locked_at = now(),
       locked_by_worker_id = p_worker_id,
       lease_expires_at = now() + make_interval(secs => p_lease_seconds)
from due where ...
returning ...;
```

`FOR UPDATE SKIP LOCKED` lets many workers poll the same table without blocking
each other. Rows another worker already holds are skipped rather than waited on.

The function has `#variable_conflict use_column` set so the `RETURNS TABLE`
output names (for example `idempotency_key`) resolve to real columns in the
`ON CONFLICT` and final `SELECT` rather than to output parameters. This fix
also ships as forward migration `20260718000200_phase4_fix_lease_fn.sql`.

## Guarantees

- **At-least-once execution.** A crashed worker's lease expires and the check is
  re-leased.
- **Idempotent results.** Duplicate execution cannot create duplicate final
  records (unique idempotency key).
- **Lease expiration.** `app.expire_stale_leases()` clears locks whose
  `lease_expires_at < now()` so orphaned work is reclaimed.
- **Clock-skew tolerance.** Scheduling uses database `now()` consistently; the
  worker does not trust its own wall clock for due calculation.
- **Bounded catch-up.** Schedule advancement resyncs to `now + interval` when a
  monitor is far behind instead of replaying every missed slot.
- **Fairness.** Batched leasing with `priority desc, next_check_at` ordering, and
  a bounded batch size, prevents one organization from starving others.

Exactly-once is **not** promised. The design is safe under duplicates.

## Excluded from leasing

Paused monitors, soft-deleted monitors, and monitors of suspended organizations
are filtered in the `due` CTE and never leased.

## Schedule advancement and jitter

After finalize, `next_check_at` is computed from the intended slot plus a small
controlled jitter (a bounded fraction of the interval) to prevent synchronized
load spikes. Allowed intervals: 60, 300, 600, 900, 1800, 3600 seconds. See
`docs/engineering/monitoring-engine-architecture.md`.

## Tests

`supabase/tests/phase4_scheduler.sql` seeds a monitor, registers a worker, leases
the due check, asserts the schedule is locked, attempts a duplicate finalize
(verifies idempotency), confirms schedule advancement, and confirms stale-lease
reclamation. Run with the Supabase test harness.
