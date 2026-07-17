-- Phase 4 fix: resolve PL/pgSQL name ambiguity between the RETURNS TABLE output
-- columns of app.lease_due_checks and the underlying table columns by declaring
-- the column-preference directive. Behavior is otherwise identical.

create or replace function app.lease_due_checks(
  p_worker_id uuid,
  p_region text,
  p_max integer,
  p_lease_seconds integer
) returns table (
  monitor_id uuid,
  organization_id uuid,
  monitor_version_id uuid,
  scheduled_for timestamptz,
  schedule_generation bigint,
  idempotency_key text
)
language plpgsql
security definer
set search_path = public, app
as $$
#variable_conflict use_column
begin
  return query
  with due as (
    select cs.monitor_id
    from public.check_schedules cs
    join public.monitors m on m.id = cs.monitor_id
    join public.organizations o on o.id = cs.organization_id
    where cs.enabled = true
      and cs.locked_at is null
      and cs.next_check_at <= now()
      and m.status = 'active'
      and m.deleted_at is null
      and m.monitor_type <> 'heartbeat'
      and o.status = 'active'
    order by cs.priority, cs.next_check_at
    for update of cs skip locked
    limit greatest(p_max, 0)
  ),
  leased as (
    update public.check_schedules cs set
      locked_at = now(),
      locked_by_worker_id = p_worker_id,
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      attempt_count = cs.attempt_count + 1,
      updated_at = now()
    from due
    where cs.monitor_id = due.monitor_id
    returning
      cs.monitor_id,
      cs.organization_id,
      cs.monitor_version_id,
      cs.next_check_at as scheduled_for,
      cs.schedule_generation
  ),
  keyed as (
    select
      l.monitor_id,
      l.organization_id,
      l.monitor_version_id,
      l.scheduled_for,
      l.schedule_generation,
      l.monitor_id::text || ':' || l.monitor_version_id::text || ':'
        || (extract(epoch from l.scheduled_for)::bigint)::text || ':'
        || l.schedule_generation::text as idempotency_key
    from leased l
  ),
  ledger as (
    insert into public.monitor_leases (
      monitor_id, organization_id, monitor_version_id, schedule_generation,
      scheduled_for, idempotency_key, worker_id, region, lease_expires_at
    )
    select
      k.monitor_id, k.organization_id, k.monitor_version_id, k.schedule_generation,
      k.scheduled_for, k.idempotency_key, p_worker_id, p_region,
      now() + make_interval(secs => p_lease_seconds)
    from keyed k
    on conflict (idempotency_key) do nothing
    returning 1
  )
  select k.monitor_id, k.organization_id, k.monitor_version_id,
         k.scheduled_for, k.schedule_generation, k.idempotency_key
  from keyed k;
end;
$$;

grant execute on function app.lease_due_checks(uuid, text, integer, integer) to fajita_monitor_worker;
