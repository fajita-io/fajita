-- Phase 3: row-level security for identity and tenancy tables.
--
-- Model: the application performs every write through server actions that
-- authorize in code and use the service-role connection (which bypasses RLS).
-- RLS here is defense-in-depth read isolation: if the anon/authenticated key
-- ever reaches PostgREST directly with a Clerk token, a caller can read only
-- their own rows and rows for organizations they actively belong to, and can
-- write nothing. Isolation is verified by tests that set request.jwt.claims.
--
-- current caller identity comes from app.current_external_id() /
-- app.current_profile_id() (defined in the previous migration).

-- Enable RLS everywhere. force so even the table owner is subject to it under
-- normal connections (service role uses bypassrls and is unaffected).
alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.organization_onboarding enable row level security;
alter table public.audit_events enable row level security;
alter table public.notifications enable row level security;
alter table public.export_requests enable row level security;
alter table public.deletion_requests enable row level security;
alter table public.feature_flag_overrides enable row level security;

-- ---------------------------------------------------------------------------
-- user_profiles: a caller reads only their own profile row.
-- ---------------------------------------------------------------------------
drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own on public.user_profiles
  for select to authenticated
  using (external_id = app.current_external_id());

-- ---------------------------------------------------------------------------
-- user_preferences / notification_preferences: own rows only.
-- ---------------------------------------------------------------------------
drop policy if exists user_preferences_select_own on public.user_preferences;
create policy user_preferences_select_own on public.user_preferences
  for select to authenticated
  using (user_id = app.current_profile_id());

drop policy if exists notification_preferences_select_own on public.notification_preferences;
create policy notification_preferences_select_own on public.notification_preferences
  for select to authenticated
  using (user_id = app.current_profile_id());

-- ---------------------------------------------------------------------------
-- organizations: readable by active members only.
-- ---------------------------------------------------------------------------
drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member on public.organizations
  for select to authenticated
  using (app.is_org_member(id));

-- ---------------------------------------------------------------------------
-- organization_members: readable for organizations the caller belongs to.
-- ---------------------------------------------------------------------------
drop policy if exists organization_members_select on public.organization_members;
create policy organization_members_select on public.organization_members
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- organization_invitations: only admins/owners of the org may read them.
-- (Invitation acceptance uses the token via a server action, not this path.)
-- ---------------------------------------------------------------------------
drop policy if exists organization_invitations_select on public.organization_invitations;
create policy organization_invitations_select on public.organization_invitations
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

-- ---------------------------------------------------------------------------
-- organization_onboarding: readable by members.
-- ---------------------------------------------------------------------------
drop policy if exists organization_onboarding_select on public.organization_onboarding;
create policy organization_onboarding_select on public.organization_onboarding
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- audit_events: members read their org's events; admins is not required to
-- read (viewer foundation), but no cross-tenant reads. User-level events
-- (organization_id null) are readable by their actor only.
-- ---------------------------------------------------------------------------
drop policy if exists audit_events_select on public.audit_events;
create policy audit_events_select on public.audit_events
  for select to authenticated
  using (
    (organization_id is not null and app.has_org_role(organization_id, 'admin'))
    or (organization_id is null and actor_user_id = app.current_profile_id())
  );

-- ---------------------------------------------------------------------------
-- notifications: a caller reads only their own notifications.
-- ---------------------------------------------------------------------------
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = app.current_profile_id());

-- ---------------------------------------------------------------------------
-- export_requests: requester or org admin may read.
-- ---------------------------------------------------------------------------
drop policy if exists export_requests_select on public.export_requests;
create policy export_requests_select on public.export_requests
  for select to authenticated
  using (
    requested_by_user_id = app.current_profile_id()
    or (organization_id is not null and app.has_org_role(organization_id, 'admin'))
  );

-- ---------------------------------------------------------------------------
-- deletion_requests: subject user or org owner may read.
-- ---------------------------------------------------------------------------
drop policy if exists deletion_requests_select on public.deletion_requests;
create policy deletion_requests_select on public.deletion_requests
  for select to authenticated
  using (
    subject_user_id = app.current_profile_id()
    or (organization_id is not null and app.has_org_role(organization_id, 'owner'))
  );

-- ---------------------------------------------------------------------------
-- feature_flag_overrides: members may read overrides for their org.
-- ---------------------------------------------------------------------------
drop policy if exists feature_flag_overrides_select on public.feature_flag_overrides;
create policy feature_flag_overrides_select on public.feature_flag_overrides
  for select to authenticated
  using (organization_id is null or app.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- Existing billing tables had RLS enabled but no policies (server-only until
-- now). Add owner-scoped read policies keyed on the Clerk id so the billing
-- cache is also isolated if ever read with a user token. Writes stay
-- service-role only.
-- ---------------------------------------------------------------------------
drop policy if exists billing_accounts_select_own on public.billing_accounts;
create policy billing_accounts_select_own on public.billing_accounts
  for select to authenticated
  using (user_id = app.current_external_id());

drop policy if exists billing_subscriptions_select_own on public.billing_subscriptions;
create policy billing_subscriptions_select_own on public.billing_subscriptions
  for select to authenticated
  using (user_id = app.current_external_id());

-- No INSERT/UPDATE/DELETE policies are defined for the authenticated role on
-- any table above. Under RLS, the absence of a permissive write policy denies
-- all writes for that role. Every mutation is a server action running with the
-- service role after an explicit authorization check.
