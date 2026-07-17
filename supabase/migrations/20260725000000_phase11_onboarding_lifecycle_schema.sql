-- Phase 11: onboarding orchestration + customer lifecycle schema.
--
-- Extends the Phase 3 onboarding foundation (organization_onboarding stays the
-- org-level anchor row; user_profiles.onboarding_status stays the user-level
-- coarse stage). Adds:
--
--   * organization_onboarding_steps  -> per-step, per-version state records
--   * onboarding_events              -> append-only funnel/time-to-value source
--   * user_onboarding                -> per-user tour + replay state
--   * lifecycle_states               -> evidence-based org lifecycle state
--   * lifecycle_events               -> append-only lifecycle transitions
--   * lifecycle_email_preferences    -> per-user optional message classes
--   * lifecycle_suppressions         -> bounce/complaint suppression (account users)
--   * lifecycle_delivery_intents     -> dedup-safe lifecycle email queue
--   * lifecycle_delivery_attempts    -> append-only send attempts
--   * weekly_reports                 -> immutable weekly reliability snapshots
--   * organization_report_settings   -> report period + delivery config
--   * weekly_report_recipients       -> owner-managed recipient list
--   * incident_recaps                -> immutable post-incident snapshots
--   * incident_recap_revisions       -> versioned root-cause corrections
--   * incident_follow_up_actions     -> lightweight incident follow-ups
--
-- Lifecycle email is logically separate from Phase 7 incident alerts and
-- Phase 9 status-page subscriber email, but reuses the same provider (Resend),
-- error taxonomy, and lease/attempt engine pattern. Forward-only migration.

-- ---------------------------------------------------------------------------
-- organization_onboarding: Phase 11 milestone + context columns.
-- version 1 = Phase 3 checklist; version 2 = Phase 11 activation journey.
-- Historical completion timestamps are never overwritten.
-- ---------------------------------------------------------------------------
alter table public.organization_onboarding
  add column if not exists first_concern text,
  add column if not exists responsibility_role text
    check (responsibility_role is null or responsibility_role in (
      'founder', 'developer', 'operations', 'support', 'agency', 'other'
    )),
  add column if not exists first_monitor_activated_at timestamptz,
  add column if not exists first_real_check_at timestamptz,
  add column if not exists alert_path_ready_at timestamptz,
  add column if not exists status_page_ready_at timestamptz,
  add column if not exists activated_at timestamptz,
  add column if not exists checklist_dismissed_at timestamptz;

alter table public.organization_onboarding
  drop constraint if exists organization_onboarding_first_concern_len;
alter table public.organization_onboarding
  add constraint organization_onboarding_first_concern_len
    check (first_concern is null or char_length(first_concern) <= 120);

-- ---------------------------------------------------------------------------
-- organization_onboarding_steps: one row per (org, version, step). The step
-- vocabulary lives in code (src/lib/onboarding/definitions.ts) exactly like
-- the alert event registry; the database stores state, not definitions.
-- ---------------------------------------------------------------------------
create table if not exists public.organization_onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  version integer not null default 2,
  step_key text not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  completed_by_user_id uuid references public.user_profiles (id),
  skipped_at timestamptz,
  source text not null default 'system'
    check (source in ('user', 'system', 'reconciliation')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_onboarding_steps_key_len check (char_length(step_key) <= 60),
  unique (organization_id, version, step_key)
);

create index if not exists organization_onboarding_steps_org_idx
  on public.organization_onboarding_steps (organization_id, version);

create trigger organization_onboarding_steps_touch
  before update on public.organization_onboarding_steps
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- onboarding_events: append-only funnel source. Server timestamps only; the
-- activation funnel and time-to-value metrics read from here. Bounded
-- metadata; never URLs, secrets, org names, or emails.
-- ---------------------------------------------------------------------------
create table if not exists public.onboarding_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.user_profiles (id) on delete set null,
  version integer not null default 2,
  event_type text not null,
  step_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint onboarding_events_type_len check (char_length(event_type) <= 60),
  constraint onboarding_events_step_len check (step_key is null or char_length(step_key) <= 60)
);

create index if not exists onboarding_events_org_created_idx
  on public.onboarding_events (organization_id, created_at desc);
create index if not exists onboarding_events_type_idx
  on public.onboarding_events (event_type, created_at desc);

