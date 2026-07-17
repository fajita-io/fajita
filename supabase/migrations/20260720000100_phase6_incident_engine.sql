-- Phase 6: incident engine. Centralized, versioned, deterministic evaluation.
--
-- All incident state logic lives here, in the app schema, not scattered across
-- route handlers, workers, and UI. The evaluator is idempotent, transactional,
-- and concurrency-safe: it locks the per-monitor operational-state row, so two
-- results for the same monitor cannot open two incidents, and a duplicate
-- delivery is a no-op. Out-of-order results are rejected by checked_at.
--
-- Runtime shape:
--   app.finalize_check  -> enqueues monitor_state_evaluations (same txn)
--   app.process_incident_evaluations -> drains the queue (FOR UPDATE SKIP LOCKED)
--   app.evaluate_check_result -> the state machine for one finalized result
--
-- EVALUATION VERSION: 1. The TypeScript mirror in
-- src/lib/incidents/state-machine.ts documents the same transition table and
-- must be kept in sync (like the monitor-contracts TS/Go mirror).
--
-- Forward-only migration.

-- ===========================================================================
-- Classification: pure, immutable functions shared by the evaluator and tests.
-- ===========================================================================

-- Incident eligibility of a finalized result. Distinguishes real customer
-- service failures from customer misconfiguration and Fajita platform
-- uncertainty. Platform failures must never be blamed on the customer service.
create or replace function app.result_eligibility(p_status text, p_category text)
returns text
language sql
immutable
as $$
  select case
    when p_status = 'success' then 'success'
    when p_status = 'canceled' or p_category = 'canceled' then 'ignore'
    when p_category = 'worker_error' then 'platform'
    when p_category in (
      'invalid_configuration', 'unsupported_scheme', 'redirect_blocked',
      'redirect_limit', 'response_too_large', 'blocked_destination'
    ) then 'config'
    when p_category in (
      'dns_failure', 'connection_refused', 'connection_reset', 'connect_timeout',
      'tls_failure', 'tls_expired', 'tls_hostname_mismatch', 'response_timeout',
      'unexpected_status', 'invalid_json', 'assertion_failed', 'heartbeat_missed'
    ) then 'eligible'
    when p_status = 'blocked' then 'config'
    when p_status in ('failure', 'timed_out', 'error') then 'eligible'
    else 'ignore'
  end;
$$;

-- Coarse failure family used as the deterministic incident correlation key.
create or replace function app.failure_family(p_status text, p_category text)
returns text
language sql
immutable
as $$
  select case
    when p_status = 'success' then 'none'
    when p_category in ('response_timeout', 'connect_timeout') then 'timeout'
    when p_category in ('tls_failure', 'tls_expired', 'tls_hostname_mismatch') then 'tls'
    when p_category in ('assertion_failed', 'invalid_json') then 'assertion'
    when p_category = 'heartbeat_missed' then 'heartbeat'
    else 'availability'
  end;
$$;

-- Degraded vs down. A responding endpoint with a soft failure is degraded; an
-- unreachable endpoint or a hard failure is down.
create or replace function app.operational_from_failure(
  p_category text, p_http_status integer
)
returns text
language sql
immutable
as $$
  select case
    when p_http_status between 200 and 399
      and p_category in ('assertion_failed', 'invalid_json', 'response_timeout')
      then 'degraded'
    else 'down'
  end;
$$;

-- Severity from monitor criticality, operational state, and blast radius.
create or replace function app.incident_severity(
  p_criticality text, p_operational text, p_affected_count integer
)
returns text
language sql
immutable
as $$
  select case
    when p_affected_count >= 4 then 'critical'
    when p_operational = 'down' and p_criticality = 'critical' then 'critical'
    when p_operational = 'down' and p_criticality in ('high', 'normal') then 'major'
    when p_operational = 'down' then 'major'
    when p_operational = 'degraded' and p_criticality = 'critical' then 'major'
    when p_operational = 'degraded' and p_criticality = 'high' then 'major'
    else 'minor'
  end;
$$;

-- ===========================================================================
-- Timeline / outbox / projection helpers (centralized writes).
-- ===========================================================================

