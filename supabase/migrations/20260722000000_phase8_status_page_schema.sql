-- Phase 8: public status page data model.
--
-- This migration adds the tables behind Fajita's hosted status-page product.
-- The design keeps a hard boundary between authenticated (internal) data and
-- the public-safe projection anonymous visitors are allowed to see:
--
--   * Management tables (status_pages, components, versions, domains, ...) are
--     org-scoped and readable only by active members. Customers never write
--     them directly: the application writes with the service role after an
--     explicit TypeScript authorization check.
--   * public.status_page_public_snapshots is the ONLY record the public
--     renderer reads. It holds an allowlisted, materialized projection built
--     from monitors, incidents, and maintenance. It has no anon read policy;
--     the public renderer reads it server-side with the service role.
--
-- Forward-only migration. Do not edit after apply; add a new migration instead.
-- RLS lives in 20260722000100_phase8_status_page_rls.sql.

-- ---------------------------------------------------------------------------
-- status_pages: one hosted page per row, owned by an organization.
-- Mutable configuration lives here; the immutable published shape lives in
-- status_page_versions and the public snapshot.
-- ---------------------------------------------------------------------------
create table if not exists public.status_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  -- Global, normalized, immutable-ish public identifier (also the hosted
  -- subdomain label). Unique across the platform, not just the org.
  slug text not null,
  status text not null default 'draft'
    check (status in (
      'draft', 'publishing', 'published', 'unpublished',
      'suspended', 'pending_deletion', 'deleted'
    )),
  visibility text not null default 'public'
    check (visibility in ('public', 'password_protected', 'private_link', 'organization_only')),
  title text,
  description text,
  headline text,
  support_url text,
  website_url text,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  theme_key text not null default 'signal'
    check (theme_key in ('signal', 'ember', 'paper', 'midnight')),
  -- Bounded, validated appearance tokens only (accent color, density, radius).
  -- Never arbitrary CSS. See src/lib/status-pages/appearance.ts.
  appearance jsonb not null default '{}'::jsonb,
  logo_asset_id uuid,
  favicon_asset_id uuid,
  -- Display toggles (versioned on publish).
  show_uptime_history boolean not null default true,
  show_response_time boolean not null default false,
  show_incident_history boolean not null default true,
  show_scheduled_maintenance boolean not null default true,
  show_component_descriptions boolean not null default true,
  show_subscriber_form boolean not null default false,
  powered_by_visible boolean not null default true,
  search_indexing_enabled boolean not null default true,
  index_incident_archive boolean not null default true,
  index_individual_incidents boolean not null default false,
  incident_history_window text not null default 'ninety_days'
    check (incident_history_window in (
      'seven_days', 'thirty_days', 'ninety_days', 'twelve_months', 'full'
    )),
  uptime_history_days integer not null default 90
    check (uptime_history_days in (7, 30, 90)),
  auto_publish_incidents text not null default 'never'
    check (auto_publish_incidents in ('never', 'draft_only', 'major_critical', 'all')),
  -- Optional bounded delay (seconds) before automatic public-state changes
  -- surface, to avoid flicker during verification. Never hides confirmed data.
  public_state_delay_seconds integer not null default 0
    check (public_state_delay_seconds between 0 and 900),
  -- Hashed secrets for private access modes. Never store plaintext.
  password_hash text,
  private_link_token_hash text,
  published_version_id uuid,
  draft_version_id uuid,
  primary_domain_id uuid,
  created_by_user_id uuid references public.user_profiles (id),
  updated_by_user_id uuid references public.user_profiles (id),
  published_at timestamptz,
  last_public_change_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint status_pages_name_len check (char_length(name) between 1 and 120),
  constraint status_pages_slug_shape check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$'),
  constraint status_pages_title_len check (title is null or char_length(title) <= 120),
  constraint status_pages_desc_len check (description is null or char_length(description) <= 2000)
);

-- Slug is the hosted subdomain; unique across all live pages.
create unique index if not exists status_pages_slug_idx
  on public.status_pages (slug)
  where deleted_at is null;
create index if not exists status_pages_org_idx
  on public.status_pages (organization_id, created_at desc)
  where deleted_at is null;

