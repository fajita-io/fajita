-- Phase 7: emit the additional outbox events that alert routing consumes.
--
-- Phase 6 emitted six incident events. Alert routing also offers maintenance
-- and public incident-update routing, so this migration extends two existing
-- functions (additively) and adds one helper to emit those events into the
-- same durable incident_delivery_outbox the delivery service consumes. SSL and
-- heartbeat alerts are derived by the consumer from the incident's correlation
-- key, so they need no new emission here.
--
--   * maintenance_tick        -> emits maintenance.started / maintenance.completed
--   * maintenance_notify      -> emits maintenance.scheduled/updated/canceled
--   * incident_add_update     -> emits incident.updated for public-ready updates
--
-- Forward-only migration. These are CREATE OR REPLACE of the Phase 6 bodies
-- with outbox writes appended; behavior is otherwise unchanged.

-- ---------------------------------------------------------------------------
-- maintenance_tick: same activation/completion logic, now emitting outbox rows.
-- ---------------------------------------------------------------------------
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
  v_window record;
begin
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

    perform app.record_incident_outbox(r.organization_id, null, null, 'maintenance.started',
      'maint:' || r.id::text || ':started',
      jsonb_build_object('maintenance_window_id', r.maintenance_window_id, 'occurrence_id', r.id));
    v_started := v_started + 1;
  end loop;

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
    update public.monitor_operational_states os set
      state = coalesce(os.pre_maintenance_state, 'unknown'),
      pre_maintenance_state = null, maintenance_occurrence_id = null,
      state_since = now(), lock_version = os.lock_version + 1
      where os.maintenance_occurrence_id = r.id;

    perform app.record_incident_outbox(r.organization_id, null, null, 'maintenance.completed',
      'maint:' || r.id::text || ':completed',
      jsonb_build_object('maintenance_window_id', r.maintenance_window_id, 'occurrence_id', r.id));
    v_ended := v_ended + 1;
  end loop;

  return jsonb_build_object('started', v_started, 'ended', v_ended);
end;
$$;

-- ---------------------------------------------------------------------------
-- maintenance_notify: emit scheduled / updated / canceled maintenance events.
-- Called by the application after a window is created, edited, or canceled.
-- ---------------------------------------------------------------------------
create or replace function public.maintenance_notify(
  p_organization_id uuid, p_window_id uuid, p_event_type text
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_key text;
begin
  if p_event_type not in ('maintenance.scheduled', 'maintenance.updated', 'maintenance.canceled') then
    raise exception 'unsupported maintenance event %', p_event_type;
  end if;
  -- Scheduled / canceled are once per window; updated includes a timestamp so
  -- each distinct edit can notify.
  v_key := case
    when p_event_type = 'maintenance.updated'
      then 'maint:' || p_window_id::text || ':updated:' || extract(epoch from clock_timestamp())::bigint::text
    else 'maint:' || p_window_id::text || ':' || split_part(p_event_type, '.', 2)
  end;

  perform app.record_incident_outbox(p_organization_id, null, null, p_event_type, v_key,
    jsonb_build_object('maintenance_window_id', p_window_id));
end;
$$;

-- ---------------------------------------------------------------------------
-- incident_add_update: same behavior, now emitting incident.updated for
-- public-ready operator updates (internal notes never emit).
-- ---------------------------------------------------------------------------
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
  v_monitor uuid;
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

  -- Public-ready updates may route externally; internal notes never do.
  if coalesce(p_visibility, 'internal') = 'public_ready' then
    select primary_monitor_id into v_monitor from public.incidents where id = p_incident_id;
    perform app.record_incident_outbox(p_organization_id, p_incident_id, v_monitor,
      'incident.updated', p_incident_id::text || ':update:' || v_id::text,
      jsonb_build_object('update_type', coalesce(p_update_type, 'informational')));
  end if;

  return v_id;
end;
$$;

-- Grant the new maintenance_notify to service_role only.
do $$
declare
  fn text;
begin
  for fn in
    select p.oid::regprocedure::text
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'maintenance_notify'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end;
$$;
