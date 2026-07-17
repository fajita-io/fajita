-- Phase 5: bounded aggregate for monitor uptime and response time.
--
-- One centralized definition of the numbers the customer product shows, so a
-- monitor list, an overview page, and a detail page can never disagree. The
-- function aggregates finalized check_results in a time window, excluding
-- manual test executions (check_executions.is_test = true) per the centralized
-- uptime rule. It is SECURITY DEFINER and reads only within one organization;
-- the application calls it through the service role after an explicit org
-- authorization check. It is not granted to the worker or the customer role.

create or replace function app.monitor_result_stats(
  p_org uuid,
  p_since timestamptz,
  p_monitor uuid default null
)
returns table (
  monitor_id uuid,
  total_considered bigint,
  passed bigint,
  failed bigint,
  errored bigint,
  timed_out bigint,
  blocked bigint,
  avg_total_ms numeric,
  last_checked_at timestamptz
)
language sql
security definer
set search_path = public, app
stable
as $$
  select
    r.monitor_id,
    count(*) filter (
      where r.status in ('success', 'failure', 'error', 'timed_out')
    ) as total_considered,
    count(*) filter (where r.status = 'success') as passed,
    count(*) filter (where r.status = 'failure') as failed,
    count(*) filter (where r.status = 'error') as errored,
    count(*) filter (where r.status = 'timed_out') as timed_out,
    count(*) filter (where r.status = 'blocked') as blocked,
    avg(r.total_ms) filter (where r.status = 'success') as avg_total_ms,
    max(r.checked_at) as last_checked_at
  from public.check_results r
  join public.check_executions e on e.id = r.execution_id
  where r.organization_id = p_org
    and e.is_test = false
    and r.checked_at >= p_since
    and (p_monitor is null or r.monitor_id = p_monitor)
  group by r.monitor_id;
$$;

revoke all on function app.monitor_result_stats(uuid, timestamptz, uuid) from public;
