-- Phase 5: customer monitor organization and export foundation.
--
-- Adds the tenant-scoped tables the customer monitor product needs on top of
-- the Phase 4 engine: groups, tags, tag assignments, and export requests, plus
-- two columns on monitors (group membership and archive state). No Phase 4
-- table is edited destructively. Forward-only; add a new migration to change.
--
-- Every table carries organization_id and references public.organizations(id).
-- RLS is enabled in the companion migration. Writes run through the service
-- role after an explicit code authorization check, exactly as Phase 3 and 4.

-- ---------------------------------------------------------------------------
-- monitor_groups: a named container for monitors (Production, Customer APIs,
-- Internal Jobs). Deleting a group never deletes its monitors; the group_id on
-- monitors is set null (see the FK below).
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  position integer not null default 0,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint monitor_groups_name_len check (char_length(name) between 1 and 80),
  constraint monitor_groups_desc_len check (char_length(description) <= 500)
);

-- One live group name per organization (case-insensitive), enforced only for
-- non-deleted rows so a name can be reused after deletion.
create unique index if not exists monitor_groups_org_name_key
  on public.monitor_groups (organization_id, lower(name))
  where deleted_at is null;
create index if not exists monitor_groups_org_idx
  on public.monitor_groups (organization_id, position)
  where deleted_at is null;

create trigger monitor_groups_touch
  before update on public.monitor_groups
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- monitor_tags: flexible, organization-scoped labels. Names are normalized to
-- lower case at the application layer; the unique index enforces no duplicates.
-- color_token references a fixed accessible palette, never an arbitrary hex.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  color_token text not null default 'neutral'
    check (color_token in (
      'neutral', 'ember', 'amber', 'lime', 'sky', 'violet', 'rose', 'slate'
    )),
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint monitor_tags_name_len check (char_length(name) between 1 and 40)
);

create unique index if not exists monitor_tags_org_name_key
  on public.monitor_tags (organization_id, lower(name))
  where deleted_at is null;
create index if not exists monitor_tags_org_idx
  on public.monitor_tags (organization_id)
  where deleted_at is null;

create trigger monitor_tags_touch
  before update on public.monitor_tags
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- monitor_tag_assignments: many-to-many between monitors and tags. Both sides
-- carry organization_id and the pair is unique. A trigger guards against
-- cross-tenant assignment as defense in depth beyond the service-role checks.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_tag_assignments (
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  tag_id uuid not null references public.monitor_tags (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (monitor_id, tag_id)
);

create index if not exists monitor_tag_assignments_tag_idx
  on public.monitor_tag_assignments (tag_id);
create index if not exists monitor_tag_assignments_org_idx
  on public.monitor_tag_assignments (organization_id);

-- Defense in depth: the monitor, the tag, and the assignment must all belong to
-- the same organization. Blocks attaching another org's tag even if a caller
-- somehow supplied mismatched ids.
create or replace function app.enforce_tag_assignment_tenancy()
returns trigger
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_monitor_org uuid;
  v_tag_org uuid;
begin
  select organization_id into v_monitor_org
    from public.monitors where id = new.monitor_id;
  select organization_id into v_tag_org
    from public.monitor_tags where id = new.tag_id;
  if v_monitor_org is null or v_tag_org is null then
    raise exception 'monitor or tag not found';
  end if;
  if v_monitor_org <> new.organization_id or v_tag_org <> new.organization_id then
    raise exception 'cross-tenant tag assignment rejected';
  end if;
  return new;
end;
$$;

drop trigger if exists monitor_tag_assignments_tenancy on public.monitor_tag_assignments;
create trigger monitor_tag_assignments_tenancy
  before insert or update on public.monitor_tag_assignments
  for each row execute function app.enforce_tag_assignment_tenancy();

-- ---------------------------------------------------------------------------
-- monitors: group membership and archive state.
-- ---------------------------------------------------------------------------
alter table public.monitors
  add column if not exists group_id uuid;
alter table public.monitors
  drop constraint if exists monitors_group_fk;
alter table public.monitors
  add constraint monitors_group_fk
  foreign key (group_id)
  references public.monitor_groups (id)
  on delete set null;

alter table public.monitors
  add column if not exists archived_at timestamptz;

create index if not exists monitors_org_group_idx
  on public.monitors (organization_id, group_id)
  where deleted_at is null;
create index if not exists monitors_org_archived_idx
  on public.monitors (organization_id)
  where deleted_at is null and archived_at is null;

-- Allow the 'archived' lifecycle status alongside the Phase 4 set. Archive is
-- represented by archived_at plus status = 'archived'; deletion keeps its own
-- pending_deletion / deleted states.
alter table public.monitors
  drop constraint if exists monitors_status_check;
alter table public.monitors
  add constraint monitors_status_check check (
    status in (
      'draft', 'active', 'paused', 'disabled',
      'archived', 'pending_deletion', 'deleted'
    )
  );

-- ---------------------------------------------------------------------------
-- monitor_export_requests: server-generated exports of safe monitor data.
-- The generated artifact is stored out of band; only the request row lives
-- here. Never contains secret values or full sensitive URLs.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_export_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid references public.monitors (id) on delete set null,
  requested_by_user_id uuid references public.user_profiles (id),
  format text not null check (format in ('csv', 'json')),
  scope text not null check (scope in ('results', 'configuration', 'monitor_list')),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed', 'expired')),
  row_count integer,
  storage_path text,
  error_summary text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint monitor_export_error_len check (char_length(error_summary) <= 500)
);

create index if not exists monitor_export_requests_org_idx
  on public.monitor_export_requests (organization_id, created_at desc);
create index if not exists monitor_export_requests_monitor_idx
  on public.monitor_export_requests (monitor_id, created_at desc);
