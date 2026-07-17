-- Phase 8: row-level security for status-page tables.
--
-- Trust model (identical to Phases 4-7):
--   * Customer sessions (authenticated role) get read-only, org-scoped access
--     to management tables so the app can render dashboards.
--   * NO insert/update/delete policies exist, so customers can never write
--     status-page config, publication state, domain verification, TLS status,
--     versions, snapshots, or subscriber records directly. All writes go
--     through the service role after an explicit TypeScript permission check.
--   * Public-facing anonymous rendering does NOT read these tables. The public
--     renderer reads status_page_public_snapshots server-side with the service
--     role. That table therefore has RLS enabled with NO anon policy: it is
--     invisible to the anon role and to authenticated cross-tenant callers,
--     but authenticated members may read their own org's snapshot for preview.
--   * Subscriber tables require an explicit future permission to read; no anon
--     access, ever. Emails are never exposed publicly.

alter table public.status_pages enable row level security;
alter table public.status_page_component_groups enable row level security;
alter table public.status_page_components enable row level security;
alter table public.status_page_component_monitors enable row level security;
alter table public.status_page_incidents enable row level security;
alter table public.status_page_maintenance enable row level security;
alter table public.status_page_manual_messages enable row level security;
alter table public.status_page_versions enable row level security;
alter table public.status_page_domains enable row level security;
alter table public.status_page_domain_verifications enable row level security;
alter table public.status_page_brand_assets enable row level security;
alter table public.status_page_public_snapshots enable row level security;
alter table public.status_page_uptime_summaries enable row level security;
alter table public.status_page_subscribers enable row level security;
alter table public.status_page_subscriber_preferences enable row level security;
alter table public.status_page_analytics_events enable row level security;

-- ---------------------------------------------------------------------------
-- Customer-readable, org-scoped. SELECT only for active members.
-- ---------------------------------------------------------------------------
drop policy if exists status_pages_select_member on public.status_pages;
create policy status_pages_select_member on public.status_pages
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

drop policy if exists status_page_component_groups_select_member on public.status_page_component_groups;
create policy status_page_component_groups_select_member on public.status_page_component_groups
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

drop policy if exists status_page_components_select_member on public.status_page_components;
create policy status_page_components_select_member on public.status_page_components
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

drop policy if exists status_page_component_monitors_select_member on public.status_page_component_monitors;
create policy status_page_component_monitors_select_member on public.status_page_component_monitors
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_incidents_select_member on public.status_page_incidents;
create policy status_page_incidents_select_member on public.status_page_incidents
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_maintenance_select_member on public.status_page_maintenance;
create policy status_page_maintenance_select_member on public.status_page_maintenance
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_manual_messages_select_member on public.status_page_manual_messages;
create policy status_page_manual_messages_select_member on public.status_page_manual_messages
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_versions_select_member on public.status_page_versions;
create policy status_page_versions_select_member on public.status_page_versions
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_domains_select_member on public.status_page_domains;
create policy status_page_domains_select_member on public.status_page_domains
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_domain_verifications_select_member on public.status_page_domain_verifications;
create policy status_page_domain_verifications_select_member on public.status_page_domain_verifications
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_brand_assets_select_member on public.status_page_brand_assets;
create policy status_page_brand_assets_select_member on public.status_page_brand_assets
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

drop policy if exists status_page_uptime_summaries_select_member on public.status_page_uptime_summaries;
create policy status_page_uptime_summaries_select_member on public.status_page_uptime_summaries
  for select to authenticated
  using (app.is_org_member(organization_id));

-- The public snapshot is readable by members for preview/status in the app.
-- Anonymous visitors never hit this table: the public renderer uses the
-- service role. There is deliberately no anon policy.
drop policy if exists status_page_public_snapshots_select_member on public.status_page_public_snapshots;
create policy status_page_public_snapshots_select_member on public.status_page_public_snapshots
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists status_page_analytics_events_select_member on public.status_page_analytics_events;
create policy status_page_analytics_events_select_member on public.status_page_analytics_events
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- Subscriber tables: NO authenticated read policy here. Subscriber PII is
-- readable only through the service role after a future status_page.subscriber
-- permission check (Phase 9). No anon access. This keeps emails private by
-- default even from ordinary members until the subscriber surface ships.
--
--   status_page_subscribers            (no select policy)
--   status_page_subscriber_preferences (no select policy)
--
-- No write policies exist on ANY Phase 8 table for the authenticated role, so
-- customers can never publish status, forge domain/TLS state, write snapshots,
-- or collect subscribers directly.
-- ---------------------------------------------------------------------------
