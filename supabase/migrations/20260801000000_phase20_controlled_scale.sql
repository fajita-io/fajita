-- Phase 20: Controlled scale operating layer.
--
-- Internal growth, capacity, and hiring governance. Does not duplicate
-- affiliate commission ledger, billing ledger, experiment registry, or
-- approval/audit systems. RLS enabled; service role after platform checks.

-- ---------------------------------------------------------------------------
-- Scale readiness snapshots
-- ---------------------------------------------------------------------------

create table if not exists public.scale_readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  gate_status text not null check (gate_status in (
    'not_eligible',
    'stabilizing',
    'eligible_limited',
    'eligible_channel_expansion',
    'eligible_accelerated',
    'paused',
    'restricted'
  )),
  phase18_classification text not null,
  phase19_stabilization_active boolean not null default false,
  product_stable boolean not null default false,
  customer_evidence_ready boolean not null default false,
  economics_ready boolean not null default false,
  operations_ready boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  calculation_version text not null default 'scale-readiness-v1',
  evaluated_at timestamptz not null default now(),
  evaluated_by uuid references public.user_profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists scale_readiness_snapshots_eval_idx
  on public.scale_readiness_snapshots (evaluated_at desc);

alter table public.scale_readiness_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Scale stages
-- ---------------------------------------------------------------------------

create table if not exists public.scale_stages (
  id uuid primary key default gen_random_uuid(),
  stage int not null check (stage between 0 and 4),
  stage_key text not null unique check (stage_key in (
    'baseline',
    'limited_validation',
    'repeatable_acquisition',
    'channel_expansion',
    'controlled_acceleration'
  )),
  status text not null default 'inactive' check (status in (
    'inactive', 'active', 'paused', 'completed', 'blocked'
  )),
  started_at timestamptz,
  ended_at timestamptz,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  entry_criteria jsonb not null default '[]'::jsonb,
  stop_conditions jsonb not null default '[]'::jsonb,
  max_traffic_label text,
  max_budget_cents bigint,
  approval_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger scale_stages_touch
  before update on public.scale_stages
  for each row execute function app.touch_updated_at();

alter table public.scale_stages enable row level security;

-- ---------------------------------------------------------------------------
-- Acquisition channels
-- ---------------------------------------------------------------------------

create table if not exists public.acquisition_channels (
  id uuid primary key default gen_random_uuid(),
  channel_key text not null unique,
  name text not null,
  channel_type text not null check (channel_type in (
    'organic_search', 'documentation', 'glossary', 'blog', 'comparison',
    'free_tool', 'affiliate', 'customer_referral', 'partnership', 'marketplace',
    'product_launch', 'founder_social', 'community', 'sponsorship',
    'paid_search', 'paid_social', 'direct', 'unknown'
  )),
  state text not null default 'researching' check (state in (
    'researching', 'preparing', 'limited_test', 'validating', 'repeatable',
    'scaling', 'holding', 'paused', 'rejected', 'retired'
  )),
  decision_reason text,
  evidence jsonb not null default '{}'::jsonb,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  budget_cap_cents bigint,
  volume_cap int,
  review_date date,
  primary_metric text,
  guardrails jsonb not null default '[]'::jsonb,
  stop_conditions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger acquisition_channels_touch
  before update on public.acquisition_channels
  for each row execute function app.touch_updated_at();

create index if not exists acquisition_channels_state_idx
  on public.acquisition_channels (state);

alter table public.acquisition_channels enable row level security;

-- ---------------------------------------------------------------------------
-- Channel quality snapshots
-- ---------------------------------------------------------------------------

create table if not exists public.channel_quality_snapshots (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.acquisition_channels (id) on delete cascade,
  cohort_date date not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  visitors int not null default 0,
  qualified_visitors int not null default 0,
  signups int not null default 0,
  paid_organizations int not null default 0,
  activated_organizations int not null default 0,
  day7_retained int not null default 0,
  day30_retained int not null default 0,
  mrr_cents bigint not null default 0,
  retained_mrr_cents bigint not null default 0,
  refunds_cents bigint not null default 0,
  chargebacks int not null default 0,
  support_contacts int not null default 0,
  security_abuse_events int not null default 0,
  cost_cents bigint not null default 0,
  activated_cac_cents bigint,
  retained_cac_cents bigint,
  payback_months numeric,
  contribution_cents bigint,
  confidence text not null default 'low' check (confidence in ('low', 'medium', 'high')),
  completeness text not null default 'partial' check (completeness in (
    'complete', 'partial', 'delayed', 'rebuilding', 'unavailable', 'stale'
  )),
  calculation_version text not null default 'channel-quality-v1',
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  unique (channel_id, cohort_date, calculation_version)
);

create index if not exists channel_quality_snapshots_cohort_idx
  on public.channel_quality_snapshots (cohort_date desc);

alter table public.channel_quality_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Growth campaigns
-- ---------------------------------------------------------------------------

create table if not exists public.growth_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_key text not null unique,
  name text not null,
  channel_id uuid references public.acquisition_channels (id) on delete set null,
  objective text not null,
  audience text,
  message text,
  offer text,
  landing_page_path text,
  attribution_params jsonb not null default '{}'::jsonb,
  start_date date,
  end_date date,
  budget_cents bigint,
  spend_cents bigint not null default 0,
  volume_cap int,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  approval_id uuid,
  status text not null default 'draft' check (status in (
    'draft', 'review', 'approved', 'scheduled', 'active',
    'paused', 'completed', 'stopped', 'archived'
  )),
  results jsonb not null default '{}'::jsonb,
  creative_version text,
  pricing_version text,
  product_version text,
  experiment_id text,
  stop_conditions jsonb not null default '[]'::jsonb,
  capacity_reviewed boolean not null default false,
  support_reviewed boolean not null default false,
  claims_reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger growth_campaigns_touch
  before update on public.growth_campaigns
  for each row execute function app.touch_updated_at();

create index if not exists growth_campaigns_status_idx
  on public.growth_campaigns (status);

alter table public.growth_campaigns enable row level security;

create table if not exists public.campaign_budgets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.growth_campaigns (id) on delete cascade,
  daily_cap_cents bigint,
  total_cap_cents bigint not null,
  max_cost_per_paid_cents bigint,
  max_activated_cac_cents bigint,
  max_retained_cac_cents bigint,
  min_conversions int,
  max_test_days int,
  geographic_scope text,
  audience_scope text,
  excluded_audiences text,
  provider_side_cap_set boolean not null default false,
  fajita_side_cap_set boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id)
);

