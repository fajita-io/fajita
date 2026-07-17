-- Phase 6: public API surface for the incident engine.
--
-- The evaluator and helpers live in the app schema and are not reachable via
-- PostgREST. These public SECURITY DEFINER wrappers are the only way the
-- application (service role) performs atomic incident and maintenance
-- operations and drives the engine. They are granted to service_role ONLY,
-- exactly like public.monitor_result_stats in Phase 5. The authenticated role
-- can never call them, so customers can never forge incident state.
--
-- Every wrapper does its writes atomically in one call: data + timeline event
-- + outbox + projection stay consistent. Audit and analytics are recorded by
-- the TypeScript action layer after a successful call.
--
-- Forward-only migration.

-- ---------------------------------------------------------------------------
-- Engine drivers.
-- ---------------------------------------------------------------------------
create or replace function public.process_incident_evaluations(p_limit integer default 100)
returns integer
language sql
security definer
set search_path = public, app
as $$
  select app.process_incident_evaluations(p_limit, 1);
$$;

create or replace function public.detect_missed_heartbeats()
returns integer
language sql
security definer
set search_path = public, app
as $$
  select app.detect_missed_heartbeats();
$$;

create or replace function public.reconcile_incident_state(
  p_dry_run boolean default true, p_limit integer default 500
)
returns jsonb
language sql
security definer
set search_path = public, app
as $$
  select app.reconcile_incident_state(p_dry_run, p_limit);
$$;

-- Replay: reprocess one finalized result through the evaluator (platform admin
-- only in the app). Version aware. No external delivery, no publishing.
create or replace function public.replay_check_evaluation(
  p_execution_id uuid, p_evaluation_version integer default 1
)
returns text
language sql
security definer
set search_path = public, app
as $$
  select app.evaluate_check_result(p_execution_id, 'replay', p_evaluation_version);
$$;

