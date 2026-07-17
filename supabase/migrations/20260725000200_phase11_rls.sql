-- Phase 11: row-level security for onboarding + lifecycle tables.
--
-- Same model as every earlier phase: customers get SELECT-only access to their
-- own rows for defense in depth; all writes go through the service role after
-- TypeScript authorization. Engine-internal and analytics tables get NO
-- customer policy at all, so RLS denies every customer read:
--
--   * onboarding_events        -> internal funnel source
--   * lifecycle_events         -> internal lifecycle log
--   * lifecycle_suppressions   -> provider suppression ledger
--
-- Cancellation feedback columns live on billing_cancellation_records, which
-- already has admin-or-owner SELECT from Phase 10. Forward-only migration.

-- ----- Onboarding -----
alter table public.organization_onboarding_steps enable row level security;
create policy organization_onboarding_steps_select_member
  on public.organization_onboarding_steps
  for select to authenticated
  using (app.is_org_member(organization_id));

-- Internal funnel source: no customer policy.
alter table public.onboarding_events enable row level security;

alter table public.user_onboarding enable row level security;
create policy user_onboarding_select_own on public.user_onboarding
  for select to authenticated
  using (user_id = app.current_profile_id());

-- ----- Lifecycle state -----
alter table public.lifecycle_states enable row level security;
create policy lifecycle_states_select_admin on public.lifecycle_states
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

-- Internal lifecycle log: no customer policy.
alter table public.lifecycle_events enable row level security;

-- ----- Lifecycle email -----
alter table public.lifecycle_email_preferences enable row level security;
create policy lifecycle_email_preferences_select_own
  on public.lifecycle_email_preferences
  for select to authenticated
  using (user_id = app.current_profile_id());

-- Suppression ledger: no customer policy (contains provider event ids).
alter table public.lifecycle_suppressions enable row level security;

-- Users can see their own lifecycle deliveries; org admins see org summaries
-- through the application layer (service role) with masking, not raw RLS.
alter table public.lifecycle_delivery_intents enable row level security;
create policy lifecycle_delivery_intents_select_own
  on public.lifecycle_delivery_intents
  for select to authenticated
  using (user_id = app.current_profile_id());

alter table public.lifecycle_delivery_attempts enable row level security;
create policy lifecycle_delivery_attempts_select_own
  on public.lifecycle_delivery_attempts
  for select to authenticated
  using (
    exists (
      select 1 from public.lifecycle_delivery_intents i
      where i.id = intent_id and i.user_id = app.current_profile_id()
    )
  );

-- ----- Reports -----
alter table public.weekly_reports enable row level security;
create policy weekly_reports_select_member on public.weekly_reports
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.organization_report_settings enable row level security;
create policy organization_report_settings_select_member
  on public.organization_report_settings
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.weekly_report_recipients enable row level security;
create policy weekly_report_recipients_select_member
  on public.weekly_report_recipients
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ----- Incident recaps -----
alter table public.incident_recaps enable row level security;
create policy incident_recaps_select_member on public.incident_recaps
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.incident_recap_revisions enable row level security;
create policy incident_recap_revisions_select_member
  on public.incident_recap_revisions
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.incident_follow_up_actions enable row level security;
create policy incident_follow_up_actions_select_member
  on public.incident_follow_up_actions
  for select to authenticated
  using (app.is_org_member(organization_id));