-- ---------------------------------------------------------------------------
-- user_onboarding: per-user tour + replay state. Tours are bounded keys in
-- code; jsonb stores only {tourKey: "completed"|"dismissed"} flags.
-- ---------------------------------------------------------------------------
create table if not exists public.user_onboarding (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  tours jsonb not null default '{}'::jsonb,
  replay_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_onboarding_touch
  before update on public.user_onboarding
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- lifecycle_states: current evidence-based org lifecycle state. History goes
-- to lifecycle_events. Never a marketing persona; computed from product data.
-- ---------------------------------------------------------------------------
create table if not exists public.lifecycle_states (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  state text not null default 'new'
    check (state in (
      'new', 'setup_in_progress', 'first_value', 'activated', 'engaged',
      'setup_stalled', 'inactive', 'at_risk', 'payment_issue',
      'cancellation_scheduled', 'canceled_read_only', 'reactivated',
      'pending_deletion', 'deleted'
    )),
  previous_state text,
  reasons jsonb not null default '[]'::jsonb,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lifecycle_states_touch
  before update on public.lifecycle_states
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- lifecycle_events: append-only record of state transitions and lifecycle
-- decisions (rule matched, suppression applied, report generated).
-- ---------------------------------------------------------------------------
create table if not exists public.lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.user_profiles (id) on delete set null,
  event_type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint lifecycle_events_type_len check (char_length(event_type) <= 60)
);

create index if not exists lifecycle_events_org_created_idx
  on public.lifecycle_events (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- lifecycle_email_preferences: per-user optional lifecycle message classes.
-- Deliberately separate from Phase 3 notification_preferences (product/
-- marketing categories), Phase 7 alert recipients, and Phase 9 status-page
-- subscribers. Required service messages are not represented here because
-- they cannot be disabled.
-- ---------------------------------------------------------------------------
create table if not exists public.lifecycle_email_preferences (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  setup_guidance boolean not null default true,
  weekly_report boolean not null default true,
  incident_recaps boolean not null default true,
  usage_notices boolean not null default true,
  reactivation_reminders boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lifecycle_email_preferences_touch
  before update on public.lifecycle_email_preferences
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- lifecycle_suppressions: bounce/complaint suppression for account users.
-- Any row suppresses optional lifecycle email for that user. Required service
-- notices follow policy in code, not this table.
-- ---------------------------------------------------------------------------
create table if not exists public.lifecycle_suppressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  reason text not null
    check (reason in ('hard_bounce', 'complaint', 'manual')),
  provider_event_id text,
  created_at timestamptz not null default now(),
  unique (user_id, reason)
);

create index if not exists lifecycle_suppressions_user_idx
  on public.lifecycle_suppressions (user_id);

-- ---------------------------------------------------------------------------
-- lifecycle_delivery_intents: the lifecycle email queue. Mirrors the Phase 7
-- alert intent shape (lease fields, attempt counters, statuses) but is
-- email-only and recipient-scoped. dedup_key uniqueness is the deduplication
-- authority: one welcome per user, one weekly report per org/period/recipient,
-- one recap per incident/recipient, one reminder per cooldown window.
-- ---------------------------------------------------------------------------
create table if not exists public.lifecycle_delivery_intents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  message_key text not null,
  message_class text not null
    check (message_class in ('required', 'setup', 'report', 'reactivation')),
  template_version integer not null default 1,
  dedup_key text not null unique,
  status text not null default 'pending'
    check (status in (
      'pending', 'scheduled', 'processing', 'delivered', 'failed',
      'dead_letter', 'suppressed', 'canceled'
    )),
  scheduled_at timestamptz not null default now(),
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  locked_at timestamptz,
  locked_by_worker text,
  lease_expires_at timestamptz,
  -- Safe render payload only: names, counts, dates, deep-link paths.
  -- Never secrets, full URLs with credentials, or subscriber data.
  payload jsonb not null default '{}'::jsonb,
  suppression_reason text,
  last_error_category text,
  related_type text,
  related_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint lifecycle_delivery_intents_key_len check (char_length(message_key) <= 60),
  constraint lifecycle_delivery_intents_dedup_len check (char_length(dedup_key) <= 200)
);

create index if not exists lifecycle_delivery_intents_due_idx
  on public.lifecycle_delivery_intents (status, scheduled_at)
  where status in ('pending', 'scheduled');
create index if not exists lifecycle_delivery_intents_user_idx
  on public.lifecycle_delivery_intents (user_id, created_at desc);
create index if not exists lifecycle_delivery_intents_org_idx
  on public.lifecycle_delivery_intents (organization_id, created_at desc);
create index if not exists lifecycle_delivery_intents_message_idx
  on public.lifecycle_delivery_intents (message_key, created_at desc);

create trigger lifecycle_delivery_intents_touch
  before update on public.lifecycle_delivery_intents
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- lifecycle_delivery_attempts: append-only send attempts.
-- ---------------------------------------------------------------------------
create table if not exists public.lifecycle_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid not null references public.lifecycle_delivery_intents (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  attempt_number integer not null,
  result text not null
    check (result in ('delivered', 'retryable_failure', 'permanent_failure', 'error')),
  error_category text,
  safe_summary text,
  http_status integer,
  provider_message_id text,
  duration_ms integer,
  next_retry_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint lifecycle_delivery_attempts_summary_len
    check (safe_summary is null or char_length(safe_summary) <= 500)
);

create index if not exists lifecycle_delivery_attempts_intent_idx
  on public.lifecycle_delivery_attempts (intent_id, attempt_number);
create index if not exists lifecycle_delivery_attempts_provider_idx
  on public.lifecycle_delivery_attempts (provider_message_id)
  where provider_message_id is not null;

-- ---------------------------------------------------------------------------
-- weekly_reports: immutable weekly reliability snapshots. One row per org per
-- period; unique (org, period_start) is the generation idempotency guard.
-- Snapshots are never regenerated in place; metric definitions are versioned.
-- Safe monitor names and hostnames only; never secrets or full URLs.
-- ---------------------------------------------------------------------------
create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  timezone text not null default 'UTC',
  metrics_version integer not null default 1,
  data_completeness text not null default 'complete'
    check (data_completeness in ('complete', 'partial', 'delayed', 'unavailable')),
  snapshot jsonb not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, period_start)
);

