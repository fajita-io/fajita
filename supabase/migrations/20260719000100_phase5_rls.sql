-- Phase 5: row-level security for monitor organization and export tables.
--
-- Same trust model as Phase 4: the authenticated (customer) role gets read-only
-- org-scoped visibility. No write policies exist, so customers can never write
-- directly; every mutation runs through the service role after an explicit code
-- authorization check. Tenant isolation is enforced by app.is_org_member on the
-- row's organization_id.

alter table public.monitor_groups enable row level security;
alter table public.monitor_tags enable row level security;
alter table public.monitor_tag_assignments enable row level security;
alter table public.monitor_export_requests enable row level security;

-- Groups: readable by active members of the owning organization.
drop policy if exists monitor_groups_select_member on public.monitor_groups;
create policy monitor_groups_select_member on public.monitor_groups
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

-- Tags: readable by active members of the owning organization.
drop policy if exists monitor_tags_select_member on public.monitor_tags;
create policy monitor_tags_select_member on public.monitor_tags
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

-- Tag assignments: readable by active members of the owning organization.
drop policy if exists monitor_tag_assignments_select_member on public.monitor_tag_assignments;
create policy monitor_tag_assignments_select_member on public.monitor_tag_assignments
  for select to authenticated
  using (app.is_org_member(organization_id));

-- Export requests: readable by active members so a requester can see status.
-- The generated artifact itself is served through a short-lived signed URL by
-- the application, never by direct table access.
drop policy if exists monitor_export_requests_select_member on public.monitor_export_requests;
create policy monitor_export_requests_select_member on public.monitor_export_requests
  for select to authenticated
  using (app.is_org_member(organization_id));

-- No write policies are defined for the authenticated role on any of these
-- tables. Under RLS without a permissive write policy, all customer writes are
-- denied; the service role (application) performs writes after authorization.