-- Append one immutable timeline event with a stable per-incident sequence.
create or replace function app.append_incident_event(
  p_incident_id uuid,
  p_organization_id uuid,
  p_event_type text,
  p_title text,
  p_description text,
  p_visibility text,
  p_actor_kind text,
  p_actor_user_id uuid,
  p_monitor_id uuid,
  p_region text,
  p_evidence_id uuid,
  p_metadata jsonb,
  p_occurred_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_seq bigint;
  v_id uuid;
begin
  select coalesce(max(sequence), 0) + 1 into v_seq
  from public.incident_events where incident_id = p_incident_id;

  insert into public.incident_events (
    incident_id, organization_id, sequence, event_type, actor_kind,
    actor_user_id, monitor_id, region, title, description, visibility,
    evidence_id, metadata, occurred_at
  ) values (
    p_incident_id, p_organization_id, v_seq, p_event_type,
    coalesce(p_actor_kind, 'system'), p_actor_user_id, p_monitor_id, p_region,
    p_title, p_description, coalesce(p_visibility, 'system'),
    p_evidence_id, coalesce(p_metadata, '{}'::jsonb), coalesce(p_occurred_at, now())
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- Write a durable outbox event for future Phase 7 delivery. Never delivered in
-- Phase 6. Payload is safe metadata only.
create or replace function app.record_incident_outbox(
  p_organization_id uuid,
  p_incident_id uuid,
  p_monitor_id uuid,
  p_event_type text,
  p_idempotency_key text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
begin
  insert into public.incident_delivery_outbox (
    organization_id, incident_id, monitor_id, event_type, idempotency_key,
    payload, status
  ) values (
    p_organization_id, p_incident_id, p_monitor_id, p_event_type,
    p_idempotency_key, coalesce(p_payload, '{}'::jsonb), 'pending'
  )
  on conflict (idempotency_key) do nothing;
end;
$$;

-- Maintain the public-safe projection (allowlisted fields only). Stays
-- internal until Phase 8 publishes it.
create or replace function app.upsert_incident_projection(p_incident_id uuid)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v record;
begin
  select * into v from public.incidents where id = p_incident_id;
  if not found then return; end if;

  insert into public.incident_public_projections (
    incident_id, organization_id, visibility, public_title, public_summary,
    public_status, severity, opened_at, resolved_at
  ) values (
    v.id, v.organization_id, v.public_visibility,
    coalesce(v.public_title, 'Service incident'),
    v.public_summary,
    case
      when v.lifecycle_status in ('resolved', 'canceled') then 'resolved'
      when v.operational_status = 'degraded' then 'degraded'
      when v.operational_status = 'recovering' then 'recovering'
      when v.operational_status = 'maintenance' then 'maintenance'
      when v.operational_status = 'operational' then 'operational'
      else 'down'
    end,
    v.severity, v.opened_at, v.resolved_at
  )
  on conflict (incident_id) do update set
    visibility = excluded.visibility,
    public_title = excluded.public_title,
    public_summary = excluded.public_summary,
    public_status = excluded.public_status,
    severity = excluded.severity,
    resolved_at = excluded.resolved_at,
    updated_at = now();
end;
$$;

-- Snapshot a finalized check result into incident evidence.
create or replace function app.attach_result_evidence(
  p_incident_id uuid,
  p_execution_id uuid,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  r record;
  v_id uuid;
begin
  select cr.*, ce.scheduled_for, ce.attempt_count
  into r
  from public.check_results cr
  join public.check_executions ce on ce.id = cr.execution_id
  where cr.execution_id = p_execution_id;
  if not found then return null; end if;

  insert into public.incident_evidence (
    incident_id, organization_id, monitor_id, execution_id, monitor_version_id,
    role, result_status, failure_category, http_status, response_time_ms,
    tls_summary, region, attempt_count, safe_failure_summary, scheduled_for,
    checked_at
  ) values (
    p_incident_id, r.organization_id, r.monitor_id, r.execution_id, r.monitor_version_id,
    coalesce(p_role, 'sample'), r.status, r.failure_category, r.http_status, r.total_ms,
    r.tls_summary, r.region, r.attempt_count, r.safe_error_message, r.scheduled_for,
    r.checked_at
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- ===========================================================================
-- Active maintenance lookup for a monitor at a given time.
-- ===========================================================================
create or replace function app.active_maintenance_for_monitor(
  p_monitor_id uuid, p_at timestamptz
)
returns table (occurrence_id uuid, suppression_policy text)
language sql
stable
security definer
set search_path = public, app
as $$
  select mo.id, mw.suppression_policy
  from public.maintenance_occurrences mo
  join public.maintenance_windows mw on mw.id = mo.maintenance_window_id
  join public.maintenance_monitor_links ml on ml.maintenance_window_id = mw.id
  where ml.monitor_id = p_monitor_id
    and mo.status = 'active'
    and p_at >= mo.starts_at
    and p_at < mo.ends_at
  order by mo.starts_at desc
  limit 1;
$$;

-- ===========================================================================
-- The state machine: evaluate one finalized result. Concurrency-safe via a
-- row lock on monitor_operational_states. Idempotent and out-of-order safe.
-- ===========================================================================
create or replace function app.evaluate_check_result(
  p_execution_id uuid,
  p_trigger text default 'evaluation',
  p_evaluation_version integer default 1
)
returns text
language plpgsql
security definer
set search_path = public, app
as $$
declare
  ex record;              -- execution + result
  m record;               -- monitor head
  os record;              -- operational state (locked)
  v_elig text;
  v_family text;
  v_op_target text;       -- degraded | down
  v_from text;
  v_severity text;
  v_maint record;
  v_incident_id uuid;
  v_evidence_id uuid;
  v_threshold integer;
  v_recovery_threshold integer;
  v_flap_window interval := interval '15 minutes';
  v_flap_threshold integer := 4;
  v_reopen record;
  v_now timestamptz := now();
begin
  -- 1. Load the execution and its result.
  select ce.id as execution_id, ce.monitor_id, ce.organization_id, ce.is_test,
         ce.scheduled_for, ce.region, ce.attempt_count,
         cr.status, cr.failure_category, cr.http_status, cr.total_ms, cr.checked_at
  into ex
  from public.check_executions ce
  join public.check_results cr on cr.execution_id = ce.id
  where ce.id = p_execution_id;

  if not found then return 'skipped_no_result'; end if;
  if ex.is_test then return 'skipped_test'; end if;

  -- 2. Load monitor head; lifecycle gate.
  select id, organization_id, status, name, criticality,
         failure_confirmation_threshold, recovery_confirmation_threshold,
         degraded_response_time_ms, incident_reopen_window_seconds,
         incident_suppressed
  into m
  from public.monitors where id = ex.monitor_id;
  if not found then return 'skipped_no_monitor'; end if;

  -- 3. Lock (or create) the operational-state row for this monitor.
  select * into os from public.monitor_operational_states
    where monitor_id = ex.monitor_id for update;
  if not found then
    insert into public.monitor_operational_states (monitor_id, organization_id, state)
    values (ex.monitor_id, ex.organization_id, 'operational')
    on conflict (monitor_id) do nothing;
    select * into os from public.monitor_operational_states
      where monitor_id = ex.monitor_id for update;
  end if;

  -- 4. Idempotency + out-of-order guard.
  if os.last_evaluated_execution_id = ex.execution_id then
    return 'already_evaluated';
  end if;
  if os.last_evaluated_checked_at is not null
     and ex.checked_at < os.last_evaluated_checked_at then
    return 'out_of_order';
  end if;

  v_from := os.state;
  v_elig := app.result_eligibility(ex.status, ex.failure_category);
  v_family := app.failure_family(ex.status, ex.failure_category);
  v_threshold := greatest(m.failure_confirmation_threshold
    - (case when m.criticality = 'critical' then 1 else 0 end), 1);
  v_recovery_threshold := m.recovery_confirmation_threshold
    + (case when os.flapping_since is not null then 2 else 0 end);

  -- 5. Maintenance suppression (does not stop checking; suppresses opening).
  select occurrence_id, suppression_policy into v_maint
  from app.active_maintenance_for_monitor(ex.monitor_id, v_now);

  if v_maint.occurrence_id is not null and v_maint.suppression_policy = 'suppress_incidents'
     and os.active_incident_id is null then
    -- Record suppression evidence; mark monitor under maintenance.
    if v_elig in ('eligible', 'platform', 'config') then
      insert into public.incident_suppressions (
        organization_id, monitor_id, maintenance_occurrence_id, reason, execution_id
      ) values (ex.organization_id, ex.monitor_id, v_maint.occurrence_id, 'maintenance', ex.execution_id);
      update public.maintenance_occurrences
        set suppressed_failure_count = suppressed_failure_count + 1
        where id = v_maint.occurrence_id;
    end if;
    update public.monitor_operational_states set
      state = 'maintenance',
      pre_maintenance_state = coalesce(pre_maintenance_state, v_from),
      maintenance_occurrence_id = v_maint.occurrence_id,
      last_evaluated_execution_id = ex.execution_id,
      last_evaluated_checked_at = ex.checked_at,
      evaluation_version = p_evaluation_version,
      lock_version = os.lock_version + 1
    where monitor_id = ex.monitor_id;
    return 'maintenance_suppressed';
  end if;

  -- 6a. SUCCESS path.
  if v_elig = 'success' then
    if os.active_incident_id is not null then
      -- In an incident: move to recovering, resolve after enough successes.
      if v_from <> 'recovering' then
        perform app.append_incident_event(os.active_incident_id, ex.organization_id,
          'monitor.recovery_started', 'Recovery started',
          'The service is responding again. Fajita is confirming that the recovery is stable.',
          'system', 'system', null, ex.monitor_id, ex.region, null,
          jsonb_build_object('threshold', v_recovery_threshold), v_now);
        update public.incidents set operational_status = 'recovering',
          recovery_started_at = coalesce(recovery_started_at, v_now),
          last_transition_at = v_now
          where id = os.active_incident_id;
        perform app.record_incident_outbox(ex.organization_id, os.active_incident_id,
          ex.monitor_id, 'incident.recovery_started',
          os.active_incident_id::text || ':recovery_started', '{}'::jsonb);
      end if;

      if os.consecutive_eligible_successes + 1 >= v_recovery_threshold then
        -- Resolve.
        v_evidence_id := app.attach_result_evidence(os.active_incident_id, ex.execution_id, 'resolution');
        perform app.append_incident_event(os.active_incident_id, ex.organization_id,
          'incident.resolved', 'Incident resolved',
          'The service passed the required recovery checks and is operational again.',
          'system', 'system', null, ex.monitor_id, ex.region, v_evidence_id,
          '{}'::jsonb, v_now);
        update public.incidents set lifecycle_status = 'resolved',
          operational_status = 'operational', resolved_at = v_now,
          is_flapping = false, last_transition_at = v_now
          where id = os.active_incident_id;
        insert into public.incident_state_transitions (organization_id, monitor_id,
          incident_id, from_state, to_state, reason, trigger, execution_id, evaluation_version)
        values (ex.organization_id, ex.monitor_id, os.active_incident_id, v_from,
          'operational', 'recovery_confirmed', p_trigger, ex.execution_id, p_evaluation_version);
        perform app.record_incident_outbox(ex.organization_id, os.active_incident_id,
          ex.monitor_id, 'incident.resolved', os.active_incident_id::text || ':resolved', '{}'::jsonb);
        perform app.upsert_incident_projection(os.active_incident_id);

        update public.monitor_operational_states set
          state = 'operational', state_since = v_now, active_incident_id = null,
          recovery_started_at = null, verification_started_at = null,
          consecutive_eligible_failures = 0, consecutive_eligible_successes = 0,
          flapping_since = null,
          last_eligible_success_at = v_now,
          last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
          evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
        where monitor_id = ex.monitor_id;
        return 'resolved';
      else
        update public.monitor_operational_states set
          state = 'recovering', state_since = case when v_from <> 'recovering' then v_now else os.state_since end,
          recovery_started_at = coalesce(os.recovery_started_at, v_now),
          consecutive_eligible_failures = 0,
          consecutive_eligible_successes = os.consecutive_eligible_successes + 1,
          last_eligible_success_at = v_now,
          last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
          evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
        where monitor_id = ex.monitor_id;
        return 'recovering';
      end if;
    else
      -- No incident: clear verification, return to operational.
      update public.monitor_operational_states set
        state = 'operational',
        state_since = case when v_from <> 'operational' then v_now else os.state_since end,
        verification_started_at = null,
        consecutive_eligible_failures = 0,
        consecutive_eligible_successes = os.consecutive_eligible_successes + 1,
        last_eligible_success_at = v_now,
        maintenance_occurrence_id = null, pre_maintenance_state = null,
        last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
        evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
      where monitor_id = ex.monitor_id;
      return 'operational';
    end if;
  end if;

  -- 6b. IGNORE path (canceled/blocked-status noise). Advance pointer only.
  if v_elig = 'ignore' then
    update public.monitor_operational_states set
      last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
      lock_version = os.lock_version + 1
    where monitor_id = ex.monitor_id;
    return 'ignored';
  end if;

  -- 6c. CONFIG path (customer misconfiguration). Never an outage incident.
  if v_elig = 'config' then
    update public.monitor_operational_states set
      last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
      lock_version = os.lock_version + 1
    where monitor_id = ex.monitor_id;
    return 'config_ignored';
  end if;

  -- 6d. PLATFORM path (Fajita uncertainty). Never blame the customer service.
  if v_elig = 'platform' then
    if os.active_incident_id is null then
      insert into public.incident_suppressions (organization_id, monitor_id, reason, execution_id)
        values (ex.organization_id, ex.monitor_id, 'platform_uncertainty', ex.execution_id);
      update public.monitor_operational_states set
        state = case when v_from in ('operational') then 'unknown' else v_from end,
        last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
        evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
      where monitor_id = ex.monitor_id;
    else
      update public.monitor_operational_states set
        last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
        lock_version = os.lock_version + 1
      where monitor_id = ex.monitor_id;
    end if;
    return 'platform_uncertainty';
  end if;

  -- 6e. ELIGIBLE FAILURE path.
  v_op_target := app.operational_from_failure(ex.failure_category, ex.http_status);

  -- Per-monitor manual suppression: track but never open.
  if m.incident_suppressed and os.active_incident_id is null then
    insert into public.incident_suppressions (organization_id, monitor_id, reason, execution_id)
      values (ex.organization_id, ex.monitor_id, 'monitor_suppressed', ex.execution_id);
    update public.monitor_operational_states set
      state = 'verifying_failure',
      state_since = case when v_from = 'operational' then v_now else os.state_since end,
      consecutive_eligible_failures = os.consecutive_eligible_failures + 1,
      consecutive_eligible_successes = 0, last_eligible_failure_at = v_now,
      last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
      evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
    where monitor_id = ex.monitor_id;
    return 'monitor_suppressed';
  end if;

  if os.active_incident_id is not null then
    -- Continue existing incident. Handle recovery interruption + escalation.
    if v_from = 'recovering' then
      v_evidence_id := app.attach_result_evidence(os.active_incident_id, ex.execution_id, 'confirmation');
      perform app.append_incident_event(os.active_incident_id, ex.organization_id,
        'monitor.recovery_interrupted', 'Recovery interrupted',
        'A failure occurred during recovery confirmation. The incident remains active.',
        'system', 'system', null, ex.monitor_id, ex.region, v_evidence_id, '{}'::jsonb, v_now);
    end if;

    -- Escalate degraded -> down if warranted.
    if v_op_target = 'down' then
      update public.incidents set operational_status = 'down', last_transition_at = v_now
        where id = os.active_incident_id and operational_status <> 'down';
    end if;

    -- Flapping accounting (state flipped back to failing from recovering).
    update public.monitor_operational_states set
      state = v_op_target,
      state_since = case when v_from <> v_op_target then v_now else os.state_since end,
      recovery_started_at = null,
      consecutive_eligible_failures = os.consecutive_eligible_failures + 1,
      consecutive_eligible_successes = 0, last_eligible_failure_at = v_now,
      recent_transition_count = case
        when v_from = 'recovering' then os.recent_transition_count + 1
        else os.recent_transition_count end,
      recent_window_started_at = coalesce(os.recent_window_started_at, v_now),
      last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
      evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
    where monitor_id = ex.monitor_id;

    -- Flapping detection.
    select * into os from public.monitor_operational_states where monitor_id = ex.monitor_id;
    if os.recent_window_started_at > v_now - v_flap_window
       and os.recent_transition_count >= v_flap_threshold
       and os.flapping_since is null then
      update public.monitor_operational_states set flapping_since = v_now where monitor_id = ex.monitor_id;
      update public.incidents set is_flapping = true where id = os.active_incident_id;
      perform app.append_incident_event(os.active_incident_id, ex.organization_id,
        'monitor.flapping_started', 'Flapping detected',
        'This monitor is switching between passing and failing repeatedly. Recovery confirmation has been extended.',
        'system', 'system', null, ex.monitor_id, ex.region, null, '{}'::jsonb, v_now);
      perform app.record_incident_outbox(ex.organization_id, os.active_incident_id,
        ex.monitor_id, 'monitor.flapping', os.active_incident_id::text || ':flapping', '{}'::jsonb);
    end if;
    return 'incident_continued';
  end if;

  -- No active incident. Increment failure streak first.
  update public.monitor_operational_states set
    consecutive_eligible_failures = os.consecutive_eligible_failures + 1,
    consecutive_eligible_successes = 0, last_eligible_failure_at = v_now,
    last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
    evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
  where monitor_id = ex.monitor_id;
  select * into os from public.monitor_operational_states where monitor_id = ex.monitor_id;

  if os.consecutive_eligible_failures < v_threshold then
    -- Below threshold: verify, do not open.
    if v_from <> 'verifying_failure' then
      update public.monitor_operational_states set
        state = 'verifying_failure', state_since = v_now, verification_started_at = v_now
      where monitor_id = ex.monitor_id;
    end if;
    return 'verifying';
  end if;

  -- Threshold met. Reopen a recently resolved incident inside the grace window,
  -- otherwise open a new one.
  select * into v_reopen from public.incidents
    where organization_id = ex.organization_id
      and primary_monitor_id = ex.monitor_id
      and lifecycle_status = 'resolved'
      and origin = 'automatic'
      and deleted_at is null
      and resolved_at is not null
      and resolved_at > v_now - make_interval(secs => m.incident_reopen_window_seconds)
    order by resolved_at desc
    limit 1;

  if v_reopen.id is not null then
    v_incident_id := v_reopen.id;
    v_severity := app.incident_severity(m.criticality, v_op_target, 1);
    update public.incidents set lifecycle_status = 'open', operational_status = v_op_target,
      severity = v_severity, resolved_at = null, resolved_by_user_id = null,
      last_transition_at = v_now where id = v_incident_id;
    v_evidence_id := app.attach_result_evidence(v_incident_id, ex.execution_id, 'confirmation');
    perform app.append_incident_event(v_incident_id, ex.organization_id,
      'incident.reopened', 'Incident reopened',
      'A new confirmed failure occurred within the reopen window. The previous incident was reopened.',
      'system', 'system', null, ex.monitor_id, ex.region, v_evidence_id, '{}'::jsonb, v_now);
    insert into public.incident_state_transitions (organization_id, monitor_id, incident_id,
      from_state, to_state, reason, trigger, execution_id, evaluation_version)
    values (ex.organization_id, ex.monitor_id, v_incident_id, v_from, v_op_target,
      'reopened_within_window', p_trigger, ex.execution_id, p_evaluation_version);
    perform app.record_incident_outbox(ex.organization_id, v_incident_id, ex.monitor_id,
      'incident.reopened', v_incident_id::text || ':reopened:' || ex.execution_id::text, '{}'::jsonb);
    perform app.upsert_incident_projection(v_incident_id);
  else
    -- Open a brand new incident. The dedup unique index makes concurrent double
    -- opens impossible; on conflict we adopt the existing active incident.
    v_severity := app.incident_severity(m.criticality, v_op_target, 1);
    begin
      insert into public.incidents (
        organization_id, title, origin, lifecycle_status, operational_status,
        severity, primary_monitor_id, correlation_key, opened_at, first_failure_at,
        last_transition_at, public_title, internal_summary, evaluation_version
      ) values (
        ex.organization_id,
        app.default_incident_title(m.name, ex.failure_category, ex.http_status),
        'automatic', 'open', v_op_target, v_severity, ex.monitor_id, v_family, v_now,
        os.last_eligible_failure_at, v_now,
        app.default_incident_public_title(ex.failure_category),
        'Automatic incident opened after ' || v_threshold::text || ' confirmed failures.',
        p_evaluation_version
      )
      returning id into v_incident_id;
    exception when unique_violation then
      select id into v_incident_id from public.incidents
        where organization_id = ex.organization_id and primary_monitor_id = ex.monitor_id
          and correlation_key = v_family and lifecycle_status in ('open', 'monitoring')
          and deleted_at is null limit 1;
      if v_incident_id is null then return 'dedup_conflict'; end if;
    end;

    insert into public.incident_monitors (incident_id, organization_id, monitor_id,
      monitor_name_snapshot, relationship, attach_origin)
    values (v_incident_id, ex.organization_id, ex.monitor_id, m.name, 'primary', 'automatic')
    on conflict (incident_id, monitor_id) do nothing;
    update public.incidents set affected_monitor_count = 1 where id = v_incident_id;

    -- Evidence: first failure + confirming failure.
    if os.last_evaluated_execution_id is not null then
      perform app.attach_result_evidence(v_incident_id, ex.execution_id, 'confirmation');
    end if;

    perform app.append_incident_event(v_incident_id, ex.organization_id,
      'incident.opened',
      case when v_op_target = 'down' then 'Incident opened: service down'
           else 'Incident opened: service degraded' end,
      case when v_op_target = 'down'
        then 'Fajita confirmed that the service is unavailable or failing critical checks.'
        else 'The service is responding, but one or more required checks are failing.' end,
      'system', 'system', null, ex.monitor_id, ex.region, null,
      jsonb_build_object('confirmed_failures', os.consecutive_eligible_failures), v_now);
    insert into public.incident_state_transitions (organization_id, monitor_id, incident_id,
      from_state, to_state, reason, trigger, execution_id, evaluation_version)
    values (ex.organization_id, ex.monitor_id, v_incident_id, v_from, v_op_target,
      'failure_confirmed', p_trigger, ex.execution_id, p_evaluation_version);
    perform app.record_incident_outbox(ex.organization_id, v_incident_id, ex.monitor_id,
      'incident.opened', v_incident_id::text || ':opened', '{}'::jsonb);
    perform app.upsert_incident_projection(v_incident_id);
  end if;

  update public.monitor_operational_states set
    state = v_op_target, state_since = v_now, active_incident_id = v_incident_id,
    verification_started_at = null,
    last_evaluated_execution_id = ex.execution_id, last_evaluated_checked_at = ex.checked_at,
    evaluation_version = p_evaluation_version, lock_version = os.lock_version + 1
  where monitor_id = ex.monitor_id;

  return case when v_reopen.id is not null then 'incident_reopened' else 'incident_opened' end;
end;
$$;

-- ===========================================================================
-- Default titles (safe: no secret query params, no raw bodies, no full URLs).
-- ===========================================================================
create or replace function app.default_incident_title(
  p_monitor_name text, p_category text, p_http_status integer
)
returns text
language sql
immutable
as $$
  select left(coalesce(p_monitor_name, 'Monitor') || ' ' || case
    when p_category = 'heartbeat_missed' then 'missed its heartbeat'
    when p_category in ('tls_expired') then 'has an expired TLS certificate'
    when p_category in ('tls_hostname_mismatch', 'tls_failure') then 'has a TLS problem'
    when p_category = 'response_timeout' then 'is responding too slowly or timing out'
    when p_category = 'unexpected_status' and p_http_status is not null
      then 'returned HTTP ' || p_http_status::text
    when p_category = 'assertion_failed' then 'failed a required check'
    when p_category in ('dns_failure') then 'cannot be resolved'
    when p_category in ('connection_refused', 'connection_reset', 'connect_timeout')
      then 'is not reachable'
    else 'is failing checks'
  end, 200);
$$;

create or replace function app.default_incident_public_title(p_category text)
returns text
language sql
immutable
as $$
  select case
    when p_category = 'heartbeat_missed' then 'A scheduled job did not report in'
    when p_category in ('tls_expired', 'tls_hostname_mismatch', 'tls_failure')
      then 'Certificate issue affecting a service'
    when p_category = 'response_timeout' then 'Service is slow or unresponsive'
    else 'Service disruption'
  end;
$$;

-- ===========================================================================
-- Synthetic results (heartbeat miss/recovery feed the same pipeline).
-- ===========================================================================
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

  insert into public.monitor_state_evaluations (execution_id, monitor_id, organization_id, source)
  values (v_exec, m.id, m.organization_id, 'heartbeat')
  on conflict (execution_id) do nothing;

  return v_exec;
end;
$$;

-- Detect overdue heartbeats and feed a synthetic missed-heartbeat failure.
create or replace function app.detect_missed_heartbeats()
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select ht.id as token_id, ht.monitor_id
    from public.heartbeat_tokens ht
    join public.monitors m on m.id = ht.monitor_id
    where ht.state in ('healthy', 'pending')
      and ht.next_expected_at is not null
      and ht.next_expected_at + make_interval(secs => coalesce(ht.grace_period_seconds, 0)) < now()
      and m.status = 'active' and m.deleted_at is null
  loop
    update public.heartbeat_tokens set state = 'missed', updated_at = now() where id = r.token_id;
    perform app.record_synthetic_result(r.monitor_id, 'failure', 'heartbeat_missed',
      'A required heartbeat was not received within its expected window.');
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- ===========================================================================
-- Queue drain: process pending evaluations idempotently and concurrently.
-- ===========================================================================
create or replace function app.process_incident_evaluations(
  p_limit integer default 100,
  p_evaluation_version integer default 1
)
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare
  r record;
  v_result text;
  v_count integer := 0;
begin
  for r in
    select id, execution_id from public.monitor_state_evaluations
    where status = 'pending'
    order by enqueued_at
    for update skip locked
    limit greatest(p_limit, 0)
  loop
    update public.monitor_state_evaluations
      set status = 'processing', locked_at = now(), attempts = attempts + 1
      where id = r.id;
    begin
      v_result := app.evaluate_check_result(r.execution_id, 'evaluation', p_evaluation_version);
      update public.monitor_state_evaluations
        set status = case when v_result like 'skipped%' then 'skipped' else 'processed' end,
            processed_at = now(), last_error = null
        where id = r.id;
    exception when others then
      update public.monitor_state_evaluations
        set status = 'failed', last_error = left(sqlerrm, 500)
        where id = r.id;
    end;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- ===========================================================================
-- Reconciliation: detect and (optionally) repair safe derived-state drift.
-- Platform-admin only in the application. Never rewrites incident history.
-- ===========================================================================
create or replace function app.reconcile_incident_state(
  p_dry_run boolean default true,
  p_limit integer default 500
)
returns jsonb
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_stale_pointers integer := 0;
  v_missing_projection integer := 0;
begin
  -- Operational state points at a resolved/canceled incident.
  if p_dry_run then
    select count(*) into v_stale_pointers
    from public.monitor_operational_states os
    join public.incidents i on i.id = os.active_incident_id
    where i.lifecycle_status in ('resolved', 'canceled');
  else
    with fixed as (
      update public.monitor_operational_states os
        set active_incident_id = null, lock_version = os.lock_version + 1
        from public.incidents i
        where i.id = os.active_incident_id and i.lifecycle_status in ('resolved', 'canceled')
        returning 1
    ) select count(*) into v_stale_pointers from fixed;
  end if;

  -- Active incidents without a projection row.
  select count(*) into v_missing_projection
  from public.incidents i
  left join public.incident_public_projections p on p.incident_id = i.id
  where p.incident_id is null and i.deleted_at is null;

  if not p_dry_run and v_missing_projection > 0 then
    perform app.upsert_incident_projection(mp.id)
    from (
      select i.id
      from public.incidents i
      left join public.incident_public_projections p on p.incident_id = i.id
      where p.incident_id is null and i.deleted_at is null
      limit greatest(p_limit, 0)
    ) mp;
  end if;

  return jsonb_build_object(
    'dry_run', p_dry_run,
    'stale_active_incident_pointers', v_stale_pointers,
    'missing_projections', v_missing_projection
  );
end;
$$;

-- ===========================================================================
-- Enqueue hook: replace finalize_check to durably enqueue evaluation for every
-- finalized production result, inside the same transaction. Behavior for
-- executions, results, schedules, leases, and monitor head is unchanged.
-- ===========================================================================
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

  -- Phase 6: durably enqueue incident evaluation in the same transaction.
  insert into public.monitor_state_evaluations (execution_id, monitor_id, organization_id, source)
  values (v_execution_id, p_monitor_id, p_organization_id, 'finalize')
  on conflict (execution_id) do nothing;

  return v_execution_id;
end;
$$;

-- Worker role may drive evaluation drain, heartbeat detection, and reaping.
revoke all on function app.process_incident_evaluations(integer, integer) from public;
revoke all on function app.detect_missed_heartbeats() from public;
grant execute on function app.process_incident_evaluations(integer, integer) to fajita_monitor_worker;
grant execute on function app.detect_missed_heartbeats() to fajita_monitor_worker;
