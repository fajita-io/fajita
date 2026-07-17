-- Phase 10: organization-level billing and entitlement model.
--
-- Billing belongs to the organization, not the user. Stripe is the source of
-- truth for payment, invoice, and subscription status; these tables are the
-- normalized in-app cache that entitlement checks and the billing UI read so
-- product requests never call Stripe. The webhook processor and reconciliation
-- job are the only writers (service role).
--
-- The Phase 0.5 user-keyed scaffolding (billing_accounts, billing_subscriptions)
-- is superseded here. It held no data and no product code read it. Its Phase 3
-- select policies drop with the tables.

drop table if exists public.billing_subscriptions cascade;
drop table if exists public.billing_accounts cascade;

-- ---------------------------------------------------------------------------
-- billing_customers: one Stripe customer per organization.
-- ---------------------------------------------------------------------------
create table public.billing_customers (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  stripe_customer_id text not null unique,
  billing_email text,
  billing_name text,
  tax_id_present boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger billing_customers_touch
  before update on public.billing_customers
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- billing_subscriptions: the org's subscription state, cached from Stripe.
-- ---------------------------------------------------------------------------
create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan_key text not null check (plan_key in ('starter', 'pro', 'business')),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  -- Internal status from the state machine, never a raw Stripe string in the UI.
  status text not null default 'none',
  access_state text not null default 'none'
    check (access_state in ('none', 'active', 'grace_period', 'restricted', 'canceled')),
  recurring_amount_cents integer not null default 0,
  currency text not null default 'usd',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  cancellation_effective_at timestamptz,
  canceled_at timestamptz,
  -- Stripe object updated timestamp for out-of-order event protection.
  stripe_updated_at bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index billing_subscriptions_org_idx
  on public.billing_subscriptions (organization_id);
create index billing_subscriptions_status_idx
  on public.billing_subscriptions (status);
create index billing_subscriptions_customer_idx
  on public.billing_subscriptions (stripe_customer_id);

-- At most one live subscription per organization (duplicate prevention).
create unique index billing_subscriptions_one_live_idx
  on public.billing_subscriptions (organization_id)
  where status not in ('canceled', 'incomplete_expired', 'none');

create trigger billing_subscriptions_touch
  before update on public.billing_subscriptions
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- billing_checkout_intents: short-lived record of an initiated checkout.
-- ---------------------------------------------------------------------------
create table public.billing_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  initiated_by_user_id uuid not null references public.user_profiles (id),
  plan_key text not null check (plan_key in ('starter', 'pro', 'business')),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  stripe_checkout_session_id text unique,
  status text not null default 'pending'
    check (status in ('pending', 'checkout_created', 'completed', 'expired', 'canceled', 'replaced', 'failed')),
  expires_at timestamptz not null,
  completed_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);

create index billing_checkout_intents_org_idx
  on public.billing_checkout_intents (organization_id);
create index billing_checkout_intents_status_idx
  on public.billing_checkout_intents (status);

-- ---------------------------------------------------------------------------
-- billing_webhook_events: bounded inbox for idempotency and replay.
-- ---------------------------------------------------------------------------
create table public.billing_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  stripe_object_id text,
  api_version text,
  livemode boolean not null default false,
  received_at timestamptz not null default now(),
  status text not null default 'received'
    check (status in ('received', 'processing', 'processed', 'failed', 'ignored', 'dead_letter')),
  attempts integer not null default 0,
  processed_at timestamptz,
  last_error text,
  summary jsonb not null default '{}'::jsonb,
  organization_id uuid references public.organizations (id) on delete set null
);

create index billing_webhook_events_status_idx
  on public.billing_webhook_events (status);
create index billing_webhook_events_type_idx
  on public.billing_webhook_events (event_type);

-- ---------------------------------------------------------------------------
-- billing_entitlement_snapshots: versioned, reproducible entitlement state.
-- ---------------------------------------------------------------------------
create table public.billing_entitlement_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions (id) on delete set null,
  plan_key text check (plan_key in ('starter', 'pro', 'business')),
  entitlement_version integer not null,
  access_state text not null
    check (access_state in ('none', 'active', 'grace_period', 'restricted', 'canceled')),
  entitlements jsonb not null,
  source text not null default 'webhook',
  calculated_at timestamptz not null default now()
);

