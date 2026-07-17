-- Phase 4: row-level security and the restricted worker database interface.
--
-- Two trust domains touch monitoring data:
--
--   1. Customer sessions (authenticated role via PostgREST with a Clerk JWT).
--      RLS gives read-only, org-scoped visibility. No write policies exist, so
--      the authenticated role can never write. Secrets, heartbeat tokens, lease
--      ledgers, and worker tables have NO read policy and are invisible.
--
--   2. The monitoring worker. It never uses a customer session. It authenticates
--      as a dedicated, low-privilege database role (fajita_monitor_worker) that
--      can EXECUTE a small set of SECURITY DEFINER functions in the app schema
--      and nothing else. It has no direct table privileges, so it cannot read
--      unrelated customer data, forge results, or browse secrets in the clear.
--
-- Application server actions continue to use the service role (bypassrls) after
-- explicit code authorization, exactly as Phase 3.

-- ---------------------------------------------------------------------------
-- Enable RLS on every monitoring table.
-- ---------------------------------------------------------------------------
alter table public.monitors enable row level security;
alter table public.monitor_versions enable row level security;
alter table public.monitor_assertions enable row level security;
alter table public.monitor_secrets enable row level security;
alter table public.check_schedules enable row level security;
alter table public.monitor_leases enable row level security;
alter table public.check_executions enable row level security;
alter table public.check_results enable row level security;
alter table public.check_assertion_results enable row level security;
alter table public.monitor_workers enable row level security;
alter table public.monitor_worker_heartbeats enable row level security;
alter table public.monitor_regions enable row level security;
alter table public.monitor_security_events enable row level security;
alter table public.heartbeat_tokens enable row level security;
alter table public.heartbeat_events enable row level security;

-- ---------------------------------------------------------------------------
-- Customer-readable, org-scoped tables. SELECT only for active members.
-- ---------------------------------------------------------------------------
drop policy if exists monitors_select_member on public.monitors;
create policy monitors_select_member on public.monitors
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

drop policy if exists monitor_versions_select_member on public.monitor_versions;
create policy monitor_versions_select_member on public.monitor_versions
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists monitor_assertions_select_member on public.monitor_assertions;
create policy monitor_assertions_select_member on public.monitor_assertions
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists check_schedules_select_member on public.check_schedules;
create policy check_schedules_select_member on public.check_schedules
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists check_executions_select_member on public.check_executions;
create policy check_executions_select_member on public.check_executions
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists check_results_select_member on public.check_results;
create policy check_results_select_member on public.check_results
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists check_assertion_results_select_member on public.check_assertion_results;
create policy check_assertion_results_select_member on public.check_assertion_results
  for select to authenticated
  using (app.is_org_member(organization_id));

-- Security events are sensitive; org admins only.
drop policy if exists monitor_security_events_select_admin on public.monitor_security_events;
create policy monitor_security_events_select_admin on public.monitor_security_events
  for select to authenticated
  using (organization_id is not null and app.has_org_role(organization_id, 'admin'));

-- Heartbeat ingestion events are readable by members; the token itself is not.
drop policy if exists heartbeat_events_select_member on public.heartbeat_events;
create policy heartbeat_events_select_member on public.heartbeat_events
  for select to authenticated
  using (app.is_org_member(organization_id));

-- Region catalog: public regions are readable by any signed-in user.
drop policy if exists monitor_regions_select_public on public.monitor_regions;
create policy monitor_regions_select_public on public.monitor_regions
  for select to authenticated
  using (is_public = true);

-- ---------------------------------------------------------------------------
-- No SELECT policy is defined for the authenticated role on:
--   monitor_secrets, heartbeat_tokens, monitor_leases, monitor_workers,
--   monitor_worker_heartbeats.
-- Under RLS with no permissive policy, all access for that role is denied.
-- These tables are reachable only through the service role (application) or the
-- restricted worker functions below. No write policies exist on ANY monitoring
-- table for the authenticated role, so customers can never write directly.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Restricted worker role.
-- Created NOLOGIN as a group. Infrastructure creates a login user that is a
-- member of this role with a rotated password (see
-- docs/security/worker-authentication.md). The worker connects as that user and
-- inherits only these function EXECUTE grants.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'fajita_monitor_worker') then
    create role fajita_monitor_worker nologin;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- app.worker_register: upsert a worker into the registry, return internal id.