alter table public.campaign_budgets enable row level security;

create table if not exists public.campaign_costs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.growth_campaigns (id) on delete set null,
  channel_id uuid references public.acquisition_channels (id) on delete set null,
  amount_cents bigint not null,
  currency text not null default 'USD',
  original_amount_cents bigint,
  original_currency text,
  conversion_rate numeric,
  conversion_date date,
  conversion_source text,
  cost_date date not null,
  source text not null check (source in (
    'manual', 'ad_provider_import', 'sponsorship_invoice', 'partner_invoice',
    'affiliate_commission', 'contractor_invoice', 'content_allocation'
  )),
  invoice_reference text,
  tax_treatment text,
  allocation_method text not null default 'direct',
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists campaign_costs_date_idx
  on public.campaign_costs (cost_date desc);

alter table public.campaign_costs enable row level security;

create table if not exists public.campaign_results (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.growth_campaigns (id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  paid_organizations int not null default 0,
  activated_organizations int not null default 0,
  day7_retained int not null default 0,
  day30_retained int not null default 0,
  retained_mrr_cents bigint not null default 0,
  spend_cents bigint not null default 0,
  support_contacts int not null default 0,
  completeness text not null default 'partial',
  calculation_version text not null default 'campaign-results-v1',
  created_at timestamptz not null default now()
);

alter table public.campaign_results enable row level security;

-- ---------------------------------------------------------------------------
-- Marketplace listings
-- ---------------------------------------------------------------------------

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  listing_url text,
  status text not null default 'researching' check (status in (
    'researching', 'submitted', 'live', 'paused', 'rejected', 'retired'
  )),
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  last_reviewed_at timestamptz,
  product_description_version text,
  pricing_version text,
  logo_version text,
  referral_params jsonb not null default '{}'::jsonb,
  traffic int not null default 0,
  paid_organizations int not null default 0,
  activated_organizations int not null default 0,
  retained_organizations int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_listings enable row level security;

-- ---------------------------------------------------------------------------
-- Growth partners
-- ---------------------------------------------------------------------------

create table if not exists public.growth_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in (
    'hosting', 'agency', 'saas_consultant', 'reliability_consultant',
    'product_studio', 'founder_community', 'education', 'newsletter',
    'incubator', 'accelerator', 'marketplace', 'complementary_saas', 'other'
  )),
  audience text,
  distribution_method text,
  product_fit text,
  value_exchange text,
  commercial_terms_summary text,
  data_sharing text not null default 'none',
  legal_review_status text not null default 'not_started',
  security_review_status text not null default 'not_started',
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  status text not null default 'proposed' check (status in (
    'proposed', 'diligence', 'legal_review', 'security_review',
    'approved', 'active', 'paused', 'rejected', 'terminated'
  )),
  results jsonb not null default '{}'::jsonb,
  renewal_date date,
  exit_process text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_partners enable row level security;

