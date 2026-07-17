-- Phase 17: Founder command center and platform operations OS.
--
-- Internal operating data only. RLS enabled with no customer policies: the
-- Next.js app uses the service role after Clerk + platform-permission checks.
-- No secrets, payment methods, or raw support bodies live in these tables.

-- ---------------------------------------------------------------------------
-- Platform operator roles (separate from organization roles)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_operator_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  role text not null check (role in (
    'platform_owner',
    'platform_administrator',
    'operations',
    'support',
    'billing_operations',
    'security',
    'privacy',
    'content_editor',
    'content_publisher',
    'affiliate_operations',
    'read_only_analyst',
    'auditor'
  )),
  status text not null default 'active'
    check (status in ('active', 'suspended', 'revoked')),
  granted_by uuid references public.user_profiles (id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, role)
);

create index if not exists platform_operator_roles_user_idx
  on public.platform_operator_roles (user_id)
  where status = 'active';

create trigger platform_operator_roles_touch
  before update on public.platform_operator_roles
  for each row execute function app.touch_updated_at();

alter table public.platform_operator_roles enable row level security;

-- ---------------------------------------------------------------------------
-- Step-up authentication records
-- ---------------------------------------------------------------------------

create table if not exists public.platform_step_up_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  action_key text not null,
  resource_type text,
  resource_id text,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null,
  correlation_id text,
  created_at timestamptz not null default now()
);

create index if not exists platform_step_up_user_idx
  on public.platform_step_up_events (user_id, expires_at desc);

alter table public.platform_step_up_events enable row level security;

-- ---------------------------------------------------------------------------
-- Operational events (normalized, bounded metadata)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_operational_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_version int not null default 1,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  source_system text not null,
  environment text not null default 'production',
  actor_type text not null default 'system'
    check (actor_type in ('user', 'system', 'platform_admin', 'service', 'provider')),
  actor_ref text,
  organization_id uuid references public.organizations (id) on delete set null,
  resource_type text,
  resource_id text,
  correlation_id text,
  causation_id text,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  constraint platform_operational_events_metadata_size
    check (pg_column_size(metadata) <= 4096)
);

create unique index if not exists platform_operational_events_idem_idx
  on public.platform_operational_events (idempotency_key)
  where idempotency_key is not null;

create index if not exists platform_operational_events_type_time_idx
  on public.platform_operational_events (event_type, occurred_at desc);

create index if not exists platform_operational_events_org_idx
  on public.platform_operational_events (organization_id, occurred_at desc)
  where organization_id is not null;

alter table public.platform_operational_events enable row level security;

-- ---------------------------------------------------------------------------
-- Metric snapshots / read-model freshness
-- ---------------------------------------------------------------------------

create table if not exists public.platform_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  comparison_period_start timestamptz,
  comparison_period_end timestamptz,
  value_numeric numeric,
  value_json jsonb,
  completeness text not null default 'complete'
    check (completeness in (
      'complete', 'partial', 'delayed', 'rebuilding',
      'unavailable', 'reconciliating', 'stale'
    )),
  calculation_version text not null,
  source text not null,
  refreshed_at timestamptz not null default now(),
  known_lag_seconds int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists platform_metric_snapshots_key_period_idx
  on public.platform_metric_snapshots (metric_key, period_end desc);

alter table public.platform_metric_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Daily platform health aggregates
-- ---------------------------------------------------------------------------

create table if not exists public.platform_daily_health (
  day date primary key,
  overall_state text not null default 'unknown'
    check (overall_state in (
      'operational', 'degraded', 'partial_outage',
      'major_outage', 'maintenance', 'unknown'
    )),
  monitoring_state text not null default 'unknown',
  alert_state text not null default 'unknown',
  status_page_state text not null default 'unknown',
  provider_state text not null default 'unknown',
  database_state text not null default 'unknown',
  worker_state text not null default 'unknown',
  active_monitors int not null default 0,
  checks_completed int not null default 0,
  checks_delayed int not null default 0,
  check_success_rate numeric,
  open_customer_incidents int not null default 0,
  alert_delivery_success_rate numeric,
  mrr_cents bigint not null default 0,
  collected_revenue_cents bigint not null default 0,
  active_organizations int not null default 0,
  activated_organizations int not null default 0,
  at_risk_organizations int not null default 0,
  approval_backlog int not null default 0,
  critical_security_events int not null default 0,
  reconciliation_differences int not null default 0,
  completeness text not null default 'complete',
  calculation_version text not null default '1',
  refreshed_at timestamptz not null default now()
);