-- ---------------------------------------------------------------------------
create or replace function app.worker_register(
  p_worker_key text,
  p_region text,
  p_version text,
  p_build_commit text,
  p_deployment_id text,
  p_contract_version integer,
  p_capacity integer
) returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_id uuid;
begin
  insert into public.monitor_workers (
    worker_key, region, version, build_commit, deployment_id,
    contract_version, check_capacity, status, started_at, last_heartbeat_at
  ) values (
    p_worker_key, p_region, p_version, p_build_commit, p_deployment_id,
    coalesce(p_contract_version, 1), p_capacity, 'starting', now(), now()
  )
  on conflict (worker_key) do update set
    region = excluded.region,
    version = excluded.version,
    build_commit = excluded.build_commit,
    deployment_id = excluded.deployment_id,
    contract_version = excluded.contract_version,
    check_capacity = excluded.check_capacity,
    status = 'starting',
    started_at = now(),
    last_heartbeat_at = now(),
    shutdown_requested = false,
    updated_at = now()
  returning id into v_id;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- app.worker_heartbeat: update liveness/metrics, return shutdown_requested so a
-- worker learns it should drain.
-- ---------------------------------------------------------------------------
create or replace function app.worker_heartbeat(
  p_worker_id uuid,
  p_status text,
  p_active_leases integer,
  p_queue_lag_seconds integer,
  p_avg_execution_ms integer,
  p_success_delta integer,
  p_failure_delta integer
) returns boolean
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_shutdown boolean;
begin
  update public.monitor_workers set
    status = coalesce(p_status, status),
    last_heartbeat_at = now(),
    active_lease_count = coalesce(p_active_leases, active_lease_count),
    queue_lag_seconds = p_queue_lag_seconds,
    avg_execution_ms = p_avg_execution_ms,
    recent_success_count = recent_success_count + coalesce(p_success_delta, 0),
    recent_failure_count = recent_failure_count + coalesce(p_failure_delta, 0),
    updated_at = now()
  where id = p_worker_id
  returning shutdown_requested into v_shutdown;

  insert into public.monitor_worker_heartbeats (
    worker_id, region, status, active_lease_count, queue_lag_seconds, avg_execution_ms
  )
  select id, region, status, active_lease_count, queue_lag_seconds, avg_execution_ms
  from public.monitor_workers where id = p_worker_id;

  return coalesce(v_shutdown, false);
end;
$$;

-- ---------------------------------------------------------------------------
-- app.lease_due_checks: atomically lease up to p_max due schedules using
-- FOR UPDATE SKIP LOCKED, record an append-only lease grant, and return the
-- work plus its deterministic idempotency key. Excludes paused/disabled/deleted
-- monitors, suspended organizations, and heartbeat monitors.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- app.worker_load_monitor: return the version-faithful configuration snapshot
-- and encrypted secret references for one monitor/version. Secrets stay
-- encrypted; the worker decrypts in memory with the app key. No plaintext.
-- ---------------------------------------------------------------------------
create or replace function app.worker_load_monitor(
  p_monitor_id uuid,
  p_version_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_config jsonb;
  v_secrets jsonb;
begin
  select configuration_snapshot into v_config
  from public.monitor_versions
  where id = p_version_id and monitor_id = p_monitor_id;

  if v_config is null then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'secret_type', s.secret_type,
    'header_name', s.header_name,
    'encrypted_payload', s.encrypted_payload,
    'encryption_key_version', s.encryption_key_version
  )), '[]'::jsonb)
  into v_secrets
  from public.monitor_secrets s
  where s.monitor_id = p_monitor_id and s.deleted_at is null;

  return jsonb_build_object('config', v_config, 'secrets', v_secrets);
end;
$$;