-- ---------------------------------------------------------------------------
-- Manual incident lifecycle.
-- ---------------------------------------------------------------------------
create or replace function public.incident_create_manual(
  p_organization_id uuid,
  p_actor_user_id uuid,
  p_title text,
  p_severity text,
  p_operational_status text,
  p_internal_summary text,
  p_public_summary text,
  p_public_visibility text,
  p_assignee_user_id uuid,
  p_opened_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_id uuid;
begin
  insert into public.incidents (
    organization_id, title, origin, lifecycle_status, operational_status, severity,
    correlation_key, opened_at, last_transition_at, public_visibility, public_summary,
    internal_summary, created_by_user_id, current_assignee_user_id
  ) values (
    p_organization_id, left(p_title, 200), 'manual', 'open',
    coalesce(p_operational_status, 'down'), coalesce(p_severity, 'major'),
    'manual:' || gen_random_uuid()::text, coalesce(p_opened_at, now()),
    now(), coalesce(p_public_visibility, 'internal'), p_public_summary,
    p_internal_summary, p_actor_user_id, p_assignee_user_id
  )
  returning id into v_id;

  perform app.append_incident_event(v_id, p_organization_id, 'incident.opened',
    'Manual incident created', 'An operator opened this incident.',
    'internal', 'user', p_actor_user_id, null, null, null,
    jsonb_build_object('origin', 'manual'), now());

  if p_assignee_user_id is not null then
    insert into public.incident_assignments (incident_id, organization_id, assignee_user_id, assigned_by_user_id, action)
      values (v_id, p_organization_id, p_assignee_user_id, p_actor_user_id, 'assigned');
  end if;

  perform app.record_incident_outbox(p_organization_id, v_id, null, 'incident.opened',
    v_id::text || ':opened', jsonb_build_object('origin', 'manual'));
  perform app.upsert_incident_projection(v_id);
  return v_id;
end;
$$;

create or replace function public.incident_attach_monitor(
  p_organization_id uuid, p_incident_id uuid, p_monitor_id uuid,
  p_actor_user_id uuid, p_relationship text, p_note text
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_name text;
begin
  -- Tenant isolation: monitor and incident must be in the same org.
  select name into v_name from public.monitors
    where id = p_monitor_id and organization_id = p_organization_id;
  if not found then raise exception 'monitor not in organization'; end if;
  if not exists (select 1 from public.incidents where id = p_incident_id and organization_id = p_organization_id) then
    raise exception 'incident not in organization';
  end if;

  insert into public.incident_monitors (incident_id, organization_id, monitor_id,
    monitor_name_snapshot, relationship, attach_origin, relationship_note, attached_by_user_id)
  values (p_incident_id, p_organization_id, p_monitor_id, v_name,
    coalesce(p_relationship, 'affected'), 'manual', p_note, p_actor_user_id)
  on conflict (incident_id, monitor_id) do update set removed_at = null,
    relationship = coalesce(p_relationship, public.incident_monitors.relationship),
    relationship_note = p_note;

  update public.incidents set affected_monitor_count = (
    select count(*) from public.incident_monitors
    where incident_id = p_incident_id and removed_at is null
  ) where id = p_incident_id;

  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.monitor_attached',
    'Monitor attached', 'An operator attached ' || coalesce(v_name, 'a monitor') || '.',
    'internal', 'user', p_actor_user_id, p_monitor_id, null, null, '{}'::jsonb, now());
end;
$$;

create or replace function public.incident_remove_monitor(
  p_organization_id uuid, p_incident_id uuid, p_monitor_id uuid, p_actor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
begin
  update public.incident_monitors set removed_at = now()
    where incident_id = p_incident_id and monitor_id = p_monitor_id
      and organization_id = p_organization_id and removed_at is null;

  update public.incidents set affected_monitor_count = (
    select count(*) from public.incident_monitors
    where incident_id = p_incident_id and removed_at is null
  ) where id = p_incident_id;

  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.monitor_removed',
    'Monitor removed', 'An operator removed a monitor from this incident.',
    'internal', 'user', p_actor_user_id, p_monitor_id, null, null, '{}'::jsonb, now());
end;
$$;

create or replace function public.incident_acknowledge(
  p_organization_id uuid, p_incident_id uuid, p_actor_user_id uuid,
  p_acknowledge boolean, p_note text
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
begin
  if p_acknowledge then
    update public.incidents set acknowledged_at = coalesce(acknowledged_at, now()),
      acknowledged_by_user_id = p_actor_user_id
      where id = p_incident_id and organization_id = p_organization_id;
    insert into public.incident_acknowledgments (incident_id, organization_id, action, actor_user_id, note)
      values (p_incident_id, p_organization_id, 'acknowledged', p_actor_user_id, p_note);
    perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.acknowledged',
      'Acknowledged', 'An operator acknowledged this incident.',
      'internal', 'user', p_actor_user_id, null, null, null, '{}'::jsonb, now());
  else
    update public.incidents set acknowledged_at = null, acknowledged_by_user_id = null
      where id = p_incident_id and organization_id = p_organization_id;
    insert into public.incident_acknowledgments (incident_id, organization_id, action, actor_user_id, note)
      values (p_incident_id, p_organization_id, 'unacknowledged', p_actor_user_id, p_note);
    perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.unacknowledged',
      'Acknowledgment removed', 'An operator removed the acknowledgment.',
      'internal', 'user', p_actor_user_id, null, null, null, '{}'::jsonb, now());
  end if;
end;
$$;

create or replace function public.incident_assign(
  p_organization_id uuid, p_incident_id uuid, p_assignee_user_id uuid, p_actor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_prev uuid;
begin
  -- Assignee must be an active member of the organization.
  if p_assignee_user_id is not null and not exists (
    select 1 from public.organization_members
    where organization_id = p_organization_id and user_id = p_assignee_user_id and status = 'active'
  ) then
    raise exception 'assignee not an active organization member';
  end if;

  select current_assignee_user_id into v_prev from public.incidents
    where id = p_incident_id and organization_id = p_organization_id;

  update public.incidents set current_assignee_user_id = p_assignee_user_id
    where id = p_incident_id and organization_id = p_organization_id;

  insert into public.incident_assignments (incident_id, organization_id, assignee_user_id, assigned_by_user_id, action)
    values (p_incident_id, p_organization_id, p_assignee_user_id, p_actor_user_id,
      case when p_assignee_user_id is null then 'unassigned'
           when v_prev is not null then 'reassigned' else 'assigned' end);

  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.assigned',
    'Assigned', case when p_assignee_user_id is null then 'Assignment cleared.' else 'Incident assigned to a team member.' end,
    'internal', 'user', p_actor_user_id, null, null, null, '{}'::jsonb, now());