create table if not exists public.partner_agreements_metadata (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.growth_partners (id) on delete cascade,
  agreement_type text not null check (agreement_type in (
    'educational', 'referral', 'integration', 'agency', 'community'
  )),
  effective_date date,
  end_date date,
  document_ref text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.partner_agreements_metadata enable row level security;

-- ---------------------------------------------------------------------------
-- Customer referrals (distinct from Phase 12 affiliate commissions)
-- ---------------------------------------------------------------------------

create table if not exists public.customer_referrals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  advocate_user_id uuid not null references public.user_profiles (id) on delete cascade,
  referral_code text not null unique,
  status text not null default 'active' check (status in (
    'active', 'paused', 'revoked', 'expired'
  )),
  reward_type text not null default 'none' check (reward_type in (
    'none', 'thank_you', 'affiliate_invite'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, advocate_user_id)
);

create index if not exists customer_referrals_org_idx
  on public.customer_referrals (organization_id);

alter table public.customer_referrals enable row level security;

create table if not exists public.referral_attributions (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.customer_referrals (id) on delete cascade,
  referred_organization_id uuid references public.organizations (id) on delete set null,
  attributed_at timestamptz not null default now(),
  window_expires_at timestamptz not null,
  state text not null default 'attributed' check (state in (
    'attributed', 'converted', 'activated', 'retained',
    'invalid_self', 'superseded_by_affiliate', 'expired', 'disputed'
  )),
  affiliate_conflict boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (referred_organization_id)
);

alter table public.referral_attributions enable row level security;

create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid references public.customer_referrals (id) on delete set null,
  attribution_id uuid references public.referral_attributions (id) on delete set null,
  event_type text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists referral_events_idem_idx
  on public.referral_events (idempotency_key)
  where idempotency_key is not null;

alter table public.referral_events enable row level security;

-- ---------------------------------------------------------------------------
-- Content compounding
-- ---------------------------------------------------------------------------

create table if not exists public.content_investment_tiers (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  content_path text not null,
  tier int not null check (tier between 1 and 5),
  classification text not null check (classification in (
    'foundational', 'high_intent', 'educational', 'comparison', 'tool',
    'research', 'supporting', 'underperforming', 'decaying',
    'updating', 'merging', 'retiring'
  )),
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  next_review_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_investment_tiers enable row level security;

create table if not exists public.content_compounding_snapshots (
  id uuid primary key default gen_random_uuid(),
  content_key text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  search_impressions int,
  search_clicks int,
  qualified_visits int not null default 0,
  pricing_transitions int not null default 0,
  paid_conversions int not null default 0,
  activations int not null default 0,
  retentions int not null default 0,
  assisted_mrr_cents bigint not null default 0,
  support_burden int not null default 0,
  refresh_needed boolean not null default false,
  calculation_version text not null default 'content-compound-v1',
  completeness text not null default 'partial',
  created_at timestamptz not null default now()
);

create index if not exists content_compounding_key_idx
  on public.content_compounding_snapshots (content_key, period_end desc);

alter table public.content_compounding_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Capacity
-- ---------------------------------------------------------------------------

create table if not exists public.capacity_thresholds (
  id uuid primary key default gen_random_uuid(),
  resource_key text not null unique,
  label text not null,
  unit text not null,
  current_usage numeric,
  normal_min numeric,
  normal_max numeric,
  warning_threshold numeric not null,
  scale_threshold numeric not null,
  critical_threshold numeric not null,
  lead_time_hours int not null default 24,
  scaling_action text not null,
  cost_impact_cents bigint,
  owner text not null,
  runbook_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.capacity_thresholds enable row level security;

create table if not exists public.capacity_forecasts (
  id uuid primary key default gen_random_uuid(),
  resource_key text not null,
  horizon_days int not null check (horizon_days in (30, 90, 180, 365)),
  forecast_value numeric not null,
  confidence text not null default 'low',
  assumptions jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  calculation_version text not null default 'capacity-forecast-v1'
);

alter table public.capacity_forecasts enable row level security;

create table if not exists public.provider_capacity_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null,
  tier text,
  hard_limit numeric,
  soft_limit numeric,
  rate_limit text,
  current_usage numeric,
  warning_threshold numeric,
  upgrade_lead_time_hours int,
  cost_cents bigint,
  failure_behavior text,
  fallback text,
  owner text not null,
  evaluated_at timestamptz not null default now(),
  unique (provider_key, evaluated_at)
);

create index if not exists provider_capacity_provider_idx
  on public.provider_capacity_snapshots (provider_key, evaluated_at desc);

alter table public.provider_capacity_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Hiring
-- ---------------------------------------------------------------------------

create table if not exists public.hiring_triggers (
  id uuid primary key default gen_random_uuid(),
  trigger_key text not null unique,
  role_category text not null check (role_category in (
    'support', 'engineering', 'content', 'growth', 'operations'
  )),
  label text not null,
  satisfied boolean not null default false,
  evidence jsonb not null default '{}'::jsonb,
  four_week_trend text,
  workload_analysis text,
  budget_available boolean not null default false,
  owner text not null,
  review_date date,
  decision_record_id uuid,
  evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hiring_triggers enable row level security;

create table if not exists public.role_scorecards (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  mission text not null,
  outcomes jsonb not null default '[]'::jsonb,
  first_30_days jsonb not null default '[]'::jsonb,
  first_60_days jsonb not null default '[]'::jsonb,
  first_90_days jsonb not null default '[]'::jsonb,
  responsibilities jsonb not null default '[]'::jsonb,
  non_responsibilities jsonb not null default '[]'::jsonb,
  required_skills jsonb not null default '[]'::jsonb,
  security_requirements jsonb not null default '[]'::jsonb,
  access_level text not null default 'least_privilege',
  metrics jsonb not null default '[]'::jsonb,
  budget_cents bigint,
  contractor_vs_employee text,
  hiring_trigger_key text references public.hiring_triggers (trigger_key),
  review_date date,
  status text not null default 'draft' check (status in (
    'draft', 'proposed', 'approved', 'hired', 'deferred', 'rejected'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.role_scorecards enable row level security;

-- ---------------------------------------------------------------------------
-- Forecasts and risks
-- ---------------------------------------------------------------------------

create table if not exists public.scale_forecasts (
  id uuid primary key default gen_random_uuid(),
  scenario text not null check (scenario in ('conservative', 'base', 'accelerated')),
  period_start date not null,
  period_end date not null,
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  calculation_version text not null default 'scale-forecast-v1',
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists scale_forecasts_scenario_idx
  on public.scale_forecasts (scenario, period_end desc);

alter table public.scale_forecasts enable row level security;

create table if not exists public.forecast_assumptions (
  id uuid primary key default gen_random_uuid(),
  assumption_key text not null,
  label text not null,
  value_numeric numeric,
  value_text text,
  source text not null,
  owner text not null,
  confidence text not null default 'low' check (confidence in ('low', 'medium', 'high')),
  scenario text check (scenario in ('conservative', 'base', 'accelerated', 'all')),
  review_date date,
  actual_vs_forecast text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forecast_assumptions enable row level security;

create table if not exists public.scale_risks (
  id uuid primary key default gen_random_uuid(),
  risk_key text not null unique,
  category text not null check (category in (
    'channel_concentration', 'partner_concentration', 'fraud',
    'capacity', 'support', 'security', 'privacy', 'legal',
    'economics', 'hiring', 'other'
  )),
  title text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  status text not null default 'open' check (status in (
    'open', 'mitigating', 'accepted', 'closed'
  )),
  evidence text,
  mitigation text,
  owner text not null,
  review_date date,
  accepted_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scale_risks enable row level security;

create table if not exists public.scale_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_type text not null,
  title text not null,
  evidence text not null,
  alternatives text,
  economics text,
  reliability_impact text,
  security_impact text,
  privacy_impact text,
  product_simplicity_impact text,
  decision text not null,
  owner text not null,
  revisit_condition text,
  approval_id uuid,
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists scale_decisions_type_idx
  on public.scale_decisions (decision_type, decided_at desc);

alter table public.scale_decisions enable row level security;

-- ---------------------------------------------------------------------------
-- Expansion queue
-- ---------------------------------------------------------------------------

create table if not exists public.scale_expansion_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  plan_key text,
  signal text not null,
  usage_pct numeric,
  evidence jsonb not null default '{}'::jsonb,
  recommended_action text not null check (recommended_action in (
    'in_product_guidance', 'approved_message', 'human_support', 'no_action'
  )),
  support_state text,
  billing_state text,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  status text not null default 'open' check (status in (
    'open', 'contacted', 'converted', 'dismissed', 'expired'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scale_expansion_status_idx
  on public.scale_expansion_opportunities (status, created_at desc);

alter table public.scale_expansion_opportunities enable row level security;

-- ---------------------------------------------------------------------------
-- Founder content queue
-- ---------------------------------------------------------------------------

create table if not exists public.founder_content_queue (
  id uuid primary key default gen_random_uuid(),
  insight text not null,
  source_evidence text,
  public_safe_wording text,
  approved_links jsonb not null default '[]'::jsonb,
  sensitive_data_reviewed boolean not null default false,
  publication_channel text,
  status text not null default 'draft' check (status in (
    'draft', 'review', 'approved', 'published', 'rejected', 'archived'
  )),
  performance jsonb not null default '{}'::jsonb,
  reuse_potential text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.founder_content_queue enable row level security;

-- ---------------------------------------------------------------------------
-- Operating delegation
-- ---------------------------------------------------------------------------

create table if not exists public.operating_delegations (
  id uuid primary key default gen_random_uuid(),
  task_key text not null unique,
  label text not null,
  owner text not null,
  backup text,
  permission text,
  runbook_path text,
  escalation text,
  quality_standard text,
  audit_required boolean not null default true,
  review_cadence text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.operating_delegations enable row level security;

-- Seed Stage 0 baseline (inactive until readiness allows; status blocked by default)
insert into public.scale_stages (
  stage, stage_key, status, entry_criteria, stop_conditions, notes
) values (
  0,
  'baseline',
  'active',
  '["Existing customers only","No intentional traffic acceleration","Phase 18 Ready or Conditionally Ready required before Stage 1"]'::jsonb,
  '["Critical production incident","Billing reconciliation unclean","Monitoring capacity warning","Support capacity unsafe"]'::jsonb,
  'Default post-Phase-20 stage. Do not advance while Phase 18 is Not Ready or Phase 19 stabilization is inactive.'
) on conflict (stage_key) do nothing;
