-- Phase 6: row-level security for incident and maintenance tables.
--
-- Trust model is identical to Phase 4:
--   * Customer sessions (authenticated role) get read-only, org-scoped access.
--   * No INSERT/UPDATE/DELETE policies exist, so customers can never write
--     incident state, evidence, outbox delivery status, or projections.
--   * Application writes use the service role after explicit TypeScript
--     authorization (incidents:manage / maintenance permissions).
--   * Engine-internal tables (outbox, evaluation queue, projections, counters)
--     have NO read policy: they are invisible to customers entirely. Public
--     projections stay private until Phase 8 exposes status pages.

alter table public.monitor_operational_states enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_counters enable row level security;
alter table public.incident_monitors enable row level security;
alter table public.incident_events enable row level security;
alter table public.incident_state_transitions enable row level security;
alter table public.incident_evidence enable row level security;
alter table public.incident_updates enable row level security;
alter table public.incident_notes enable row level security;
alter table public.incident_acknowledgments enable row level security;
alter table public.incident_assignments enable row level security;
alter table public.incident_public_projections enable row level security;
alter table public.incident_delivery_outbox enable row level security;
alter table public.monitor_state_evaluations enable row level security;
alter table public.maintenance_windows enable row level security;
alter table public.maintenance_monitor_links enable row level security;
alter table public.maintenance_occurrences enable row level security;
alter table public.incident_suppressions enable row level security;

-- ---------------------------------------------------------------------------
-- Customer-readable, org-scoped. SELECT only for active members.
-- ---------------------------------------------------------------------------
drop policy if exists monitor_operational_states_select_member on public.monitor_operational_states;
create policy monitor_operational_states_select_member on public.monitor_operational_states
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incidents_select_member on public.incidents;
create policy incidents_select_member on public.incidents
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

drop policy if exists incident_monitors_select_member on public.incident_monitors;
create policy incident_monitors_select_member on public.incident_monitors
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incident_events_select_member on public.incident_events;
create policy incident_events_select_member on public.incident_events
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incident_state_transitions_select_member on public.incident_state_transitions;
create policy incident_state_transitions_select_member on public.incident_state_transitions
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incident_evidence_select_member on public.incident_evidence;
create policy incident_evidence_select_member on public.incident_evidence
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incident_updates_select_member on public.incident_updates;
create policy incident_updates_select_member on public.incident_updates
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incident_notes_select_member on public.incident_notes;
create policy incident_notes_select_member on public.incident_notes
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

drop policy if exists incident_acknowledgments_select_member on public.incident_acknowledgments;
create policy incident_acknowledgments_select_member on public.incident_acknowledgments
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incident_assignments_select_member on public.incident_assignments;
create policy incident_assignments_select_member on public.incident_assignments
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists incident_suppressions_select_member on public.incident_suppressions;
create policy incident_suppressions_select_member on public.incident_suppressions
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists maintenance_windows_select_member on public.maintenance_windows;
create policy maintenance_windows_select_member on public.maintenance_windows
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists maintenance_monitor_links_select_member on public.maintenance_monitor_links;
create policy maintenance_monitor_links_select_member on public.maintenance_monitor_links
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists maintenance_occurrences_select_member on public.maintenance_occurrences;
create policy maintenance_occurrences_select_member on public.maintenance_occurrences
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- Engine-internal tables. NO read policy for the authenticated role: they are
-- invisible to customers. Reachable only through the service role or the
-- restricted worker functions.
--
--   incident_public_projections  (private until Phase 8 status pages)
--   incident_delivery_outbox     (delivery is Phase 7; customers cannot forge status)
--   monitor_state_evaluations    (internal evaluation queue)
--   incident_counters            (internal sequence)
--
-- No write policies exist on ANY Phase 6 table for the authenticated role, so
-- customers can never write incident state, evidence, or delivery status.
-- ---------------------------------------------------------------------------