end;
$$;

create or replace function public.incident_change_severity(
  p_organization_id uuid, p_incident_id uuid, p_actor_user_id uuid, p_severity text
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
begin
  update public.incidents set severity = p_severity
    where id = p_incident_id and organization_id = p_organization_id;
  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.severity_changed',
    'Severity changed', 'Severity set to ' || p_severity || '.',
    'internal', 'user', p_actor_user_id, null, null, null,
    jsonb_build_object('severity', p_severity), now());
  perform app.upsert_incident_projection(p_incident_id);
end;
$$;

create or replace function public.incident_add_update(
  p_organization_id uuid, p_incident_id uuid, p_actor_user_id uuid,
  p_update_type text, p_visibility text, p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_id uuid;
begin
  insert into public.incident_updates (incident_id, organization_id, update_type, visibility, body, author_user_id)
    values (p_incident_id, p_organization_id, coalesce(p_update_type, 'informational'),
      coalesce(p_visibility, 'internal'), left(p_body, 4000), p_actor_user_id)
    returning id into v_id;

  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.update_added',
    'Update added', left(p_body, 280),
    case when p_visibility = 'public_ready' then 'public_ready' else 'internal' end,
    'user', p_actor_user_id, null, null, null,
    jsonb_build_object('update_type', p_update_type), now());
  perform app.upsert_incident_projection(p_incident_id);
  return v_id;
end;
$$;

create or replace function public.incident_add_note(
  p_organization_id uuid, p_incident_id uuid, p_actor_user_id uuid, p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_id uuid;
begin
  insert into public.incident_notes (incident_id, organization_id, body, author_user_id)
    values (p_incident_id, p_organization_id, left(p_body, 4000), p_actor_user_id)
    returning id into v_id;
  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.note_added',
    'Internal note added', 'An operator added an internal note.',
    'internal', 'user', p_actor_user_id, null, null, null, '{}'::jsonb, now());
  return v_id;
end;
$$;

-- Manual resolution. Never marks the monitor operational when evidence still
-- shows failure: it resolves the incident lifecycle and clears the active
-- incident pointer, but leaves the derived monitor operational state to the
-- next real check. Optionally suppresses reopen for a bounded window.
create or replace function public.incident_resolve(
  p_organization_id uuid, p_incident_id uuid, p_actor_user_id uuid,
  p_resolution_summary text, p_suppress_reopen_seconds integer
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v record;
begin
  select * into v from public.incidents
    where id = p_incident_id and organization_id = p_organization_id;
  if not found then raise exception 'incident not found'; end if;

  update public.incidents set lifecycle_status = 'resolved', resolved_at = now(),
    resolved_by_user_id = p_actor_user_id, resolution_summary = p_resolution_summary,
    last_transition_at = now()
    where id = p_incident_id;

  -- Clear the active-incident pointer so the monitor is not stuck referencing a
  -- resolved incident. Do NOT force the operational state to operational.
  update public.monitor_operational_states
    set active_incident_id = null, lock_version = lock_version + 1
    where active_incident_id = p_incident_id;

  if coalesce(p_suppress_reopen_seconds, 0) > 0 and v.primary_monitor_id is not null then
    insert into public.incident_suppressions (organization_id, monitor_id, incident_id, reason, expires_at)
      values (p_organization_id, v.primary_monitor_id, p_incident_id, 'manual_resolution_window',
        now() + make_interval(secs => p_suppress_reopen_seconds));
  end if;

  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.resolved',
    'Incident resolved (manual)', coalesce(left(p_resolution_summary, 280), 'An operator resolved this incident.'),
    'internal', 'user', p_actor_user_id, null, null, null, '{}'::jsonb, now());
  perform app.record_incident_outbox(p_organization_id, p_incident_id, v.primary_monitor_id,
    'incident.resolved', p_incident_id::text || ':resolved:manual', '{}'::jsonb);
  perform app.upsert_incident_projection(p_incident_id);
end;
$$;

