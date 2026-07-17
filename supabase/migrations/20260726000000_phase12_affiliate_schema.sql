-- Phase 12: affiliate program schema.
--
-- The affiliate program lives inside the existing product. It reuses Clerk
-- identity (user_profiles), organization billing (Stripe as source of truth),
-- the audit log, and the analytics model. It never forks identity, billing, or
-- analytics.
--
-- Affiliates are PEOPLE (keyed to user_profiles), not organizations. Attribution
-- and conversion attach to ORGANIZATIONS, because billing is org-scoped. Money is
-- always integer minor units (cents); rates are basis points. Commission history
-- is immutable: corrections are new ledger/adjustment rows, never edits.
--
-- Writers are server actions + workers using the service role. RLS (next
-- migration) is defense-in-depth read isolation: an affiliate reads only their
-- own rows and never sees customer identity; sensitive operational tables have
-- no customer-facing policy at all.

-- ---------------------------------------------------------------------------
-- Program + versioned commercial terms
-- ---------------------------------------------------------------------------
create table public.affiliate_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  active_version integer not null default 1,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger affiliate_programs_touch
  before update on public.affiliate_programs
  for each row execute function app.touch_updated_at();

-- Immutable, versioned snapshot of commercial terms (seeded from
-- src/lib/affiliates/config.ts). Never edit a version that has commissions.
create table public.affiliate_program_versions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.affiliate_programs (id) on delete cascade,
  version integer not null,
  label text not null,
  effective_from date not null,
  -- Bounded snapshot of AffiliateProgramTerms. Read for auditability; the code
  -- module remains canonical for calculation.
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (program_id, version)
);

-- ---------------------------------------------------------------------------
-- Applications + reviews
-- ---------------------------------------------------------------------------
create table public.affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references public.user_profiles (id) on delete cascade,
  email text not null,
  country text,
  website_url text,
  promotion_methods text[] not null default '{}',
  audience_description text,
  audience_size_band text,
  experience text,
  relevance text,
  disclosure_method text,
  uses_coupons boolean not null default false,
  uses_paid_search boolean not null default false,
  uses_email_marketing boolean not null default false,
  is_existing_customer boolean not null default false,
  program_version integer not null default 1,
  terms_version integer,
  privacy_version integer,
  state text not null default 'draft'
    check (state in ('draft','submitted','under_review','needs_information','waitlisted','approved','rejected','blocked')),
  risk_signals jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index affiliate_applications_user_idx
  on public.affiliate_applications (applicant_user_id);
create index affiliate_applications_state_idx
  on public.affiliate_applications (state, submitted_at desc);
-- One live (non-terminal) application per user at a time.
create unique index affiliate_applications_one_live_idx
  on public.affiliate_applications (applicant_user_id)
  where state in ('draft','submitted','under_review','needs_information','waitlisted');

create trigger affiliate_applications_touch
  before update on public.affiliate_applications
  for each row execute function app.touch_updated_at();

create table public.affiliate_application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.affiliate_applications (id) on delete cascade,
  reviewer_user_id uuid references public.user_profiles (id),
  action text not null
    check (action in ('approve','request_information','waitlist','reject','block','escalate_fraud','note')),
  reason text,
  internal_notes text,
  created_at timestamptz not null default now()
);

