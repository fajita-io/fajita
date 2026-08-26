-- Drop legacy partner license tables and add internal promo grants.

drop table if exists public.appsumo_webhook_events;
drop table if exists public.appsumo_licenses;

create table public.promo_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  redeemed_by_user_id uuid references public.user_profiles (id) on delete set null,
  plan_key text not null check (plan_key in ('starter', 'pro', 'business')),
  code text not null,
  redeemed_at timestamptz not null default now(),
  unique (organization_id)
);

create index promo_grants_org_idx on public.promo_grants (organization_id);

alter table public.promo_grants enable row level security;
