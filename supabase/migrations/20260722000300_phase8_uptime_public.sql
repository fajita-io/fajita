-- Phase 8: expose the status-page component uptime rollup to the service role.
--
-- Like public.monitor_result_stats (Phase 5), the application calls this through
-- PostgREST (supabase-js rpc), which only exposes the public schema. The app
-- variant added in 20260722000200 lives in the app schema and is not reachable
-- over rpc(). This migration recreates the aggregate in public, granted to the
-- service role only, so the projection builder can call it after an explicit
-- organization authorization check. anon and authenticated can never call it.

drop function if exists app.status_page_component_uptime(uuid, uuid[], timestamptz);

create or replace function public.status_page_component_uptime(
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

revoke all on function public.status_page_component_uptime(uuid, uuid[], timestamptz) from public;
revoke all on function public.status_page_component_uptime(uuid, uuid[], timestamptz) from anon;
revoke all on function public.status_page_component_uptime(uuid, uuid[], timestamptz) from authenticated;
grant execute on function public.status_page_component_uptime(uuid, uuid[], timestamptz) to service_role;
