-- Phase 3: secure multi-tenant identity, organizations, and account foundation.
--
-- Identity authority is Clerk. This schema stores the minimum application
-- profile and all authorization/tenancy records. The bridge between Clerk and
-- Postgres is the Clerk user id, carried in the JWT `sub` claim and mirrored to
-- user_profiles.external_id. Internal relations use stable uuid keys, never the
-- email address and never the mutable slug.
--
-- Forward-only migration. Do not edit after it is applied; add new migrations.

create schema if not exists app;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

-- Keeps updated_at honest on every row change.
create or replace function app.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Current Clerk user id from the request JWT. Reads the same GUC that
-- Supabase's auth.jwt() reads, so it works under PostgREST and in SQL tests
-- that set request.jwt.claims directly. Empty/absent claim yields null.
create or replace function app.current_external_id()
returns text
language sql
stable
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------------

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  primary_email text,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  theme_preference text not null default 'system'
    check (theme_preference in ('light', 'dark', 'system')),
  reduced_motion_preference text not null default 'system'
    check (reduced_motion_preference in ('reduce', 'no-preference', 'system')),
  product_email_preference boolean not null default true,
  marketing_email_preference boolean not null default false,
  onboarding_status text not null default 'account_created'
    check (onboarding_status in (
      'account_created', 'email_verified', 'organization_created', 'completed'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz,
  deleted_at timestamptz,
  suspended_at timestamptz,
  constraint user_profiles_display_name_len check (char_length(display_name) <= 120),
  constraint user_profiles_email_len check (char_length(primary_email) <= 320)
);

create index if not exists user_profiles_email_idx
  on public.user_profiles (lower(primary_email));

create trigger user_profiles_touch
  before update on public.user_profiles
  for each row execute function app.touch_updated_at();

-- Resolve the current caller's internal profile id. security definer so it can
-- read user_profiles without tripping that table's own RLS (avoids recursion
-- when other policies call it). Excludes soft-deleted profiles.
create or replace function app.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public, app
as $$
  select id
  from public.user_profiles
  where external_id = app.current_external_id()
    and deleted_at is null
    and suspended_at is null;
$$;

-- ---------------------------------------------------------------------------
-- user_preferences (richer display preferences, separate from synced identity)
-- ---------------------------------------------------------------------------