create index billing_entitlement_snapshots_org_idx
  on public.billing_entitlement_snapshots (organization_id, calculated_at desc);

-- Fast lookup of the current snapshot per org.
create unique index billing_entitlement_snapshots_current_idx
  on public.billing_entitlement_snapshots (organization_id)
  where source = 'current';

-- ---------------------------------------------------------------------------
-- billing_usage_counters: efficient per-org resource counts (rebuildable).
-- ---------------------------------------------------------------------------
create table public.billing_usage_counters (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  active_monitors integer not null default 0,
  total_monitors integer not null default 0,
  team_members integer not null default 0,
  pending_invitations integer not null default 0,
  status_pages integer not null default 0,
  custom_domains integer not null default 0,
  alert_channels integer not null default 0,
  alert_rules integer not null default 0,
  confirmed_subscribers integer not null default 0,
  rebuilt_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger billing_usage_counters_touch
  before update on public.billing_usage_counters
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- billing_payment_events: normalized invoice/payment history.
-- ---------------------------------------------------------------------------
create table public.billing_payment_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_invoice_id text,
  kind text not null
    check (kind in ('paid', 'failed', 'action_required', 'refunded', 'partially_refunded', 'finalized')),
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  hosted_invoice_url text,
  invoice_pdf_url text,
  occurred_at timestamptz not null default now(),
  summary jsonb not null default '{}'::jsonb
);

create index billing_payment_events_org_idx
  on public.billing_payment_events (organization_id, occurred_at desc);
create unique index billing_payment_events_dedupe_idx
  on public.billing_payment_events (stripe_invoice_id, kind)
  where stripe_invoice_id is not null;

-- ---------------------------------------------------------------------------
-- billing_grace_periods: payment-failure recovery windows.
-- ---------------------------------------------------------------------------
create table public.billing_grace_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions (id) on delete set null,
  started_at timestamptz not null default now(),
  restriction_at timestamptz,
  ended_at timestamptz,
  reason text,
  status text not null default 'open' check (status in ('open', 'resolved', 'restricted'))
);

create index billing_grace_periods_org_idx
  on public.billing_grace_periods (organization_id);
create unique index billing_grace_periods_one_open_idx
  on public.billing_grace_periods (organization_id)
  where status in ('open', 'restricted');

-- ---------------------------------------------------------------------------
-- billing_cancellation_records: cancellation intent, timing, and feedback.
-- ---------------------------------------------------------------------------
create table public.billing_cancellation_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions (id) on delete set null,
  requested_by_user_id uuid references public.user_profiles (id),
  reason_code text,
  feedback text,
  effective_at timestamptz,
  requested_at timestamptz not null default now(),
  canceled_at timestamptz,
  reactivated_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'effective', 'reactivated'))
);

create index billing_cancellation_records_org_idx
  on public.billing_cancellation_records (organization_id, requested_at desc);

-- ---------------------------------------------------------------------------
-- billing_downgrade_plans: scheduled downgrades and compliance selections.
-- ---------------------------------------------------------------------------
create table public.billing_downgrade_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  from_plan_key text not null check (from_plan_key in ('starter', 'pro', 'business')),
  to_plan_key text not null check (to_plan_key in ('starter', 'pro', 'business')),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  effective_at timestamptz not null,
  selections jsonb not null default '{}'::jsonb,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'applied', 'canceled')),
  created_at timestamptz not null default now()
);

create index billing_downgrade_plans_org_idx
  on public.billing_downgrade_plans (organization_id);

-- ---------------------------------------------------------------------------
-- billing_admin_overrides: tightly controlled, expiring entitlement overrides.
-- ---------------------------------------------------------------------------
create table public.billing_admin_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  entitlement_key text not null,
  override_value jsonb not null,
  reason text not null,
  reference text,
  created_by_user_id uuid references public.user_profiles (id),
  effective_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index billing_admin_overrides_org_idx
  on public.billing_admin_overrides (organization_id, expires_at);

-- ---------------------------------------------------------------------------
-- billing_reconciliation_runs: audit of Stripe/Fajita reconciliation.
-- ---------------------------------------------------------------------------
create table public.billing_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  dry_run boolean not null default true,
  organizations_checked integer not null default 0,
  differences_found integer not null default 0,
  differences_repaired integer not null default 0,
  report jsonb not null default '{}'::jsonb
);