create index if not exists weekly_reports_org_period_idx
  on public.weekly_reports (organization_id, period_start desc);

-- ---------------------------------------------------------------------------
-- organization_report_settings: period + delivery config per organization.
-- ---------------------------------------------------------------------------
create table if not exists public.organization_report_settings (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  enabled boolean not null default true,
  week_start text not null default 'monday'
    check (week_start in ('monday', 'sunday')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organization_report_settings_touch
  before update on public.organization_report_settings
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- weekly_report_recipients: owner-managed recipient list. When empty, the
-- default recipient set is active owners and admins whose weekly_report
-- preference is on. Only active verified members may be listed; user
-- preference is still respected at send time.
-- ---------------------------------------------------------------------------
create table if not exists public.weekly_report_recipients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  added_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists weekly_report_recipients_org_idx
  on public.weekly_report_recipients (organization_id);

-- ---------------------------------------------------------------------------
-- incident_recaps: immutable factual post-incident snapshots for organization
-- members. Root cause is never invented: it is null until an authorized user
-- records one, and corrections are versioned in incident_recap_revisions.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_recaps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  incident_id uuid not null unique references public.incidents (id) on delete cascade,
  snapshot jsonb not null,
  generated_at timestamptz not null default now(),
  root_cause text,
  root_cause_updated_by uuid references public.user_profiles (id),
  root_cause_updated_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references public.user_profiles (id),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incident_recaps_root_cause_len
    check (root_cause is null or char_length(root_cause) <= 2000)
);

create index if not exists incident_recaps_org_idx
  on public.incident_recaps (organization_id, generated_at desc);

create trigger incident_recaps_touch
  before update on public.incident_recaps
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- incident_recap_revisions: append-only corrections. A sent recap is never
-- silently rewritten; every root-cause change is recorded here.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_recap_revisions (
  id uuid primary key default gen_random_uuid(),
  recap_id uuid not null references public.incident_recaps (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  field text not null check (field in ('root_cause')),
  previous_value text,
  new_value text,
  changed_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists incident_recap_revisions_recap_idx
  on public.incident_recap_revisions (recap_id, created_at desc);

-- ---------------------------------------------------------------------------
-- incident_follow_up_actions: lightweight follow-up list. Not a project
-- management system: title, owner, due date, status.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_follow_up_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  incident_id uuid not null references public.incidents (id) on delete cascade,
  title text not null,
  description text,
  owner_user_id uuid references public.user_profiles (id),
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'completed', 'dropped')),
  created_by_user_id uuid references public.user_profiles (id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incident_follow_up_actions_title_len check (char_length(title) between 1 and 200),
  constraint incident_follow_up_actions_desc_len
    check (description is null or char_length(description) <= 2000)
);

create index if not exists incident_follow_up_actions_incident_idx
  on public.incident_follow_up_actions (incident_id, created_at desc);
create index if not exists incident_follow_up_actions_org_open_idx
  on public.incident_follow_up_actions (organization_id)
  where status = 'open';

create trigger incident_follow_up_actions_touch
  before update on public.incident_follow_up_actions
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- billing_cancellation_records: Phase 11 structured feedback columns.
-- Feedback stays optional and never blocks cancellation (Phase 10 owns the
-- billing authority; these columns only enrich the record).
-- ---------------------------------------------------------------------------
alter table public.billing_cancellation_records
  add column if not exists secondary_reason text,
  add column if not exists missing_feature text,
  add column if not exists follow_up_ok boolean;

alter table public.billing_cancellation_records
  drop constraint if exists billing_cancellation_records_secondary_len;
alter table public.billing_cancellation_records
  add constraint billing_cancellation_records_secondary_len
    check (secondary_reason is null or char_length(secondary_reason) <= 60);
alter table public.billing_cancellation_records
  drop constraint if exists billing_cancellation_records_missing_feature_len;
alter table public.billing_cancellation_records
  add constraint billing_cancellation_records_missing_feature_len
    check (missing_feature is null or char_length(missing_feature) <= 500);