create trigger status_pages_touch
  before update on public.status_pages
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_component_groups: optional grouping of components.
-- Deleting a group never deletes components (handled in the data layer).
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_component_groups (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  position integer not null default 0,
  collapsed_by_default boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint status_page_component_groups_name_len check (char_length(name) between 1 and 80)
);

create index if not exists status_page_component_groups_page_idx
  on public.status_page_component_groups (status_page_id, position)
  where deleted_at is null;

create trigger status_page_component_groups_touch
  before update on public.status_page_component_groups
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_components: a customer-facing component (Website, API, ...).
-- May map to zero, one, or several monitors via status_page_component_monitors.
-- Public name is deliberate and never auto-derived from a monitor name.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_components (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  group_id uuid references public.status_page_component_groups (id) on delete set null,
  name text not null,
  description text,
  -- Stable public slug for anchors and incident references.
  slug text not null,
  position integer not null default 0,
  status_calculation_mode text not null default 'any_critical'
    check (status_calculation_mode in ('any_critical', 'majority', 'primary', 'manual')),
  -- Manual override (only authoritative when mode = 'manual' or override_until set).
  manual_status text
    check (manual_status is null or manual_status in (
      'operational', 'degraded_performance', 'partial_outage', 'major_outage', 'under_maintenance'
    )),
  manual_status_reason text,
  manual_status_since timestamptz,
  manual_status_until timestamptz,
  visibility text not null default 'visible'
    check (visibility in ('visible', 'hidden')),
  show_uptime boolean not null default true,
  show_response_time boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint status_page_components_name_len check (char_length(name) between 1 and 80),
  constraint status_page_components_slug_shape check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$')
);

create unique index if not exists status_page_components_slug_idx
  on public.status_page_components (status_page_id, slug)
  where deleted_at is null;
create index if not exists status_page_components_page_idx
  on public.status_page_components (status_page_id, position)
  where deleted_at is null;

