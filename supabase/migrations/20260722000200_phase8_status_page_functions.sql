-- Phase 8: daily uptime rollup for status-page components.
--
-- Mirrors the centralized Phase 5 uptime definition (app.monitor_result_stats):
-- excludes manual test executions, counts success/failure/error/timed_out as
-- considered, success as passed. Aggregated per UTC day across the set of
-- monitors mapped to a component, so a component that maps several monitors
-- gets one honest daily uptime figure.
--
-- SECURITY DEFINER, org-scoped, called by the application service role after an
-- explicit organization authorization check. Not granted to public.

create or replace function app.status_page_component_uptime(
  p_org uuid,
  p_monitor_ids uuid[],
  p_since timestamptz
)
returns table (
  day date,
  passed bigint,
  total bigint,
  avg_ms numeric
)
language sql
security definer
set search_path = public, app
stable
as $$
  select
    (r.checked_at at time zone 'UTC')::date as day,
    count(*) filter (where r.status = 'success') as passed,
    count(*) filter (
      where r.status in ('success', 'failure', 'error', 'timed_out')
    ) as total,
    avg(r.total_ms) filter (where r.status = 'success') as avg_ms
  from public.check_results r
  join public.check_executions e on e.id = r.execution_id
  where r.organization_id = p_org
    and e.is_test = false
    and r.checked_at >= p_since
    and r.monitor_id = any (p_monitor_ids)
  group by 1
  order by 1;
$$;

revoke all on function app.status_page_component_uptime(uuid, uuid[], timestamptz) from public;