alter table public.platform_daily_health enable row level security;

-- ---------------------------------------------------------------------------
-- Organization health snapshots (customer intelligence)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_org_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  health_state text not null,
  activation_state text,
  billing_state text,
  plan_key text,
  mrr_cents bigint not null default 0,
  active_monitors int not null default 0,
  open_incidents int not null default 0,
  published_status_pages int not null default 0,
  subscriber_count int not null default 0,
  last_meaningful_activity_at timestamptz,
  evidence jsonb not null default '{}'::jsonb,
  rule_version text not null default '1',
  recommended_action text,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id)
);

create index if not exists platform_org_health_state_idx
  on public.platform_org_health_snapshots (health_state, evaluated_at desc);

alter table public.platform_org_health_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Revenue movement ledger (immutable MRR movements)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_mrr_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subscription_id uuid,
  movement_type text not null check (movement_type in (
    'new', 'expansion', 'contraction', 'churn', 'reactivation',
    'plan_migration', 'currency_adjustment', 'correction'
  )),
  effective_date date not null,
  prior_mrr_cents bigint not null default 0,
  new_mrr_cents bigint not null default 0,
  difference_cents bigint not null,
  plan_key text,
  billing_interval text,
  source_event text,
  calculation_version text not null default '1',
  created_at timestamptz not null default now(),
  idempotency_key text unique
);

create index if not exists platform_mrr_movements_date_idx
  on public.platform_mrr_movements (effective_date desc);

create index if not exists platform_mrr_movements_org_idx
  on public.platform_mrr_movements (organization_id, effective_date desc);

alter table public.platform_mrr_movements enable row level security;

-- ---------------------------------------------------------------------------
-- Approvals
-- ---------------------------------------------------------------------------

create table if not exists public.platform_approvals (
  id uuid primary key default gen_random_uuid(),
  approval_type text not null,
  state text not null default 'draft' check (state in (
    'draft', 'submitted', 'under_review', 'approved', 'rejected',
    'expired', 'executing', 'completed', 'failed', 'rolled_back', 'canceled'
  )),
  requester_user_id uuid not null references public.user_profiles (id),
  approver_user_id uuid references public.user_profiles (id),
  scope jsonb not null default '{}'::jsonb,
  reason text not null,
  impact_summary text,
  risk_classification text not null default 'medium'
    check (risk_classification in ('low', 'medium', 'high', 'critical')),
  evidence jsonb not null default '{}'::jsonb,
  decision_reason text,
  execution_result jsonb,
  expires_at timestamptz,
  cooling_off_until timestamptz,
  executed_at timestamptz,
  completed_at timestamptz,
  correlation_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_approvals_state_idx
  on public.platform_approvals (state, created_at desc);

create trigger platform_approvals_touch
  before update on public.platform_approvals
  for each row execute function app.touch_updated_at();

alter table public.platform_approvals enable row level security;

-- ---------------------------------------------------------------------------
-- Feature flag change history (registry remains code; this is ops history)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_feature_flag_changes (
  id uuid primary key default gen_random_uuid(),
  flag_key text not null,
  environment text not null default 'production',
  change_type text not null check (change_type in (
    'create', 'update', 'rollout', 'pause', 'rollback', 'retire', 'override'
  )),
  prior_value jsonb,
  new_value jsonb not null,
  actor_user_id uuid references public.user_profiles (id) on delete set null,
  approval_id uuid references public.platform_approvals (id) on delete set null,
  reason text,
  risk_classification text not null default 'medium',
  created_at timestamptz not null default now()
);

create index if not exists platform_feature_flag_changes_key_idx
  on public.platform_feature_flag_changes (flag_key, created_at desc);

alter table public.platform_feature_flag_changes enable row level security;

-- ---------------------------------------------------------------------------
-- Internal platform incidents (Fajita's own platform, not customer incidents)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  state text not null default 'detected' check (state in (
    'detected', 'acknowledged', 'investigating', 'mitigating',
    'resolved', 'post_review'
  )),
  category text not null,
  assignee_user_id uuid references public.user_profiles (id) on delete set null,
  customer_impact text,
  public_communication_decision text not null default 'none'
    check (public_communication_decision in ('none', 'pending_approval', 'approved', 'published', 'declined')),
  fajita_status_page_incident_id uuid,
  started_at timestamptz not null default now(),
  mitigated_at timestamptz,
  resolved_at timestamptz,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_incidents_state_idx
  on public.platform_incidents (state, severity, started_at desc);