create trigger status_page_components_touch
  before update on public.status_page_components
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_component_monitors: mapping of components to monitors.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_component_monitors (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.status_page_components (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  is_critical boolean not null default true,
  is_primary boolean not null default false,
  include_in_uptime boolean not null default true,
  created_at timestamptz not null default now(),
  unique (component_id, monitor_id)
);

create index if not exists status_page_component_monitors_component_idx
  on public.status_page_component_monitors (component_id);
create index if not exists status_page_component_monitors_monitor_idx
  on public.status_page_component_monitors (monitor_id);

-- ---------------------------------------------------------------------------
-- status_page_incidents: which internal incidents are attached to a status
-- page and their per-page publication state. The public content itself comes
-- from public.incident_public_projections (allowlisted, built in Phase 6);
-- this table controls attachment, publication, and the public slug.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_incidents (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  incident_id uuid not null references public.incidents (id) on delete cascade,
  public_slug text not null,
  publication_state text not null default 'draft'
    check (publication_state in ('draft', 'published', 'hidden')),
  published_at timestamptz,
  published_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (status_page_id, incident_id)
);

create unique index if not exists status_page_incidents_slug_idx
  on public.status_page_incidents (status_page_id, public_slug);
create index if not exists status_page_incidents_page_state_idx
  on public.status_page_incidents (status_page_id, publication_state, published_at desc);

create trigger status_page_incidents_touch
  before update on public.status_page_incidents
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_maintenance: attachment + publication of maintenance windows.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_maintenance (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  maintenance_window_id uuid not null references public.maintenance_windows (id) on delete cascade,
  public_slug text not null,
  publication_state text not null default 'draft'
    check (publication_state in ('draft', 'published', 'hidden')),
  published_at timestamptz,
  published_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (status_page_id, maintenance_window_id)
);

create index if not exists status_page_maintenance_page_state_idx
  on public.status_page_maintenance (status_page_id, publication_state, published_at desc);

create trigger status_page_maintenance_touch
  before update on public.status_page_maintenance
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_manual_messages: general notices unrelated to a monitored
-- incident (third-party outage, migration notice). Distinct from incidents.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_manual_messages (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  public_slug text not null,
  title text not null,
  body text not null,
  notice_type text not null default 'notice'
    check (notice_type in ('notice', 'investigating', 'identified', 'monitoring', 'resolved')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  publication_state text not null default 'draft'
    check (publication_state in ('draft', 'published', 'hidden')),
  created_by_user_id uuid references public.user_profiles (id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint status_page_manual_messages_title_len check (char_length(title) between 1 and 160),
  constraint status_page_manual_messages_body_len check (char_length(body) between 1 and 4000)
);

create index if not exists status_page_manual_messages_page_idx
  on public.status_page_manual_messages (status_page_id, publication_state, starts_at desc);

create trigger status_page_manual_messages_touch
  before update on public.status_page_manual_messages
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_versions: immutable published configuration snapshots.
-- Publish creates a new version; the active version is never mutated in place.
-- No secrets (passwords, tokens) are stored in a version snapshot.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_versions (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  version_number integer not null,
  -- Full immutable configuration snapshot (page + components + theme + seo).
  snapshot jsonb not null,
  content_hash text,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  unique (status_page_id, version_number)
);

create index if not exists status_page_versions_page_idx
  on public.status_page_versions (status_page_id, version_number desc);

-- ---------------------------------------------------------------------------
-- status_page_domains: hosted subdomain + custom domains for a page.
-- One row per domain; a domain is globally unique to prevent takeover.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_domains (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  domain text not null,
  kind text not null default 'custom'
    check (kind in ('hosted_subdomain', 'custom')),
  is_primary boolean not null default false,
  verification_status text not null default 'pending_dns'
    check (verification_status in (
      'pending_dns', 'verifying', 'verified', 'failed'
    )),
  tls_status text not null default 'pending'
    check (tls_status in (
      'pending', 'provisioning', 'active', 'renewal_issue', 'failed', 'removed'
    )),
  -- The CNAME target the customer must point their domain at.
  cname_target text,
  last_checked_at timestamptz,
  verified_at timestamptz,
  tls_activated_at timestamptz,
  failure_reason text,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  removed_at timestamptz,
  constraint status_page_domains_domain_len check (char_length(domain) between 3 and 253)
);

-- Global uniqueness on active domains: prevents cross-tenant takeover.
create unique index if not exists status_page_domains_domain_idx
  on public.status_page_domains (lower(domain))
  where removed_at is null;
create index if not exists status_page_domains_page_idx
  on public.status_page_domains (status_page_id)
  where removed_at is null;

create trigger status_page_domains_touch
  before update on public.status_page_domains
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_domain_verifications: DNS verification attempts / tokens.
-- Tokens are stored hashed. High entropy, expiring, single domain scope.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_domain_verifications (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.status_page_domains (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  method text not null default 'dns_txt'
    check (method in ('dns_txt', 'cname')),
  -- TXT record host the customer adds (e.g. _fajita-challenge.status.acme.com).
  record_host text,
  token_hash text not null,
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'expired')),
  attempts integer not null default 0,
  last_checked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists status_page_domain_verifications_domain_idx
  on public.status_page_domain_verifications (domain_id, created_at desc);

-- ---------------------------------------------------------------------------
-- status_page_brand_assets: customer logo/favicon metadata. Real upload
-- pipeline (signed upload + sanitization) is a documented foundation; this
-- table records the safe public derivative reference.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_brand_assets (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kind text not null check (kind in ('logo', 'favicon')),
  storage_path text,
  public_url text,
  content_type text,
  width integer,
  height integer,
  byte_size integer,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists status_page_brand_assets_page_idx
  on public.status_page_brand_assets (status_page_id, kind)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- status_page_public_snapshots: the ONLY table the public renderer reads.
-- One materialized, allowlisted projection per page, keyed by slug for O(1)
-- lookup. Rebuildable from source at any time. No secrets, no internal ids.
-- Bounded JSON is intentional here: this is a public cache, not the source.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_public_snapshots (
  status_page_id uuid primary key references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  version_id uuid,
  visibility text not null default 'public',
  overall_status text not null default 'operational'
    check (overall_status in (
      'operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'
    )),
  -- Allowlisted public payload: page meta, theme, components, incidents,
  -- maintenance, uptime summaries, powered_by, seo. Built by projection.ts.
  data jsonb not null default '{}'::jsonb,
  content_hash text,
  generated_at timestamptz not null default now(),
  source_refreshed_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists status_page_public_snapshots_slug_idx
  on public.status_page_public_snapshots (slug);

create trigger status_page_public_snapshots_touch
  before update on public.status_page_public_snapshots
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_uptime_summaries: precomputed daily uptime per component.
-- Populated from centralized result stats; read by the projection builder.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_uptime_summaries (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  component_id uuid not null references public.status_page_components (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  day date not null,
  -- Fraction in [0,1] or null when there was no data that day.
  uptime_fraction numeric(6, 5),
  worst_state text
    check (worst_state is null or worst_state in (
      'operational', 'degraded_performance', 'partial_outage', 'major_outage', 'under_maintenance', 'no_data'
    )),
  avg_response_ms integer,
  sample_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (component_id, day)
);

create index if not exists status_page_uptime_summaries_page_day_idx
  on public.status_page_uptime_summaries (status_page_id, day desc);

create trigger status_page_uptime_summaries_touch
  before update on public.status_page_uptime_summaries
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- status_page_subscribers + preferences: FOUNDATION ONLY (Phase 9 delivery).
-- No email is ever sent in Phase 8. Tokens are hashed, emails encrypted.
-- Public collection stays gated until the full consent + delivery flow ships.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_subscribers (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email_normalized text not null,
  email_hash text not null,
  encrypted_email text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed', 'suppressed')),
  consent_source text,
  consent_timestamp timestamptz,
  confirmation_token_hash text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  suppressed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (status_page_id, email_hash)
);

create index if not exists status_page_subscribers_page_idx
  on public.status_page_subscribers (status_page_id, status)
  where deleted_at is null;

create trigger status_page_subscribers_touch
  before update on public.status_page_subscribers
  for each row execute function app.touch_updated_at();

create table if not exists public.status_page_subscriber_preferences (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.status_page_subscribers (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  component_id uuid references public.status_page_components (id) on delete cascade,
  incident_updates boolean not null default true,
  maintenance_updates boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_preferences_subscriber_idx
  on public.status_page_subscriber_preferences (subscriber_id);

-- ---------------------------------------------------------------------------
-- status_page_analytics_events: privacy-conscious aggregate public events.
-- No visitor IP, no fingerprints, no subscriber email, no tokens.
-- ---------------------------------------------------------------------------
create table if not exists public.status_page_analytics_events (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_type text not null,
  occurred_on date not null default (now() at time zone 'utc')::date,
  count integer not null default 1,
  created_at timestamptz not null default now(),
  unique (status_page_id, event_type, occurred_on)
);

create index if not exists status_page_analytics_events_page_idx
  on public.status_page_analytics_events (status_page_id, occurred_on desc);

-- ---------------------------------------------------------------------------
-- Deferred cross-table foreign keys (columns declared above).
-- ---------------------------------------------------------------------------
alter table public.status_pages
  drop constraint if exists status_pages_primary_domain_fk;
alter table public.status_pages
  add constraint status_pages_primary_domain_fk
  foreign key (primary_domain_id) references public.status_page_domains (id) on delete set null;

alter table public.status_pages
  drop constraint if exists status_pages_published_version_fk;
alter table public.status_pages
  add constraint status_pages_published_version_fk
  foreign key (published_version_id) references public.status_page_versions (id) on delete set null;

alter table public.status_pages
  drop constraint if exists status_pages_draft_version_fk;
alter table public.status_pages
  add constraint status_pages_draft_version_fk
  foreign key (draft_version_id) references public.status_page_versions (id) on delete set null;

alter table public.status_pages
  drop constraint if exists status_pages_logo_asset_fk;
alter table public.status_pages
  add constraint status_pages_logo_asset_fk
  foreign key (logo_asset_id) references public.status_page_brand_assets (id) on delete set null;

alter table public.status_pages
  drop constraint if exists status_pages_favicon_asset_fk;
alter table public.status_pages
  add constraint status_pages_favicon_asset_fk
  foreign key (favicon_asset_id) references public.status_page_brand_assets (id) on delete set null;
