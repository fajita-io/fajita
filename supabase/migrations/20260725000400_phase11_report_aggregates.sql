-- Phase 11: bounded check aggregate for weekly reliability reports.
--
-- Same centralized definitions as app.monitor_result_stats (Phase 5) with an
-- exact [from, to) window so historical report periods never shift as new
-- data arrives. Excludes manual tests (is_test = true) per the centralized
-- uptime rule. service_role only; the report generator authorizes per org.

create or replace function app.report_check_stats(
  p_org uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  monitor_id uuid,
  total_considered bigint,
  passed bigint,
  failed bigint,
  errored bigint,
  timed_out bigint,
  blocked bigint,
  avg_success_ms numeric,
  p95_success_ms numeric
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
    avg(r.total_ms) filter (where r.status = 'success') as avg_success_ms,
    percentile_cont(0.95) within group (order by r.total_ms)
      filter (where r.status = 'success') as p95_success_ms
  from public.check_results r
  join public.check_executions e on e.id = r.execution_id
  where r.organization_id = p_org
    and e.is_test = false
    and r.checked_at >= p_from
    and r.checked_at < p_to
  group by r.monitor_id;
$$;

create or replace function public.report_check_stats(
  p_org uuid, p_from timestamptz, p_to timestamptz
)
returns table (
  monitor_id uuid, total_considered bigint, passed bigint, failed bigint,
  errored bigint, timed_out bigint, blocked bigint,
  avg_success_ms numeric, p95_success_ms numeric
)
language sql security definer set search_path = public, app stable
as $$ select * from app.report_check_stats(p_org, p_from, p_to); $$;

revoke all on function public.report_check_stats(uuid, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.report_check_stats(uuid, timestamptz, timestamptz)
  to service_role;