create trigger platform_incidents_touch
  before update on public.platform_incidents
  for each row execute function app.touch_updated_at();

alter table public.platform_incidents enable row level security;

create table if not exists public.platform_incident_events (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.platform_incidents (id) on delete cascade,
  event_type text not null,
  body text not null,
  actor_user_id uuid references public.user_profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists platform_incident_events_incident_idx
  on public.platform_incident_events (incident_id, created_at);

alter table public.platform_incident_events enable row level security;

-- ---------------------------------------------------------------------------
-- Security events
-- ---------------------------------------------------------------------------

create table if not exists public.platform_security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  source text not null,
  environment text not null default 'production',
  organization_id uuid references public.organizations (id) on delete set null,
  user_id uuid references public.user_profiles (id) on delete set null,
  resource_type text,
  resource_id text,
  detection_time timestamptz not null default now(),
  first_observed_at timestamptz not null default now(),
  last_observed_at timestamptz not null default now(),
  occurrence_count int not null default 1,
  evidence_summary text not null,
  restricted_evidence_ref text,
  status text not null default 'new' check (status in (
    'new', 'triaged', 'investigating', 'contained',
    'resolved', 'false_positive', 'accepted_risk'
  )),
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  resolution text,
  related_incident_id uuid references public.platform_incidents (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_security_events_status_idx
  on public.platform_security_events (status, severity, detection_time desc);

create trigger platform_security_events_touch
  before update on public.platform_security_events
  for each row execute function app.touch_updated_at();

alter table public.platform_security_events enable row level security;

-- ---------------------------------------------------------------------------
-- Privacy requests
-- ---------------------------------------------------------------------------

create table if not exists public.platform_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in (
    'data_export', 'user_deletion', 'organization_deletion',
    'subscriber_deletion', 'support_deletion', 'affiliate_closure',
    'retention_exception', 'legal_hold'
  )),
  state text not null default 'received' check (state in (
    'received', 'identity_verified', 'in_progress', 'pending_provider',
    'completed', 'failed', 'overdue', 'canceled', 'held'
  )),
  requester_ref text not null,
  organization_id uuid references public.organizations (id) on delete set null,
  scope jsonb not null default '{}'::jsonb,
  identity_verified boolean not null default false,
  deadline_at timestamptz,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  completion_evidence jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists platform_privacy_requests_state_idx
  on public.platform_privacy_requests (state, deadline_at);

create trigger platform_privacy_requests_touch
  before update on public.platform_privacy_requests
  for each row execute function app.touch_updated_at();

alter table public.platform_privacy_requests enable row level security;

-- ---------------------------------------------------------------------------
-- Reconciliation runs (cross-domain)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  mode text not null default 'dry_run' check (mode in ('dry_run', 'repair')),
  state text not null default 'running' check (state in (
    'running', 'completed', 'failed', 'partial'
  )),
  differences int not null default 0,
  auto_repaired int not null default 0,
  manual_review int not null default 0,
  failed_repairs int not null default 0,
  summary jsonb not null default '{}'::jsonb,
  actor_user_id uuid references public.user_profiles (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  approval_id uuid references public.platform_approvals (id) on delete set null
);

create index if not exists platform_reconciliation_runs_domain_idx
  on public.platform_reconciliation_runs (domain, started_at desc);

alter table public.platform_reconciliation_runs enable row level security;

-- ---------------------------------------------------------------------------
-- Provider health
-- ---------------------------------------------------------------------------

create table if not exists public.platform_provider_health (
  provider_key text primary key,
  display_name text not null,
  operational_state text not null default 'unknown'
    check (operational_state in (
      'operational', 'degraded', 'partial_outage',
      'major_outage', 'maintenance', 'unknown'
    )),
  last_successful_at timestamptz,
  error_rate numeric,
  latency_ms numeric,
  rate_limit_state text,
  webhook_lag_seconds int,
  credential_expires_at timestamptz,
  configuration_state text not null default 'configured',
  mode text not null default 'live' check (mode in ('live', 'test', 'mixed', 'unset')),
  fallback_behavior text,
  subprocessor boolean not null default false,
  owner text,
  documentation_url text,
  notes text,
  refreshed_at timestamptz not null default now()
);

alter table public.platform_provider_health enable row level security;

-- ---------------------------------------------------------------------------
-- Infrastructure / environment / configuration inventory
-- ---------------------------------------------------------------------------

create table if not exists public.platform_infrastructure_services (
  id uuid primary key default gen_random_uuid(),
  service_key text not null unique,
  purpose text not null,
  environment text not null,
  provider text not null,
  region text,
  deployment_identifier text,
  version text,
  health text not null default 'unknown',
  owner text,
  cost_category text,
  secret_references text[] not null default '{}',
  domain text,
  data_sensitivity text,
  scaling_model text,
  backup_state text,
  runbook_key text,
  transfer_status text not null default 'documented',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_infrastructure_services_touch
  before update on public.platform_infrastructure_services
  for each row execute function app.touch_updated_at();

alter table public.platform_infrastructure_services enable row level security;

create table if not exists public.platform_environment_inventory (
  environment text primary key check (environment in (
    'development', 'preview', 'staging', 'production'
  )),
  domains text[] not null default '{}',
  provider_projects jsonb not null default '{}'::jsonb,
  billing_mode text,
  email_mode text,
  pamphlet_workspace text,
  analytics_mode text,
  current_version text,
  last_deployment_at timestamptz,
  health text not null default 'unknown',
  mismatch_notes text,
  refreshed_at timestamptz not null default now()
);

alter table public.platform_environment_inventory enable row level security;

create table if not exists public.platform_configuration_settings (
  key text not null,
  environment text not null default 'production',
  value jsonb not null,
  owner text,
  source text not null default 'code',
  version text not null default '1',
  public_impact boolean not null default false,
  documentation_relationship text,
  last_changed_at timestamptz not null default now(),
  change_reason text,
  primary key (key, environment)
);

alter table public.platform_configuration_settings enable row level security;

-- ---------------------------------------------------------------------------
-- Releases / deployments (read-only inventory)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_releases (
  id uuid primary key default gen_random_uuid(),
  release_id text not null unique,
  version text,
  commit_ref text,
  deployment_url text,
  environment text not null,
  status text not null default 'unknown',
  initiator text,
  migration_set text[],
  feature_flags text[],
  started_at timestamptz,
  completed_at timestamptz,
  rollback_ref text,
  health_notes text,
  created_at timestamptz not null default now()
);

create index if not exists platform_releases_env_idx
  on public.platform_releases (environment, started_at desc nulls last);

alter table public.platform_releases enable row level security;

-- ---------------------------------------------------------------------------
-- Cost visibility
-- ---------------------------------------------------------------------------

create table if not exists public.platform_cost_entries (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null,
  category text not null,
  period_start date not null,
  period_end date not null,
  amount_cents bigint not null,
  currency text not null default 'usd',
  source text not null check (source in ('provider_api', 'manual', 'estimate', 'invoice')),
  notes text,
  created_at timestamptz not null default now(),
  unique (provider_key, category, period_start, period_end, source)
);

alter table public.platform_cost_entries enable row level security;

create table if not exists public.platform_cost_anomalies (
  id uuid primary key default gen_random_uuid(),
  metric text not null,
  baseline_cents bigint,
  current_cents bigint,
  period_start date not null,
  period_end date not null,
  likely_drivers text,
  confidence text not null default 'medium',
  owner text,
  review_state text not null default 'new'
    check (review_state in ('new', 'acknowledged', 'investigating', 'resolved', 'accepted')),
  created_at timestamptz not null default now()
);

alter table public.platform_cost_anomalies enable row level security;

-- ---------------------------------------------------------------------------
-- Anomaly rules and events
-- ---------------------------------------------------------------------------

create table if not exists public.platform_anomaly_rules (
  rule_key text primary key,
  display_name text not null,
  source_metric text not null,
  window_minutes int not null,
  baseline_description text not null,
  threshold_description text not null,
  severity text not null default 'medium',
  minimum_sample int not null default 1,
  cooldown_minutes int not null default 60,
  owner text,
  notification_channel text,
  runbook_key text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_anomaly_rules_touch
  before update on public.platform_anomaly_rules
  for each row execute function app.touch_updated_at();

alter table public.platform_anomaly_rules enable row level security;

create table if not exists public.platform_anomaly_events (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null references public.platform_anomaly_rules (rule_key),
  state text not null default 'detected' check (state in (
    'detected', 'acknowledged', 'investigating', 'resolved',
    'false_positive', 'accepted', 'escalated'
  )),
  evidence jsonb not null default '{}'::jsonb,
  baseline_value numeric,
  current_value numeric,
  detected_at timestamptz not null default now(),
  related_deployment text,
  related_provider text,
  customer_impact text,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  platform_incident_id uuid references public.platform_incidents (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_anomaly_events_state_idx
  on public.platform_anomaly_events (state, detected_at desc);

create trigger platform_anomaly_events_touch
  before update on public.platform_anomaly_events
  for each row execute function app.touch_updated_at();

alter table public.platform_anomaly_events enable row level security;

-- ---------------------------------------------------------------------------
-- Operator notifications, tasks, calendar, notes, runbooks
-- ---------------------------------------------------------------------------

create table if not exists public.platform_operator_notifications (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  body text not null,
  severity text not null default 'medium',
  resource_type text,
  resource_id text,
  state text not null default 'open' check (state in (
    'open', 'acknowledged', 'snoozed', 'resolved'
  )),
  assignee_user_id uuid references public.user_profiles (id) on delete set null,
  snooze_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists platform_operator_notifications_state_idx
  on public.platform_operator_notifications (state, created_at desc);

create trigger platform_operator_notifications_touch
  before update on public.platform_operator_notifications
  for each row execute function app.touch_updated_at();

alter table public.platform_operator_notifications enable row level security;

create table if not exists public.platform_operational_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  due_at timestamptz,
  status text not null default 'open' check (status in (
    'open', 'in_progress', 'blocked', 'done', 'canceled'
  )),
  related_resource_type text,
  related_resource_id text,
  related_event_id uuid,
  approval_id uuid references public.platform_approvals (id) on delete set null,
  created_by uuid references public.user_profiles (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_operational_tasks_status_idx
  on public.platform_operational_tasks (status, due_at);

create trigger platform_operational_tasks_touch
  before update on public.platform_operational_tasks
  for each row execute function app.touch_updated_at();

alter table public.platform_operational_tasks enable row level security;

create table if not exists public.platform_calendar_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  due_at timestamptz not null,
  recurrence text,
  completed_at timestamptz,
  evidence text,
  runbook_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_calendar_items_due_idx
  on public.platform_calendar_items (due_at);

create trigger platform_calendar_items_touch
  before update on public.platform_calendar_items
  for each row execute function app.touch_updated_at();

alter table public.platform_calendar_items enable row level security;

create table if not exists public.platform_customer_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  author_user_id uuid not null references public.user_profiles (id),
  category text not null check (category in (
    'support', 'billing', 'security', 'product', 'onboarding',
    'retention', 'acquisition', 'legal', 'general'
  )),
  body text not null,
  visibility text not null default 'internal'
    check (visibility in ('internal', 'restricted')),
  resource_type text,
  resource_id text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_customer_notes_body_len check (char_length(body) <= 8000)
);

create index if not exists platform_customer_notes_org_idx
  on public.platform_customer_notes (organization_id, created_at desc)
  where deleted_at is null;

create trigger platform_customer_notes_touch
  before update on public.platform_customer_notes
  for each row execute function app.touch_updated_at();

alter table public.platform_customer_notes enable row level security;

create table if not exists public.platform_runbooks (
  runbook_key text primary key,
  title text not null,
  trigger_description text not null,
  severity text not null default 'medium',
  owner text,
  preconditions text,
  safe_checks text,
  mitigation text,
  customer_impact text,
  communication text,
  verification text,
  escalation text,
  rollback text,
  follow_up text,
  last_reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_runbooks_touch
  before update on public.platform_runbooks
  for each row execute function app.touch_updated_at();

alter table public.platform_runbooks enable row level security;

-- ---------------------------------------------------------------------------
-- Support-to-product queue, claims consistency, data inventory
-- ---------------------------------------------------------------------------

create table if not exists public.platform_product_friction_items (
  id uuid primary key default gen_random_uuid(),
  queue_type text not null check (queue_type in (
    'documentation_gap', 'error_message', 'onboarding_friction',
    'product_bug', 'feature_request', 'pricing_confusion',
    'billing_confusion', 'security_concern', 'integration_issue',
    'status_page_issue'
  )),
  sanitized_issue text not null,
  frequency int not null default 1,
  product_area text,
  impact text,
  existing_source text,
  organizations_affected int not null default 0,
  owner text,
  status text not null default 'open' check (status in (
    'open', 'triaged', 'in_progress', 'resolved', 'wont_fix', 'duplicate'
  )),
  related_product_issue text,
  related_documentation_issue text,
  last_observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_product_friction_status_idx
  on public.platform_product_friction_items (status, frequency desc);

create trigger platform_product_friction_touch
  before update on public.platform_product_friction_items
  for each row execute function app.touch_updated_at();

alter table public.platform_product_friction_items enable row level security;

create table if not exists public.platform_claims_findings (
  id uuid primary key default gen_random_uuid(),
  claim_key text,
  finding_type text not null,
  severity text not null default 'medium',
  sources text[] not null default '{}',
  controlling_value text,
  owner text,
  fix_recommendation text,
  status text not null default 'open' check (status in (
    'open', 'in_progress', 'resolved', 'accepted', 'false_positive'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_claims_findings_touch
  before update on public.platform_claims_findings
  for each row execute function app.touch_updated_at();

alter table public.platform_claims_findings enable row level security;

create table if not exists public.platform_data_inventory (
  id uuid primary key default gen_random_uuid(),
  data_category text not null,
  system_name text not null,
  table_or_provider text not null,
  purpose text not null,
  legal_basis_placeholder text,
  sensitivity text not null default 'internal',
  retention text,
  encryption_state text,
  access_roles text[] not null default '{}',
  export_behavior text,
  deletion_behavior text,
  subprocessor text,
  region text,
  owner text,
  last_reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_data_inventory_touch
  before update on public.platform_data_inventory
  for each row execute function app.touch_updated_at();

alter table public.platform_data_inventory enable row level security;

-- ---------------------------------------------------------------------------
-- Reports, exports, saved views, SEO/AI observations
-- ---------------------------------------------------------------------------

create table if not exists public.platform_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  state text not null default 'generating' check (state in (
    'generating', 'ready', 'failed', 'expired'
  )),
  payload jsonb,
  filters jsonb not null default '{}'::jsonb,
  calculation_version text not null default '1',
  generated_by uuid references public.user_profiles (id) on delete set null,
  error_message text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists platform_reports_type_idx
  on public.platform_reports (report_type, created_at desc);

alter table public.platform_reports enable row level security;

create table if not exists public.platform_report_notes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.platform_reports (id) on delete cascade,
  note_type text not null check (note_type in (
    'observation', 'decision', 'risk', 'action', 'assumption', 'data_limitation'
  )),
  body text not null,
  author_user_id uuid not null references public.user_profiles (id),
  related_metric text,
  related_task_id uuid references public.platform_operational_tasks (id) on delete set null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_report_notes_touch
  before update on public.platform_report_notes
  for each row execute function app.touch_updated_at();

alter table public.platform_report_notes enable row level security;

create table if not exists public.platform_exports (
  id uuid primary key default gen_random_uuid(),
  export_type text not null,
  state text not null default 'queued' check (state in (
    'queued', 'generating', 'ready', 'failed', 'expired', 'deleted'
  )),
  filters jsonb not null default '{}'::jsonb,
  column_allowlist text[] not null default '{}',
  row_count int,
  storage_path text,
  content_hash text,
  watermark text,
  requested_by uuid not null references public.user_profiles (id),
  approval_id uuid references public.platform_approvals (id) on delete set null,
  download_count int not null default 0,
  expires_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  deleted_at timestamptz
);

create index if not exists platform_exports_state_idx
  on public.platform_exports (state, created_at desc);

alter table public.platform_exports enable row level security;

create table if not exists public.platform_saved_views (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.user_profiles (id) on delete cascade,
  name text not null,
  surface text not null,
  filters jsonb not null default '{}'::jsonb,
  columns text[] not null default '{}',
  sort_spec jsonb,
  sharing_state text not null default 'private'
    check (sharing_state in ('private', 'role', 'platform')),
  shared_roles text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_saved_views_touch
  before update on public.platform_saved_views
  for each row execute function app.touch_updated_at();

alter table public.platform_saved_views enable row level security;

create table if not exists public.platform_seo_observations (
  id uuid primary key default gen_random_uuid(),
  observation_date date not null,
  search_engine text not null default 'google',
  landing_page text,
  query_group text,
  impressions int,
  clicks int,
  ctr numeric,
  average_position numeric,
  device_class text,
  country text,
  content_type text,
  source text not null default 'manual'
    check (source in ('search_console', 'manual', 'unavailable')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists platform_seo_observations_date_idx
  on public.platform_seo_observations (observation_date desc);

alter table public.platform_seo_observations enable row level security;

create table if not exists public.platform_ai_citation_observations (
  id uuid primary key default gen_random_uuid(),
  ai_platform text not null,
  query text not null,
  cited_url text,
  citation_date date not null,
  citation_accuracy text,
  content_version text,
  citation_type text,
  correction_needed boolean not null default false,
  owner text,
  status text not null default 'observed' check (status in (
    'observed', 'verified', 'needs_correction', 'corrected', 'dismissed'
  )),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.platform_ai_citation_observations enable row level security;

-- ---------------------------------------------------------------------------
-- Internal page analytics (first-party, non-advertising)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_internal_page_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  operator_user_id uuid references public.user_profiles (id) on delete set null,
  path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint platform_internal_page_events_metadata_size
    check (pg_column_size(metadata) <= 2048)
);

create index if not exists platform_internal_page_events_name_idx
  on public.platform_internal_page_events (event_name, created_at desc);

alter table public.platform_internal_page_events enable row level security;

-- ---------------------------------------------------------------------------
-- Audit sequence helpers (append-only application behavior; no UPDATE grants)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_audit_sequence (
  id bigserial primary key,
  audit_event_id uuid not null,
  prev_hash text,
  row_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.platform_audit_sequence enable row level security;

-- Seed baseline provider health rows (no secrets).
insert into public.platform_provider_health (provider_key, display_name, subprocessor, owner)
values
  ('stripe', 'Stripe', true, 'billing'),
  ('clerk', 'Clerk', true, 'security'),
  ('supabase', 'Supabase', true, 'infrastructure'),
  ('resend', 'Resend', true, 'operations'),
  ('slack', 'Slack', false, 'operations'),
  ('discord', 'Discord', false, 'operations'),
  ('pamphlet', 'Pamphlet', true, 'support'),
  ('vercel', 'Vercel', true, 'infrastructure'),
  ('dns_tls', 'DNS / TLS', true, 'infrastructure'),
  ('datafast', 'DataFast', true, 'analytics')
on conflict (provider_key) do nothing;

-- Seed baseline anomaly rules (thresholds are descriptive; evaluation is code).
insert into public.platform_anomaly_rules (
  rule_key, display_name, source_metric, window_minutes,
  baseline_description, threshold_description, severity, owner, runbook_key
) values
  ('check_delay', 'Check delay above threshold', 'monitoring.checks_delayed', 30,
   'Rolling 30m median delay', 'Delay exceeds configured catch-up budget', 'high', 'operations', 'monitoring_scheduler_backlog'),
  ('queue_age', 'Queue age above threshold', 'monitoring.oldest_due_age_seconds', 15,
   'Rolling queue age', 'Oldest due check age exceeds threshold', 'high', 'operations', 'monitoring_scheduler_backlog'),
  ('worker_heartbeat', 'Worker heartbeat missing', 'monitoring.worker_heartbeat_age_seconds', 5,
   'Per-worker heartbeat cadence', 'Heartbeat missing beyond lease window', 'critical', 'operations', 'worker_region_failure'),
  ('alert_delivery_failures', 'Alert delivery failure increase', 'alerts.failure_rate', 60,
   'Prior hour failure rate', 'Failure rate rises above baseline + threshold', 'high', 'operations', 'alert_dead_letter_spike'),
  ('payment_failure_spike', 'Payment failure spike', 'billing.payment_failures', 1440,
   'Prior day failures', 'Failures exceed baseline', 'high', 'billing_operations', 'payment_recovery'),
  ('security_event_spike', 'Security event spike', 'security.critical_count', 60,
   'Prior hour critical events', 'Critical events exceed threshold', 'critical', 'security', 'security_report'),
  ('reconciliation_diff', 'Reconciliation difference increase', 'reconciliation.differences', 1440,
   'Prior day differences', 'Unresolved differences increase', 'medium', 'operations', 'data_reconciliation'),
  ('cost_increase', 'Cost increase', 'costs.month_to_date_cents', 43200,
   'Prior month same period', 'Month-to-date cost exceeds baseline by threshold', 'medium', 'platform_owner', 'cost_review')
on conflict (rule_key) do nothing;