create table if not exists public.user_preferences (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  date_format text not null default 'YYYY-MM-DD'
    check (date_format in ('YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'DD MMM YYYY')),
  time_format text not null default '24h' check (time_format in ('12h', '24h')),
  week_start text not null default 'monday' check (week_start in ('sunday', 'monday')),
  default_landing text not null default 'overview'
    check (default_landing in ('overview', 'team', 'settings')),
  chart_density text not null default 'comfortable'
    check (chart_density in ('comfortable', 'compact')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_touch
  before update on public.user_preferences
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- notification_preferences (in-app + email categories, not monitoring alerts)
-- ---------------------------------------------------------------------------

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  product_updates boolean not null default true,
  changelog_digest boolean not null default false,
  feature_announcements boolean not null default true,
  account_activity boolean not null default true,
  education boolean not null default true,
  marketing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_preferences_touch
  before update on public.notification_preferences
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  owner_user_id uuid not null references public.user_profiles (id),
  default_timezone text not null default 'UTC',
  default_locale text not null default 'en',
  status text not null default 'active'
    check (status in ('active', 'suspended', 'pending_deletion', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint organizations_name_len check (char_length(name) between 1 and 120),
  constraint organizations_slug_format
    check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$')
);

create index if not exists organizations_owner_idx
  on public.organizations (owner_user_id);
create index if not exists organizations_status_idx
  on public.organizations (status);

create trigger organizations_touch
  before update on public.organizations
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- organization_members
-- ---------------------------------------------------------------------------

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active'
    check (status in ('active', 'suspended', 'removed')),
  invited_by_user_id uuid references public.user_profiles (id),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_idx
  on public.organization_members (user_id);
create index if not exists organization_members_org_idx
  on public.organization_members (organization_id);
-- At most one active owner per organization.
create unique index if not exists organization_members_one_owner_idx
  on public.organization_members (organization_id)
  where role = 'owner' and status = 'active';

create trigger organization_members_touch
  before update on public.organization_members
  for each row execute function app.touch_updated_at();

-- Membership role of the current caller in an organization (active only).
-- security definer to bypass RLS and avoid policy recursion.
create or replace function app.org_role(org uuid)
returns text
language sql
stable
security definer
set search_path = public, app
as $$
  select m.role
  from public.organization_members m
  where m.organization_id = org
    and m.user_id = app.current_profile_id()
    and m.status = 'active';
$$;

create or replace function app.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.org_role(org) is not null;
$$;

-- Role hierarchy check: does the caller hold at least `min_role` in `org`?
create or replace function app.has_org_role(org uuid, min_role text)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select case app.org_role(org)
    when 'owner' then true
    when 'admin' then min_role in ('admin', 'member')
    when 'member' then min_role = 'member'
    else false
  end;
$$;

-- ---------------------------------------------------------------------------
-- organization_invitations
-- ---------------------------------------------------------------------------

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token_hash text not null unique,
  invited_by_user_id uuid references public.user_profiles (id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by_user_id uuid references public.user_profiles (id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint organization_invitations_email_lower check (email = lower(email))
);

-- One live (pending) invitation per org+email. Accepted/revoked/expired rows
-- do not block re-inviting.
create unique index if not exists organization_invitations_active_idx
  on public.organization_invitations (organization_id, email)
  where accepted_at is null and revoked_at is null;

create index if not exists organization_invitations_org_idx
  on public.organization_invitations (organization_id);

-- ---------------------------------------------------------------------------
-- organization_onboarding (org-level checklist + product context)
-- ---------------------------------------------------------------------------

create table if not exists public.organization_onboarding (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  version integer not null default 1,
  steps jsonb not null default '{}'::jsonb,
  use_case text,
  monitoring_scope text check (monitoring_scope in ('own', 'client')),
  service_count text,
  alert_destination text,
  plans_status_page boolean,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organization_onboarding_touch
  before update on public.organization_onboarding
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- audit_events (append-only, tenant-scoped)
-- ---------------------------------------------------------------------------

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_user_id uuid references public.user_profiles (id),
  actor_type text not null default 'user'
    check (actor_type in ('user', 'system', 'platform_admin', 'service')),
  action text not null,
  target_type text,
  target_id text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  correlation_id text,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_org_created_idx
  on public.audit_events (organization_id, created_at desc);
create index if not exists audit_events_actor_idx
  on public.audit_events (actor_user_id);

-- ---------------------------------------------------------------------------
-- notifications (in-app)
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  category text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

-- ---------------------------------------------------------------------------
-- export_requests
-- ---------------------------------------------------------------------------

create table if not exists public.export_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  requested_by_user_id uuid not null references public.user_profiles (id),
  scope text not null check (scope in ('user', 'organization')),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed', 'expired', 'canceled')),
  download_path text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists export_requests_org_idx
  on public.export_requests (organization_id);
create index if not exists export_requests_user_idx
  on public.export_requests (requested_by_user_id);

create trigger export_requests_touch
  before update on public.export_requests
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- deletion_requests
-- ---------------------------------------------------------------------------

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('user', 'organization')),
  subject_user_id uuid references public.user_profiles (id),
  organization_id uuid references public.organizations (id) on delete cascade,
  requested_by_user_id uuid not null references public.user_profiles (id),
  status text not null default 'pending'
    check (status in ('pending', 'scheduled', 'canceled', 'completed')),
  scheduled_for timestamptz,
  canceled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deletion_requests_subject_ref check (
    (subject_type = 'user' and subject_user_id is not null)
    or (subject_type = 'organization' and organization_id is not null)
  )
);

create index if not exists deletion_requests_org_idx
  on public.deletion_requests (organization_id);
create index if not exists deletion_requests_user_idx
  on public.deletion_requests (subject_user_id);

create trigger deletion_requests_touch
  before update on public.deletion_requests
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- feature_flag_overrides (code registry is source of truth; DB targets orgs)
-- ---------------------------------------------------------------------------

create table if not exists public.feature_flag_overrides (
  id uuid primary key default gen_random_uuid(),
  flag_key text not null,
  organization_id uuid references public.organizations (id) on delete cascade,
  enabled boolean not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (flag_key, organization_id)
);

create index if not exists feature_flag_overrides_key_idx
  on public.feature_flag_overrides (flag_key);

create trigger feature_flag_overrides_touch
  before update on public.feature_flag_overrides
  for each row execute function app.touch_updated_at();
