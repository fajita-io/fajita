-- Check volume enforcement: track per-org check usage in billing_usage_counters,
-- increment on finalized production checks, and skip leasing when at plan limit.

alter table public.billing_usage_counters
  add column if not exists checks_this_period integer not null default 0,
  add column if not exists checks_period_start timestamptz,
  add column if not exists checks_period_end timestamptz;

-- Resolve the billing period used for check metering (subscription period or UTC month).
create or replace function app.resolve_org_check_period(
  p_org_id uuid,
  out period_start timestamptz,
  out period_end timestamptz
)
language plpgsql
stable
security definer
set search_path = public, app
as $$
begin
  select bs.current_period_start, bs.current_period_end
    into period_start, period_end
  from public.billing_subscriptions bs
  where bs.organization_id = p_org_id
    and bs.status in ('active', 'trialing', 'past_due', 'unpaid')
  order by bs.created_at desc
  limit 1;

  if period_start is not null and period_end is not null then
    return;
  end if;

  period_start := date_trunc('month', timezone('utc', now()));
  period_end := period_start + interval '1 month';
end;
$$;

-- Fallback when no entitlement snapshot exists yet (beta grant = Team checks).
create or replace function app.org_effective_max_monthly_checks(p_org_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public, app
as $$
declare
  v_ent jsonb;
  v_monitoring boolean;
  v_max integer;
  v_plan text;
begin
  select bes.entitlements
    into v_ent
  from public.billing_entitlement_snapshots bes
  where bes.organization_id = p_org_id
    and bes.source = 'current'
  limit 1;

  if v_ent is not null then
    v_monitoring := coalesce((v_ent->>'monitoring_enabled')::boolean, true);
    if not v_monitoring then
      return 0;
    end if;
    return greatest(coalesce((v_ent->>'max_monthly_checks')::integer, 0), 0);
  end if;

  select bs.plan_key
    into v_plan
  from public.billing_subscriptions bs
  where bs.organization_id = p_org_id
    and bs.status not in ('canceled', 'incomplete_expired', 'none')
  order by bs.created_at desc
  limit 1;

  if v_plan is null then
    return 500000;
  end if;

  case v_plan
    when 'starter' then return 100000;
    when 'pro' then return 500000;
    when 'business' then return 2000000;
    else return 0;
  end case;
end;
$$;

-- Sync counter row with the active period; recount from check_results when period rolls.
create or replace function app.ensure_org_check_counter(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_start timestamptz;
  v_end timestamptz;
  v_count integer;
begin
  select period_start, period_end
    into v_start, v_end
  from app.resolve_org_check_period(p_org_id);

  select count(*)::integer
    into v_count
  from public.check_results cr
  where cr.organization_id = p_org_id
    and cr.checked_at >= v_start
    and cr.checked_at < v_end;

  insert into public.billing_usage_counters (
    organization_id,
    checks_this_period,
    checks_period_start,
    checks_period_end,
    rebuilt_at
  ) values (
    p_org_id,
    v_count,
    v_start,
    v_end,
    now()
  )
  on conflict (organization_id) do update set
    checks_this_period = case
      when billing_usage_counters.checks_period_start is distinct from excluded.checks_period_start
        or billing_usage_counters.checks_period_end is distinct from excluded.checks_period_end
      then excluded.checks_this_period
      else billing_usage_counters.checks_this_period
    end,
    checks_period_start = excluded.checks_period_start,
    checks_period_end = excluded.checks_period_end,
    rebuilt_at = now(),
    updated_at = now();
end;
$$;

-- Increment usage after a production check result is persisted.
create or replace function app.record_org_check_usage(
  p_org_id uuid,
  p_checked_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_start timestamptz;
  v_end timestamptz;
begin
  select period_start, period_end
    into v_start, v_end
  from app.resolve_org_check_period(p_org_id);

  insert into public.billing_usage_counters (
    organization_id,
    checks_this_period,
    checks_period_start,
    checks_period_end,
    rebuilt_at
  ) values (
    p_org_id,
    1,
    v_start,
    v_end,
    now()
  )
  on conflict (organization_id) do update set
    checks_this_period = case
      when billing_usage_counters.checks_period_start is distinct from excluded.checks_period_start
        or billing_usage_counters.checks_period_end is distinct from excluded.checks_period_end
      then 1
      else billing_usage_counters.checks_this_period + 1
    end,
    checks_period_start = excluded.checks_period_start,
    checks_period_end = excluded.checks_period_end,
    updated_at = now();
end;
$$;

create or replace function app.org_at_check_limit(p_org_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, app
as $$
declare
  v_max integer;
  v_used integer;
begin
  v_max := app.org_effective_max_monthly_checks(p_org_id);
  if v_max <= 0 then
    return true;
  end if;

  select coalesce(buc.checks_this_period, 0)
    into v_used
  from public.billing_usage_counters buc
  where buc.organization_id = p_org_id;

  if v_used is null then
    perform app.ensure_org_check_counter(p_org_id);
    select coalesce(buc.checks_this_period, 0)
      into v_used
    from public.billing_usage_counters buc
    where buc.organization_id = p_org_id;
  end if;

  return coalesce(v_used, 0) >= v_max;
end;
$$;

-- Exclude orgs at check limit from scheduled leasing.
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
    left join public.billing_entitlement_snapshots bes
      on bes.organization_id = cs.organization_id
      and bes.source = 'current'
    left join public.billing_usage_counters buc
      on buc.organization_id = cs.organization_id
    where cs.enabled = true
      and cs.locked_at is null
      and cs.next_check_at <= now()
      and m.status = 'active'
      and m.deleted_at is null
      and m.monitor_type <> 'heartbeat'
      and o.status = 'active'
      and coalesce((bes.entitlements->>'monitoring_enabled')::boolean, true)
      and not app.org_at_check_limit(cs.organization_id)
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

-- Bump check usage when a production result is written.
create or replace function app.record_synthetic_result(
  p_monitor_id uuid,
  p_status text,
  p_failure_category text,
  p_safe_message text
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  m record;
  v_key text;
  v_exec uuid;
begin
  select id, organization_id, current_version_id
    into m from public.monitors where id = p_monitor_id;
  if not found then return null; end if;

  v_key := 'synthetic:' || p_monitor_id::text || ':' || (extract(epoch from now())::bigint)::text
    || ':' || coalesce(p_failure_category, p_status);

  insert into public.check_executions (
    idempotency_key, monitor_id, monitor_version_id, organization_id, region,
    scheduled_for, started_at, completed_at, attempt_count, status, phase, is_test
  ) values (
    v_key, m.id, m.current_version_id, m.organization_id, 'internal',
    now(), now(), now(), 1, p_status, 'synthetic', false
  )
  on conflict (idempotency_key) do nothing
  returning id into v_exec;
  if v_exec is null then return null; end if;

  insert into public.check_results (
    execution_id, monitor_id, monitor_version_id, organization_id, region,
    status, failure_category, safe_error_message, checked_at
  ) values (
    v_exec, m.id, m.current_version_id, m.organization_id, 'internal',
    p_status, p_failure_category, left(p_safe_message, 512), now()
  );

  perform app.record_org_check_usage(m.organization_id, now());

  insert into public.monitor_state_evaluations (execution_id, monitor_id, organization_id, source)
  values (v_exec, m.id, m.organization_id, 'heartbeat')
  on conflict (execution_id) do nothing;

  return v_exec;
end;
$$;

-- Re-define finalize_check to record check usage for production runs.
create or replace function app.finalize_check(
  p_idempotency_key text,
  p_monitor_id uuid,
  p_monitor_version_id uuid,
  p_organization_id uuid,
  p_worker_id uuid,
  p_region text,
  p_scheduled_for timestamptz,
  p_leased_at timestamptz,
  p_started_at timestamptz,
  p_completed_at timestamptz,
  p_attempt_count integer,
  p_status text,
  p_phase text,
  p_failure_category text,
  p_http_status integer,
  p_final_url text,
  p_redirect_count integer,
  p_response_bytes bigint,
  p_dns_ms integer,
  p_connect_ms integer,
  p_tls_ms integer,
  p_ttfb_ms integer,
  p_total_ms integer,
  p_tls_summary jsonb,
  p_diagnostic_snippet text,
  p_safe_error_message text,
  p_assertion_results jsonb,
  p_correlation_id uuid,
  p_is_test boolean,
  p_next_check_at timestamptz
) returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_execution_id uuid;
  v_result_id uuid;
  v_is_success boolean := (p_status = 'success');
begin
  insert into public.check_executions (
    idempotency_key, monitor_id, monitor_version_id, organization_id,
    worker_id, region, scheduled_for, leased_at, started_at, completed_at,
    attempt_count, status, phase, correlation_id, is_test
  ) values (
    p_idempotency_key, p_monitor_id, p_monitor_version_id, p_organization_id,
    p_worker_id, p_region, p_scheduled_for, p_leased_at, p_started_at, p_completed_at,
    coalesce(p_attempt_count, 1), p_status, p_phase, p_correlation_id, coalesce(p_is_test, false)
  )
  on conflict (idempotency_key) do nothing
  returning id into v_execution_id;

  if v_execution_id is null then
    select id into v_execution_id from public.check_executions
    where idempotency_key = p_idempotency_key;
    return v_execution_id;
  end if;

  insert into public.check_results (
    execution_id, monitor_id, monitor_version_id, organization_id, worker_id, region,
    status, failure_category, http_status, final_url, redirect_count, response_bytes,
    dns_ms, connect_ms, tls_ms, ttfb_ms, total_ms, tls_summary, diagnostic_snippet,
    safe_error_message, checked_at
  ) values (
    v_execution_id, p_monitor_id, p_monitor_version_id, p_organization_id, p_worker_id, p_region,
    p_status, p_failure_category, p_http_status, p_final_url, p_redirect_count, p_response_bytes,
    p_dns_ms, p_connect_ms, p_tls_ms, p_ttfb_ms, p_total_ms, p_tls_summary, p_diagnostic_snippet,
    p_safe_error_message, coalesce(p_scheduled_for, now())
  )
  returning id into v_result_id;

  if p_assertion_results is not null and jsonb_typeof(p_assertion_results) = 'array' then
    insert into public.check_assertion_results (
      result_id, execution_id, monitor_id, organization_id, assertion_id,
      assertion_type, passed, expected_summary, actual_summary, failure_reason,
      evaluation_ms, position
    )
    select
      v_result_id, v_execution_id, p_monitor_id, p_organization_id,
      nullif(ar.assertion_id, '')::uuid,
      ar.assertion_type, ar.passed, ar.expected_summary, ar.actual_summary,
      ar.failure_reason, ar.evaluation_ms, coalesce(ar.position, 0)
    from jsonb_to_recordset(p_assertion_results) as ar(
      assertion_id text,
      assertion_type text,
      passed boolean,
      expected_summary text,
      actual_summary text,
      failure_reason text,
      evaluation_ms integer,
      position integer
    );
  end if;

  if coalesce(p_is_test, false) then
    return v_execution_id;
  end if;

  perform app.record_org_check_usage(p_organization_id, coalesce(p_scheduled_for, now()));

  update public.check_schedules cs set
    next_check_at = p_next_check_at,
    locked_at = null,
    locked_by_worker_id = null,
    lease_expires_at = null,
    consecutive_lease_failures = 0,
    updated_at = now()
  where cs.monitor_id = p_monitor_id;

  update public.monitor_leases set
    released_at = now(),
    outcome = 'completed'
  where idempotency_key = p_idempotency_key;

  update public.monitors m set
    last_check_at = coalesce(p_completed_at, now()),
    last_result_status = p_status,
    last_response_time_ms = p_total_ms,
    next_check_at = p_next_check_at,
    last_success_at = case when v_is_success then coalesce(p_completed_at, now()) else m.last_success_at end,
    last_failure_at = case when not v_is_success then coalesce(p_completed_at, now()) else m.last_failure_at end,
    consecutive_successes = case when v_is_success then m.consecutive_successes + 1 else 0 end,
    consecutive_failures = case when v_is_success then 0 else m.consecutive_failures + 1 end
  where m.id = p_monitor_id;

  insert into public.monitor_state_evaluations (execution_id, monitor_id, organization_id, source)
  values (v_execution_id, p_monitor_id, p_organization_id, 'finalize')
  on conflict (execution_id) do nothing;

  return v_execution_id;
end;
$$;

grant execute on function app.resolve_org_check_period(uuid) to fajita_monitor_worker;
grant execute on function app.org_effective_max_monthly_checks(uuid) to fajita_monitor_worker;
grant execute on function app.ensure_org_check_counter(uuid) to fajita_monitor_worker;
grant execute on function app.record_org_check_usage(uuid, timestamptz) to fajita_monitor_worker;
grant execute on function app.org_at_check_limit(uuid) to fajita_monitor_worker;
grant execute on function app.lease_due_checks(uuid, text, integer, integer) to fajita_monitor_worker;