create or replace function public.incident_cancel(
  p_organization_id uuid, p_incident_id uuid, p_actor_user_id uuid, p_reason text
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
begin
  update public.incidents set lifecycle_status = 'canceled', canceled_at = now(),
    canceled_by_user_id = p_actor_user_id, cancellation_reason = p_reason,
    last_transition_at = now()
    where id = p_incident_id and organization_id = p_organization_id;

  update public.monitor_operational_states
    set active_incident_id = null, lock_version = lock_version + 1
    where active_incident_id = p_incident_id;

  -- Cancel any pending outbox delivery for this incident.
  update public.incident_delivery_outbox set status = 'canceled',
    suppression_reason = 'incident_canceled'
    where incident_id = p_incident_id and status in ('pending', 'processing');

  perform app.append_incident_event(p_incident_id, p_organization_id, 'incident.canceled',
    'Incident canceled', coalesce(left(p_reason, 280), 'An operator canceled this incident.'),
    'internal', 'user', p_actor_user_id, null, null, null, '{}'::jsonb, now());
  perform app.record_incident_outbox(p_organization_id, p_incident_id, null,
    'incident.canceled', p_incident_id::text || ':canceled', '{}'::jsonb);
  -- Remove the public projection for a canceled (never-real) incident.
  delete from public.incident_public_projections where incident_id = p_incident_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Maintenance lifecycle.
-- ---------------------------------------------------------------------------

-- Activate scheduled occurrences whose time has arrived, complete active
-- occurrences whose end has passed, and restore monitor evaluation. Idempotent.
-- Designed to be called on a schedule (worker tick) or manually by an admin.
create or replace function public.maintenance_tick(p_organization_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public, app
as $$
declare
  r record;
  v_started integer := 0;
  v_ended integer := 0;
begin
  -- Start due occurrences.
  for r in
    select mo.id, mo.organization_id, mo.maintenance_window_id
    from public.maintenance_occurrences mo
    where mo.status = 'scheduled' and mo.starts_at <= now() and mo.ends_at > now()
      and (p_organization_id is null or mo.organization_id = p_organization_id)
    for update skip locked
  loop
    update public.maintenance_occurrences set status = 'active', started_at = now() where id = r.id;
    update public.maintenance_windows set status = 'active' where id = r.maintenance_window_id;
    update public.monitor_operational_states os set
      pre_maintenance_state = coalesce(os.pre_maintenance_state, os.state),
      state = 'maintenance', maintenance_occurrence_id = r.id, lock_version = os.lock_version + 1
      from public.maintenance_monitor_links ml
      where ml.maintenance_window_id = r.maintenance_window_id and ml.monitor_id = os.monitor_id;
    v_started := v_started + 1;
  end loop;

  -- Complete ended occurrences. Restore state; do NOT assume operational.
  for r in
    select mo.id, mo.organization_id, mo.maintenance_window_id
    from public.maintenance_occurrences mo
    where mo.status = 'active' and mo.ends_at <= now()
      and (p_organization_id is null or mo.organization_id = p_organization_id)
    for update skip locked
  loop
    update public.maintenance_occurrences set status = 'completed', ended_at = now() where id = r.id;
    update public.maintenance_windows mw set status = 'completed'
      where mw.id = r.maintenance_window_id
        and not exists (
          select 1 from public.maintenance_occurrences x
          where x.maintenance_window_id = mw.id and x.status in ('scheduled', 'active')
        );
    -- Restore each monitor to its pre-maintenance state and let the next real
    -- check re-confirm. Never blanket-mark healthy.
    update public.monitor_operational_states os set
      state = coalesce(os.pre_maintenance_state, 'unknown'),
      pre_maintenance_state = null, maintenance_occurrence_id = null,
      state_since = now(), lock_version = os.lock_version + 1
      where os.maintenance_occurrence_id = r.id;
    v_ended := v_ended + 1;
  end loop;

  return jsonb_build_object('started', v_started, 'ended', v_ended);
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants: service_role only. Never anon/authenticated.
-- ---------------------------------------------------------------------------
do $$
declare
  fn text;
begin
  for fn in
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'process_incident_evaluations', 'detect_missed_heartbeats', 'reconcile_incident_state',
      'replay_check_evaluation', 'incident_create_manual', 'incident_attach_monitor',
      'incident_remove_monitor', 'incident_acknowledge', 'incident_assign',
      'incident_change_severity', 'incident_add_update', 'incident_add_note',
      'incident_resolve', 'incident_cancel', 'maintenance_tick'
    )
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end;
$$;