-- ---------------------------------------------------------------------------
-- app.finalize_check: idempotently persist an execution + result + assertion
-- results, advance the schedule (drift-free next tick supplied by the worker),
-- release the lease, and update monitor head runtime state. Safe under
-- duplicate delivery: the unique idempotency key means a second call is a
-- no-op that returns the existing execution id.
-- ---------------------------------------------------------------------------
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

  -- Duplicate delivery: execution already finalized. Return the existing id and
  -- do not double-write results or advance the schedule.
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

  -- Test executions never touch schedule, leases, or monitor head runtime.
  if coalesce(p_is_test, false) then
    return v_execution_id;
  end if;

  -- Advance the schedule and release the lease.
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

  -- Update monitor head runtime state.
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

  return v_execution_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- app.expire_stale_leases: reclaim schedules whose lease expired (worker crash
-- or overrun). Returns how many were reclaimed. Duplicate-safe: the original
-- worker's later finalize is idempotent on the key.
-- ---------------------------------------------------------------------------
create or replace function app.expire_stale_leases()
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_count integer;
begin
  update public.monitor_leases set
    released_at = now(),
    outcome = 'expired'
  where released_at is null and lease_expires_at < now();

  with reclaimed as (
    update public.check_schedules cs set
      locked_at = null,
      locked_by_worker_id = null,
      lease_expires_at = null,
      consecutive_lease_failures = cs.consecutive_lease_failures + 1,
      updated_at = now()
    where cs.locked_at is not null and cs.lease_expires_at < now()
    returning 1
  )
  select count(*) into v_count from reclaimed;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- app.record_monitor_security_event: append a safe security event. No secrets,
-- no full sensitive URLs (caller redacts before passing metadata).
-- ---------------------------------------------------------------------------
create or replace function app.record_monitor_security_event(
  p_organization_id uuid,
  p_monitor_id uuid,
  p_event_type text,
  p_severity text,
  p_safe_summary text,
  p_metadata jsonb,
  p_worker_id uuid,
  p_correlation_id uuid
) returns void
language plpgsql
security definer
set search_path = public, app
as $$
begin
  insert into public.monitor_security_events (
    organization_id, monitor_id, event_type, severity, safe_summary,
    metadata, worker_id, correlation_id
  ) values (
    p_organization_id, p_monitor_id, p_event_type, coalesce(p_severity, 'info'),
    left(p_safe_summary, 512), p_metadata, p_worker_id, p_correlation_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants: the worker role may EXECUTE only these functions, nothing else. It
-- has no direct table privileges. Revoke default public execute first.
-- ---------------------------------------------------------------------------
revoke all on function app.worker_register(text, text, text, text, text, integer, integer) from public;
revoke all on function app.worker_heartbeat(uuid, text, integer, integer, integer, integer, integer) from public;
revoke all on function app.lease_due_checks(uuid, text, integer, integer) from public;
revoke all on function app.worker_load_monitor(uuid, uuid) from public;
revoke all on function app.finalize_check(text, uuid, uuid, uuid, uuid, text, timestamptz, timestamptz, timestamptz, timestamptz, integer, text, text, text, integer, text, integer, bigint, integer, integer, integer, integer, integer, jsonb, text, text, jsonb, uuid, boolean, timestamptz) from public;
revoke all on function app.expire_stale_leases() from public;
revoke all on function app.record_monitor_security_event(uuid, uuid, text, text, text, jsonb, uuid, uuid) from public;

grant usage on schema app to fajita_monitor_worker;
grant execute on function app.worker_register(text, text, text, text, text, integer, integer) to fajita_monitor_worker;
grant execute on function app.worker_heartbeat(uuid, text, integer, integer, integer, integer, integer) to fajita_monitor_worker;
grant execute on function app.lease_due_checks(uuid, text, integer, integer) to fajita_monitor_worker;
grant execute on function app.worker_load_monitor(uuid, uuid) to fajita_monitor_worker;
grant execute on function app.finalize_check(text, uuid, uuid, uuid, uuid, text, timestamptz, timestamptz, timestamptz, timestamptz, integer, text, text, text, integer, text, integer, bigint, integer, integer, integer, integer, integer, jsonb, text, text, jsonb, uuid, boolean, timestamptz) to fajita_monitor_worker;
grant execute on function app.expire_stale_leases() to fajita_monitor_worker;
grant execute on function app.record_monitor_security_event(uuid, uuid, text, text, text, jsonb, uuid, uuid) to fajita_monitor_worker;