create index affiliate_application_reviews_app_idx
  on public.affiliate_application_reviews (application_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Affiliates + profile + email preferences
-- ---------------------------------------------------------------------------
create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete restrict,
  program_id uuid not null references public.affiliate_programs (id),
  program_version integer not null default 1,
  membership_state text not null default 'active'
    check (membership_state in ('active','paused','suspended','terminated','closed')),
  tax_state text not null default 'not_started'
    check (tax_state in ('not_started','required','submitted','verified','needs_attention','expired','not_required','withholding_applied')),
  payout_eligibility_state text not null default 'payout_setup_required'
    check (payout_eligibility_state in ('not_eligible','below_threshold','tax_information_required','payout_setup_required','ready','held')),
  fraud_state text not null default 'clear'
    check (fraud_state in ('clear','review','hold','confirmed')),
  approved_at timestamptz,
  paused_at timestamptz,
  suspended_at timestamptz,
  terminated_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index affiliates_membership_idx on public.affiliates (membership_state);
create index affiliates_fraud_idx on public.affiliates (fraud_state);

create trigger affiliates_touch
  before update on public.affiliates
  for each row execute function app.touch_updated_at();

create table public.affiliate_profiles (
  affiliate_id uuid primary key references public.affiliates (id) on delete cascade,
  display_name text,
  contact_email text,
  country text,
  website_url text,
  channel_links jsonb not null default '[]'::jsonb,
  promotion_methods text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger affiliate_profiles_touch
  before update on public.affiliate_profiles
  for each row execute function app.touch_updated_at();

create table public.affiliate_email_preferences (
  affiliate_id uuid primary key references public.affiliates (id) on delete cascade,
  conversion_notifications boolean not null default true,
  commission_notifications boolean not null default true,
  payout_notifications boolean not null default true,
  program_updates boolean not null default true,
  educational boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger affiliate_email_preferences_touch
  before update on public.affiliate_email_preferences
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Codes + campaigns + links
-- ---------------------------------------------------------------------------
create table public.affiliate_codes (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  code text not null,
  normalized_code text not null,
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active','retired')),
  created_at timestamptz not null default now(),
  retired_at timestamptz,
  unique (normalized_code)
);

create index affiliate_codes_affiliate_idx on public.affiliate_codes (affiliate_id);
-- One active default code per affiliate.
create unique index affiliate_codes_one_default_idx
  on public.affiliate_codes (affiliate_id)
  where is_default and status = 'active';

create table public.affiliate_campaigns (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  name text not null,
  slug text not null,
  destination text not null default '/',
  source text,
  medium text,
  content_label text,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (affiliate_id, slug)
);

create index affiliate_campaigns_affiliate_idx
  on public.affiliate_campaigns (affiliate_id, status);

create table public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  code_id uuid not null references public.affiliate_codes (id) on delete cascade,
  campaign_id uuid references public.affiliate_campaigns (id) on delete set null,
  destination text not null default '/',
  source text,
  medium text,
  content_label text,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index affiliate_links_affiliate_idx on public.affiliate_links (affiliate_id);
create index affiliate_links_campaign_idx on public.affiliate_links (campaign_id);

-- ---------------------------------------------------------------------------
-- Tracking: sessions, clicks, attribution
-- ---------------------------------------------------------------------------
create table public.affiliate_sessions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  campaign_id uuid references public.affiliate_campaigns (id) on delete set null,
  first_click_at timestamptz not null default now(),
  last_eligible_click_at timestamptz not null default now(),
  expires_at timestamptz not null,
  model_version integer not null default 1,
  status text not null default 'active'
    check (status in ('active','converted','invalidated','expired')),
  user_id uuid references public.user_profiles (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  user_attached_at timestamptz,
  org_attached_at timestamptz,
  converted_at timestamptz,
  invalidated_at timestamptz,
  invalidated_reason text,
  created_at timestamptz not null default now()
);

create index affiliate_sessions_affiliate_idx on public.affiliate_sessions (affiliate_id);
create index affiliate_sessions_user_idx on public.affiliate_sessions (user_id);
create index affiliate_sessions_org_idx on public.affiliate_sessions (organization_id);
create index affiliate_sessions_expiry_idx on public.affiliate_sessions (expires_at);

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  campaign_id uuid references public.affiliate_campaigns (id) on delete set null,
  link_id uuid references public.affiliate_links (id) on delete set null,
  session_id uuid references public.affiliate_sessions (id) on delete set null,
  destination text,
  bot_classification text not null default 'human_likely'
    check (bot_classification in ('human_likely','bot_likely','internal','test','duplicate','invalid','fraud_review')),
  country_region text,
  referrer_domain text,
  user_agent_category text,
  attribution_eligible boolean not null default true,
  invalid_reason text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index affiliate_clicks_affiliate_idx
  on public.affiliate_clicks (affiliate_id, occurred_at desc);
create index affiliate_clicks_campaign_idx on public.affiliate_clicks (campaign_id);
create index affiliate_clicks_session_idx on public.affiliate_clicks (session_id);

create table public.affiliate_attributions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  affiliate_id uuid not null references public.affiliates (id) on delete restrict,
  session_id uuid references public.affiliate_sessions (id) on delete set null,
  code text,
  campaign_id uuid references public.affiliate_campaigns (id) on delete set null,
  model_version integer not null default 1,
  first_touch_at timestamptz,
  last_touch_at timestamptz,
  attributed_at timestamptz not null default now(),
  source text,
  eligibility_status text not null default 'eligible'
    check (eligibility_status in ('eligible','ineligible','locked','replaced')),
  invalidated_reason text,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index affiliate_attributions_org_idx on public.affiliate_attributions (organization_id);
create index affiliate_attributions_affiliate_idx on public.affiliate_attributions (affiliate_id);
-- At most one active (eligible or locked) attribution per organization.
create unique index affiliate_attributions_one_active_idx
  on public.affiliate_attributions (organization_id)
  where eligibility_status in ('eligible','locked');

create trigger affiliate_attributions_touch
  before update on public.affiliate_attributions
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Conversions + events + eligibility windows
-- ---------------------------------------------------------------------------
create table public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  affiliate_id uuid not null references public.affiliates (id) on delete restrict,
  attribution_id uuid references public.affiliate_attributions (id) on delete set null,
  program_version integer not null default 1,
  anon_ref text not null,
  state text not null default 'attributed_signup'
    check (state in ('attributed_signup','checkout_started','subscription_created','payment_pending','confirmed','holding','active','ineligible','fraud_review','reversed','canceled','expired')),
  plan_key text check (plan_key in ('starter','pro','business')),
  billing_interval text check (billing_interval in ('month','year')),
  stripe_subscription_id text,
  first_paid_invoice_id text,
  first_paid_at timestamptz,
  confirmed_at timestamptz,
  canceled_at timestamptz,
  fraud_state text not null default 'clear'
    check (fraud_state in ('clear','review','hold','confirmed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One conversion per organization (a base subscription has one affiliate).
  unique (organization_id),
  unique (anon_ref)
);

create index affiliate_conversions_affiliate_idx
  on public.affiliate_conversions (affiliate_id, created_at desc);
create index affiliate_conversions_state_idx on public.affiliate_conversions (state);
create index affiliate_conversions_sub_idx on public.affiliate_conversions (stripe_subscription_id);

create trigger affiliate_conversions_touch
  before update on public.affiliate_conversions
  for each row execute function app.touch_updated_at();

create table public.affiliate_conversion_events (
  id uuid primary key default gen_random_uuid(),
  conversion_id uuid not null references public.affiliate_conversions (id) on delete cascade,
  kind text not null,
  source_event text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index affiliate_conversion_events_conv_idx
  on public.affiliate_conversion_events (conversion_id, occurred_at desc);

create table public.affiliate_eligibility_windows (
  id uuid primary key default gen_random_uuid(),
  conversion_id uuid not null references public.affiliate_conversions (id) on delete cascade,
  affiliate_id uuid not null references public.affiliates (id) on delete restrict,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  eligibility_start timestamptz not null,
  eligibility_end timestamptz not null,
  max_months integer not null default 12,
  status text not null default 'active' check (status in ('active','paused','ended')),
  paused_reason text,
  ended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (conversion_id)
);

create index affiliate_eligibility_windows_affiliate_idx
  on public.affiliate_eligibility_windows (affiliate_id);
create index affiliate_eligibility_windows_end_idx
  on public.affiliate_eligibility_windows (eligibility_end);

create trigger affiliate_eligibility_windows_touch
  before update on public.affiliate_eligibility_windows
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Commissions + adjustments + immutable ledger
-- ---------------------------------------------------------------------------
create table public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete restrict,
  conversion_id uuid not null references public.affiliate_conversions (id) on delete restrict,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_invoice_id text not null,
  invoice_paid_at timestamptz,
  gross_eligible_cents integer not null default 0,
  excluded_cents integer not null default 0,
  commission_rate_bps integer not null,
  commission_amount_cents integer not null default 0,
  reversed_cents integer not null default 0,
  currency text not null default 'usd',
  state text not null default 'pending'
    check (state in ('pending','holding','approved','payable','scheduled','paid','partially_reversed','reversed','disputed','fraud_hold','expired','canceled')),
  hold_release_at timestamptz,
  eligibility_reason text,
  calculation_version integer not null default 1,
  program_version integer not null default 1,
  payout_item_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One commission per eligible invoice per calculation version.
  unique (conversion_id, stripe_invoice_id, calculation_version)
);

create index affiliate_commissions_affiliate_idx
  on public.affiliate_commissions (affiliate_id, state);
create index affiliate_commissions_state_idx on public.affiliate_commissions (state);
create index affiliate_commissions_hold_idx on public.affiliate_commissions (hold_release_at);
create index affiliate_commissions_invoice_idx on public.affiliate_commissions (stripe_invoice_id);

create trigger affiliate_commissions_touch
  before update on public.affiliate_commissions
  for each row execute function app.touch_updated_at();

create table public.affiliate_commission_adjustments (
  id uuid primary key default gen_random_uuid(),
  commission_id uuid references public.affiliate_commissions (id) on delete set null,
  affiliate_id uuid not null references public.affiliates (id) on delete restrict,
  adjustment_type text not null
    check (adjustment_type in ('correction','goodwill','fraud_reversal','refund_correction','payout_correction','tax_withholding_correction','currency_correction')),
  amount_cents integer not null,
  currency text not null default 'usd',
  reason text not null,
  evidence jsonb not null default '{}'::jsonb,
  source_event text,
  created_by_user_id uuid references public.user_profiles (id),
  approved_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now()
);

create index affiliate_commission_adjustments_affiliate_idx
  on public.affiliate_commission_adjustments (affiliate_id, created_at desc);

-- Immutable, append-only ledger. Signed cents. Corrections are new rows.
create table public.affiliate_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete restrict,
  conversion_id uuid references public.affiliate_conversions (id) on delete set null,
  commission_id uuid references public.affiliate_commissions (id) on delete set null,
  stripe_invoice_id text,
  payout_id uuid,
  amount_cents integer not null,
  currency text not null default 'usd',
  entry_type text not null
    check (entry_type in ('commission_accrued','commission_approved','commission_payable','commission_scheduled','commission_paid','refund_reversal','dispute_hold','dispute_reversal','fraud_adjustment','manual_correction','currency_adjustment','payout_fee','tax_withholding')),
  effective_at timestamptz not null default now(),
  calculation_version integer,
  source_event text,
  idempotency_key text not null,
  reason text,
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);

create index affiliate_commission_ledger_affiliate_idx
  on public.affiliate_commission_ledger (affiliate_id, effective_at desc);
create index affiliate_commission_ledger_commission_idx
  on public.affiliate_commission_ledger (commission_id);

-- ---------------------------------------------------------------------------
-- Refund + dispute source events (idempotent)
-- ---------------------------------------------------------------------------
create table public.affiliate_refund_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  commission_id uuid references public.affiliate_commissions (id) on delete set null,
  stripe_invoice_id text,
  amount_cents integer not null default 0,
  kind text not null check (kind in ('full','partial')),
  source_event text,
  idempotency_key text not null unique,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index affiliate_refund_events_org_idx on public.affiliate_refund_events (organization_id);

create table public.affiliate_dispute_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  commission_id uuid references public.affiliate_commissions (id) on delete set null,
  stripe_invoice_id text,
  stripe_charge_id text,
  status text not null check (status in ('opened','won','lost')),
  source_event text,
  idempotency_key text not null unique,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index affiliate_dispute_events_org_idx on public.affiliate_dispute_events (organization_id);

-- ---------------------------------------------------------------------------
-- Fraud flags + reviews
-- ---------------------------------------------------------------------------
create table public.affiliate_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  conversion_id uuid references public.affiliate_conversions (id) on delete set null,
  flag_type text not null,
  severity text not null default 'low' check (severity in ('low','medium','high','critical')),
  source text not null default 'system',
  evidence jsonb not null default '{}'::jsonb,
  review_state text not null default 'open'
    check (review_state in ('open','reviewing','cleared','confirmed','dismissed')),
  reviewer_user_id uuid references public.user_profiles (id),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index affiliate_fraud_flags_affiliate_idx
  on public.affiliate_fraud_flags (affiliate_id, review_state);

create table public.affiliate_fraud_reviews (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  opened_by_user_id uuid references public.user_profiles (id),
  state text not null default 'open' check (state in ('open','resolved')),
  decision text check (decision in ('clear','hold','suspend','terminate','reverse','request_information','escalate')),
  reason text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index affiliate_fraud_reviews_affiliate_idx
  on public.affiliate_fraud_reviews (affiliate_id, state);

-- ---------------------------------------------------------------------------
-- Payout profile + tax profile
-- ---------------------------------------------------------------------------
create table public.affiliate_payout_profiles (
  affiliate_id uuid primary key references public.affiliates (id) on delete cascade,
  provider text not null default 'stripe_connect'
    check (provider in ('stripe_connect','manual')),
  connected_account_id text,
  account_status text not null default 'none'
    check (account_status in ('none','onboarding','restricted','enabled','disabled','deauthorized')),
  capabilities jsonb not null default '{}'::jsonb,
  requirements jsonb not null default '{}'::jsonb,
  legal_name text,
  country text,
  entity_type text check (entity_type in ('individual','business')),
  preferred_currency text not null default 'usd',
  payout_hold boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index affiliate_payout_profiles_account_idx
  on public.affiliate_payout_profiles (connected_account_id);

create trigger affiliate_payout_profiles_touch
  before update on public.affiliate_payout_profiles
  for each row execute function app.touch_updated_at();

create table public.affiliate_tax_profiles (
  affiliate_id uuid primary key references public.affiliates (id) on delete cascade,
  provider_reference text,
  country text,
  entity_type text check (entity_type in ('individual','business')),
  status text not null default 'not_started'
    check (status in ('not_started','required','submitted','verified','needs_attention','expired','not_required','withholding_applied')),
  verification_date timestamptz,
  requirement_summary text,
  document_version text,
  withholding_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger affiliate_tax_profiles_touch
  before update on public.affiliate_tax_profiles
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Payout batches + items + statements
-- ---------------------------------------------------------------------------
create table public.affiliate_payout_batches (
  id uuid primary key default gen_random_uuid(),
  period_label text not null,
  currency text not null default 'usd',
  status text not null default 'draft'
    check (status in ('draft','review','approved','processing','partially_completed','completed','failed','canceled')),
  affiliate_count integer not null default 0,
  total_amount_cents integer not null default 0,
  created_by_user_id uuid references public.user_profiles (id),
  approved_by_user_id uuid references public.user_profiles (id),
  provider_reference text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  processing_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz
);

create index affiliate_payout_batches_status_idx
  on public.affiliate_payout_batches (status, created_at desc);

create table public.affiliate_payout_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.affiliate_payout_batches (id) on delete cascade,
  affiliate_id uuid not null references public.affiliates (id) on delete restrict,
  currency text not null default 'usd',
  gross_payable_cents integer not null default 0,
  negative_adjustment_cents integer not null default 0,
  tax_withholding_cents integer not null default 0,
  provider_fee_cents integer not null default 0,
  net_payout_cents integer not null default 0,
  provider_reference text,
  status text not null default 'ready'
    check (status in ('not_eligible','below_threshold','tax_information_required','payout_setup_required','ready','scheduled','processing','paid','failed','returned','held','canceled')),
  failure_reason text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, affiliate_id)
);

create index affiliate_payout_items_affiliate_idx
  on public.affiliate_payout_items (affiliate_id, status);

create trigger affiliate_payout_items_touch
  before update on public.affiliate_payout_items
  for each row execute function app.touch_updated_at();

create table public.affiliate_payout_statements (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  batch_id uuid references public.affiliate_payout_batches (id) on delete set null,
  period_label text not null,
  currency text not null default 'usd',
  opening_balance_cents integer not null default 0,
  commission_cents integer not null default 0,
  adjustments_cents integer not null default 0,
  paid_cents integer not null default 0,
  closing_balance_cents integer not null default 0,
  generated_at timestamptz not null default now(),
  storage_ref text,
  created_at timestamptz not null default now()
);

create index affiliate_payout_statements_affiliate_idx
  on public.affiliate_payout_statements (affiliate_id, generated_at desc);

-- ---------------------------------------------------------------------------
-- Terms acceptance, creatives, notifications, exports
-- ---------------------------------------------------------------------------
create table public.affiliate_terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.affiliates (id) on delete cascade,
  application_id uuid references public.affiliate_applications (id) on delete set null,
  user_id uuid references public.user_profiles (id) on delete set null,
  program_version integer not null,
  terms_version integer not null,
  privacy_version integer,
  request_context jsonb not null default '{}'::jsonb,
  source text,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index affiliate_terms_acceptances_affiliate_idx
  on public.affiliate_terms_acceptances (affiliate_id, accepted_at desc);

create table public.affiliate_creatives (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  version text not null default '1',
  dimensions text,
  theme text check (theme in ('light','dark','neutral')),
  intended_use text,
  alt_text text,
  usage_notes text,
  storage_ref text,
  status text not null default 'active' check (status in ('active','retired')),
  created_at timestamptz not null default now(),
  retired_at timestamptz
);

create index affiliate_creatives_status_idx on public.affiliate_creatives (status);

create table public.affiliate_notifications (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  kind text not null,
  channel text not null default 'email' check (channel in ('email','in_app')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending','sent','failed','skipped')),
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (dedupe_key)
);

create index affiliate_notifications_affiliate_idx
  on public.affiliate_notifications (affiliate_id, created_at desc);
create index affiliate_notifications_status_idx
  on public.affiliate_notifications (status);

create table public.affiliate_exports (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  kind text not null,
  status text not null default 'pending'
    check (status in ('pending','processing','completed','failed','expired')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  storage_ref text,
  expires_at timestamptz,
  row_count integer,
  created_at timestamptz not null default now()
);

create index affiliate_exports_affiliate_idx
  on public.affiliate_exports (affiliate_id, requested_at desc);

-- ---------------------------------------------------------------------------
-- Provider webhook inbox, reconciliation runs, admin action log
-- ---------------------------------------------------------------------------
create table public.affiliate_webhook_events (
  provider_event_id text primary key,
  provider text not null default 'stripe',
  event_type text not null,
  status text not null default 'received'
    check (status in ('received','processing','processed','failed','ignored','dead_letter')),
  attempts integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  summary jsonb not null default '{}'::jsonb
);

create index affiliate_webhook_events_status_idx
  on public.affiliate_webhook_events (status);

create table public.affiliate_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('commission','payout','attribution')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  dry_run boolean not null default true,
  checked integer not null default 0,
  differences_found integer not null default 0,
  differences_repaired integer not null default 0,
  report jsonb not null default '{}'::jsonb
);

create index affiliate_reconciliation_runs_kind_idx
  on public.affiliate_reconciliation_runs (kind, started_at desc);

create table public.affiliate_admin_actions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.user_profiles (id),
  affiliate_id uuid references public.affiliates (id) on delete set null,
  action text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index affiliate_admin_actions_affiliate_idx
  on public.affiliate_admin_actions (affiliate_id, created_at desc);

-- Payout item back-reference for commissions (added after payout_items exists).
alter table public.affiliate_commissions
  add constraint affiliate_commissions_payout_item_fk
  foreign key (payout_item_id)
  references public.affiliate_payout_items (id) on delete set null;
