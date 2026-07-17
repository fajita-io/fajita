-- Phase 5: expose monitor_result_stats to the application service role only.
--
-- The Phase 4 worker functions live in the app schema and are called over a
-- direct database connection. The application, by contrast, calls functions
-- through PostgREST (supabase-js), which only exposes the public schema. This
-- migration moves the aggregate into public so the service role can call it via
-- rpc(), while revoking execute from anon and authenticated so customers can
-- never call it directly with an arbitrary organization id. It remains
-- SECURITY DEFINER and org-scoped by its first argument; the application always
-- passes the caller's verified organization id.

drop function if exists app.monitor_result_stats(uuid, timestamptz, uuid);

create or replace function public.monitor_result_stats(
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

revoke all on function public.monitor_result_stats(uuid, timestamptz, uuid) from public;
revoke all on function public.monitor_result_stats(uuid, timestamptz, uuid) from anon;
revoke all on function public.monitor_result_stats(uuid, timestamptz, uuid) from authenticated;
grant execute on function public.monitor_result_stats(uuid, timestamptz, uuid) to service_role;
