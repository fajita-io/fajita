-- Stripe billing cache for Fajita uptime monitoring.
-- Source of truth remains Stripe; this table speeds entitlement checks in-app.

create table if not exists public.billing_accounts (
  user_id text primary key,
  stripe_customer_id text not null unique,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_subscriptions (
  id text primary key,
  user_id text not null references public.billing_accounts (user_id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan_id text not null check (plan_id in ('starter', 'pro', 'business')),
  status text not null,
  monitor_limit integer,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_id_idx
  on public.billing_subscriptions (user_id);

create index if not exists billing_subscriptions_status_idx
  on public.billing_subscriptions (status);

alter table public.billing_accounts enable row level security;
alter table public.billing_subscriptions enable row level security;
