-- AppSumo Licensing API v2: license keys, webhook inbox, org binding.
--
-- AppSumo owns license_key generation. Fajita stores keys for support lookup,
-- maps tiers to starter/pro/business entitlements, and binds redeemed licenses
-- to organizations. Writers use the service role; RLS is deny-by-default.

-- ---------------------------------------------------------------------------
-- appsumo_licenses
-- ---------------------------------------------------------------------------
create table public.appsumo_licenses (
  license_key uuid primary key,
  prev_license_key uuid,
  parent_license_key uuid,
  organization_id uuid references public.organizations (id) on delete set null,
  redeemed_by_user_id uuid references public.user_profiles (id) on delete set null,
  plan_key text not null check (plan_key in ('starter', 'pro', 'business')),
  tier integer not null default 1 check (tier >= 1),
  status text not null default 'inactive'
    check (status in ('inactive', 'active', 'deactivated')),
  partner_plan_name text,
  unit_quantity integer,
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appsumo_licenses_org_idx
  on public.appsumo_licenses (organization_id)
  where organization_id is not null;

create index appsumo_licenses_prev_key_idx
  on public.appsumo_licenses (prev_license_key)
  where prev_license_key is not null;

create index appsumo_licenses_parent_key_idx
  on public.appsumo_licenses (parent_license_key)
  where parent_license_key is not null;

create index appsumo_licenses_status_idx
  on public.appsumo_licenses (status);

create trigger appsumo_licenses_touch
  before update on public.appsumo_licenses
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- appsumo_webhook_events: idempotent inbox
-- ---------------------------------------------------------------------------
create table public.appsumo_webhook_events (
  idempotency_key text primary key,
  license_key uuid not null,
  event_type text not null,
  event_timestamp bigint not null,
  received_at timestamptz not null default now(),
  status text not null default 'received'
    check (status in ('received', 'processing', 'processed', 'failed', 'ignored')),
  attempts integer not null default 0,
  processed_at timestamptz,
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  organization_id uuid references public.organizations (id) on delete set null
);

create index appsumo_webhook_events_status_idx
  on public.appsumo_webhook_events (status);

create index appsumo_webhook_events_license_idx
  on public.appsumo_webhook_events (license_key);

-- ---------------------------------------------------------------------------
-- RLS: service-role writers only
-- ---------------------------------------------------------------------------
alter table public.appsumo_licenses enable row level security;
alter table public.appsumo_webhook_events enable row level security;
