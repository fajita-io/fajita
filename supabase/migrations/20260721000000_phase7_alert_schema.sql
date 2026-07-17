-- Phase 7: alert channels, routing, and delivery data model.
--
-- This migration adds the durable state behind Fajita's team-alerting system.
-- It sits downstream of the Phase 6 incident engine: the incident engine writes
-- immutable events to public.incident_delivery_outbox inside the same
-- transaction as a state change; Phase 7 consumes that outbox, evaluates
-- routing, and produces per-channel delivery intents that a decoupled worker
-- sends. External provider failure never blocks incident evaluation.
--
-- Design rules honored here:
--   * Structured, bounded columns for organization, provider, status, event,
--     severity, retry, scheduling, health, and dedup. Bounded JSON only for
--     safe provider metadata and versioned payload snapshots.
--   * No plaintext provider credentials anywhere. Secrets live encrypted in
--     alert_channel_secrets using the Phase 4 AES-256-GCM envelope format.
--   * Channel lifecycle status is separate from individual delivery status.
--   * Every tenant row carries organization_id for strict isolation.
--
-- Forward-only migration. Do not edit after apply; add a new migration instead.
-- RLS lives in 20260721000200_phase7_alert_rls.sql. Engine functions live in
-- 20260721000100_phase7_alert_engine.sql.

-- ---------------------------------------------------------------------------
-- alert_channels: one row per destination a team configures.
-- Health summary columns live inline (last_success_at, consecutive_failures,
-- health_status) so the integrations overview never scans the attempt log.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  provider text not null
    check (provider in ('email', 'slack', 'discord', 'webhook')),
  description text,
  -- Channel lifecycle. Never mixed with per-delivery status.
  status text not null default 'draft'
    check (status in (
      'draft', 'testing', 'active', 'paused', 'degraded',
      'disabled', 'pending_deletion', 'deleted'
    )),
  default_for_organization boolean not null default false,
  -- Verification is a prerequisite for activation. A channel must pass a test.
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'verifying', 'verified', 'failed')),
  verified_at timestamptz,
  -- Health is derived from recent attempts by the delivery engine.
  health_status text not null default 'unverified'
    check (health_status in (
      'healthy', 'degraded', 'failing', 'paused', 'unverified', 'disabled'
    )),
  last_tested_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  consecutive_failures integer not null default 0,
  -- Bounded, non-secret provider metadata for display only (e.g. masked
  -- workspace/channel summary, discord server hint, webhook host). Never holds
  -- tokens, full webhook URLs, or recipient addresses.
  provider_metadata jsonb not null default '{}'::jsonb,
  -- The current live version of this channel's configuration. Every delivery
  -- intent pins the exact version it used.
  current_version integer not null default 1,
  created_by_user_id uuid references public.user_profiles (id),
  updated_by_user_id uuid references public.user_profiles (id),
  paused_at timestamptz,
  paused_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint alert_channels_name_len check (char_length(name) between 1 and 120),
  constraint alert_channels_desc_len check (description is null or char_length(description) <= 500),
  constraint alert_channels_meta_len check (char_length(provider_metadata::text) <= 4096)
);

create index if not exists alert_channels_org_status_idx
  on public.alert_channels (organization_id, status)
  where deleted_at is null;
create unique index if not exists alert_channels_org_default_idx
  on public.alert_channels (organization_id)
  where default_for_organization and deleted_at is null;

create trigger alert_channels_touch
  before update on public.alert_channels
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- alert_channel_versions: immutable configuration snapshots.
-- A material change (destination, credential, template, headers, recipients)
-- creates a new version. Snapshots never contain plaintext secrets; secrets
-- are referenced from alert_channel_secrets by id.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_channel_versions (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.alert_channels (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  version integer not null,
  -- Safe, bounded configuration snapshot. For webhooks: destination host hint,
  -- signing enabled, header names (no secret values), timeout, schema version.
  -- For email: recipient ids/labels. For slack/discord: masked summary.
  configuration jsonb not null default '{}'::jsonb,
  change_reason text,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  unique (channel_id, version),
  constraint alert_channel_versions_config_len check (char_length(configuration::text) <= 8192)
);

create index if not exists alert_channel_versions_channel_idx
  on public.alert_channel_versions (channel_id, version desc);

-- ---------------------------------------------------------------------------
-- alert_channel_secrets: encrypted provider credentials, one active per role.
-- Mirrors public.monitor_secrets: AES-256-GCM envelope + key version + masked
-- label. Never returned to clients after save. RLS forbids customer reads.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_channel_secrets (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.alert_channels (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  secret_type text not null check (secret_type in (
    'slack_webhook_url', 'slack_bot_token', 'discord_webhook_url',
    'webhook_url', 'webhook_header_value', 'webhook_signing_secret'
  )),
  -- For webhook_header_value: which header the secret value belongs to.
  header_name text,
  encrypted_payload text not null,
  encryption_key_version integer not null,
  masked_label text not null,
  status text not null default 'active'
    check (status in ('active', 'retiring', 'revoked')),
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  rotated_at timestamptz,
  revoked_at timestamptz,
  constraint alert_channel_secrets_header_len check (header_name is null or char_length(header_name) <= 128),
  constraint alert_channel_secrets_label_len check (char_length(masked_label) <= 128),
  constraint alert_channel_secrets_payload_len check (char_length(encrypted_payload) <= 8192)
);

create index if not exists alert_channel_secrets_channel_idx
  on public.alert_channel_secrets (channel_id, status)
  where status <> 'revoked';

-- ---------------------------------------------------------------------------
-- alert_webhook_signing_keys: HMAC-SHA-256 signing keys for generic webhooks.
-- Displayed once at creation, masked afterward. Rotation keeps a previous key
-- valid for a bounded overlap so receivers can verify during cutover.
-- The signing secret itself lives encrypted in alert_channel_secrets; this
-- table carries the public key id, status, and overlap timing only.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_webhook_signing_keys (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.alert_channels (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  key_id text not null,
  secret_id uuid references public.alert_channel_secrets (id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'retiring', 'revoked')),
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  retiring_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  unique (channel_id, key_id),
  constraint alert_webhook_signing_keys_kid_len check (char_length(key_id) between 4 and 64)
);

create index if not exists alert_webhook_signing_keys_channel_idx
  on public.alert_webhook_signing_keys (channel_id, status);

-- ---------------------------------------------------------------------------
-- alert_email_recipients: recipients for email channels.
-- Email addresses are PII, not secrets; stored structured with verification.
-- Bounded per channel by the app to prevent mailing-list abuse.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_email_recipients (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.alert_channels (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  label text,
  -- Members verified through the org, or external addresses confirmed by the
  -- owner / a verification click, gate delivery.
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'bounced', 'complained', 'removed')),
  is_organization_member boolean not null default false,
  verification_token_hash text,
  verified_at timestamptz,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  removed_at timestamptz,
  constraint alert_email_recipients_email_len check (char_length(email) between 3 and 254),
  constraint alert_email_recipients_label_len check (label is null or char_length(label) <= 80)
);

create unique index if not exists alert_email_recipients_channel_email_idx
  on public.alert_email_recipients (channel_id, lower(email))
  where removed_at is null;

-- ---------------------------------------------------------------------------
-- alert_email_suppressions: org-scoped bounce/complaint suppression list.
-- Populated from verified provider callbacks. Delivery skips suppressed
-- addresses until an operator re-adds a fresh, verified address.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_email_suppressions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  reason text not null
    check (reason in ('bounce', 'complaint', 'manual', 'provider')),
  provider_message_id text,
  created_at timestamptz not null default now(),
  constraint alert_email_suppressions_email_len check (char_length(email) between 3 and 254)
);

create unique index if not exists alert_email_suppressions_org_email_idx
  on public.alert_email_suppressions (organization_id, lower(email));

-- ---------------------------------------------------------------------------
-- alert_routing_rules: typed routing. No scripting language, no node canvas.
-- A rule matches on event types, severities, and monitor scope (all monitors,
-- specific monitors, groups, or tags) and sends to selected channels.
-- Precedence: monitor > group > tag > organization default (lower rank wins).
-- ---------------------------------------------------------------------------
create table if not exists public.alert_routing_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  status text not null default 'active'
    check (status in ('active', 'disabled')),
  -- Scope precedence tier. 'organization' is the broad default; 'monitor' is
  -- the most specific. Lower precedence_rank is more specific and wins.
  scope_kind text not null default 'organization'
    check (scope_kind in ('organization', 'tag', 'group', 'monitor')),
  precedence_rank integer not null default 100,
  -- Recovery behavior for incidents matched by this rule.
  recovery_behavior text not null default 'same_channels'
    check (recovery_behavior in (
      'same_channels', 'never', 'only_if_opened_delivered', 'selected_channels'
    )),
  -- Deduplicate deliveries for the same incident state generation.
  deduplicate boolean not null default true,
  -- Quiet-hours behavior when a matching quiet window is active.
  quiet_behavior text not null default 'suppress'
    check (quiet_behavior in ('suppress', 'delay', 'ignore_quiet')),
  is_default boolean not null default false,
  created_by_user_id uuid references public.user_profiles (id),
  updated_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_routing_rules_name_len check (char_length(name) between 1 and 120),
  constraint alert_routing_rules_rank check (precedence_rank between 1 and 1000)
);

create index if not exists alert_routing_rules_org_idx
  on public.alert_routing_rules (organization_id, status, precedence_rank);

create trigger alert_routing_rules_touch
  before update on public.alert_routing_rules
  for each row execute function app.touch_updated_at();

-- Rule -> channel destinations. recovery_only marks channels used only for
-- recovery when recovery_behavior = 'selected_channels'.
create table if not exists public.alert_rule_channels (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.alert_routing_rules (id) on delete cascade,
  channel_id uuid not null references public.alert_channels (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role text not null default 'primary'
    check (role in ('primary', 'recovery_only', 'fallback')),
  -- fallback ordering when role = 'fallback'
  fallback_order integer,
  created_at timestamptz not null default now(),
  unique (rule_id, channel_id, role)
);

create index if not exists alert_rule_channels_rule_idx
  on public.alert_rule_channels (rule_id);
create index if not exists alert_rule_channels_channel_idx
  on public.alert_rule_channels (channel_id);

-- Rule scope selectors. Empty monitor/group/tag sets on an 'organization' rule
-- mean "all monitors". Specific rows narrow the scope.
create table if not exists public.alert_rule_monitors (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.alert_routing_rules (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (rule_id, monitor_id)
);
create index if not exists alert_rule_monitors_monitor_idx
  on public.alert_rule_monitors (monitor_id);

create table if not exists public.alert_rule_monitor_groups (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.alert_routing_rules (id) on delete cascade,
  monitor_group_id uuid not null references public.monitor_groups (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (rule_id, monitor_group_id)
);

create table if not exists public.alert_rule_tags (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.alert_routing_rules (id) on delete cascade,
  monitor_tag_id uuid not null references public.monitor_tags (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (rule_id, monitor_tag_id)
);

-- Event-type selectors. event_type is validated in the app against the central
-- registry; length-bounded here to stay open to forward growth.
create table if not exists public.alert_rule_event_types (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.alert_routing_rules (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now(),
  unique (rule_id, event_type),
  constraint alert_rule_event_types_len check (char_length(event_type) between 3 and 64)
);

create table if not exists public.alert_rule_severities (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.alert_routing_rules (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  severity text not null
    check (severity in ('minor', 'major', 'critical', 'maintenance', 'informational')),
  created_at timestamptz not null default now(),
  unique (rule_id, severity)
);

-- ---------------------------------------------------------------------------
-- alert_quiet_hours: organization- or rule-scoped quiet windows.
-- Critical incidents are never delayed by default; exceptions are explicit.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_quiet_hours (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Null rule_id = organization-wide quiet hours.
  rule_id uuid references public.alert_routing_rules (id) on delete cascade,
  name text not null default 'Quiet hours',
  timezone text not null default 'UTC',
  -- Minutes from local midnight, 0-1439. Windows may cross midnight.
  start_minute integer not null check (start_minute between 0 and 1439),
  end_minute integer not null check (end_minute between 0 and 1439),
  -- Days of week the window applies to (0=Sunday..6=Saturday).
  days smallint[] not null default '{0,1,2,3,4,5,6}',
  -- Severities always allowed through, even during quiet hours.
  severity_exceptions text[] not null default '{critical}',
  -- Event types always allowed through (e.g. recovery, maintenance).
  event_type_exceptions text[] not null default '{}',
  status text not null default 'active'
    check (status in ('active', 'disabled')),
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_quiet_hours_name_len check (char_length(name) between 1 and 80)
);

create index if not exists alert_quiet_hours_org_idx
  on public.alert_quiet_hours (organization_id, status);

create trigger alert_quiet_hours_touch
  before update on public.alert_quiet_hours
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- alert_delivery_deduplication: deterministic keys prevent duplicate sends.
-- One row per (dedup_key). Insert-on-conflict guarantees a single intent per
-- logical event/channel/generation even under duplicate outbox processing.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_delivery_deduplication (
  dedup_key text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  intent_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists alert_delivery_dedup_org_idx
  on public.alert_delivery_deduplication (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- alert_delivery_intents: one per (event, channel) that should be sent.
-- The delivery worker leases pending/scheduled intents with SKIP LOCKED.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_delivery_intents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  outbox_id uuid references public.incident_delivery_outbox (id) on delete set null,
  incident_id uuid references public.incidents (id) on delete set null,
  monitor_id uuid references public.monitors (id) on delete set null,
  channel_id uuid not null references public.alert_channels (id) on delete cascade,
  channel_version integer not null,
  rule_id uuid references public.alert_routing_rules (id) on delete set null,
  provider text not null
    check (provider in ('email', 'slack', 'discord', 'webhook')),
  event_type text not null,
  severity text,
  -- Whether this intent is the recovery counterpart of an opening delivery.
  kind text not null default 'event'
    check (kind in ('event', 'recovery', 'test', 'fallback', 'manual_retry')),
  payload_version integer not null default 1,
  -- Safe, structured event data the worker renders from. No secrets, no bodies.
  event_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in (
      'pending', 'scheduled', 'processing', 'delivered', 'failed',
      'dead_letter', 'suppressed', 'canceled'
    )),
  dedup_key text,
  scheduled_at timestamptz not null default now(),
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  -- Leasing fields, mirroring the Phase 4 check-schedule leasing pattern.
  locked_at timestamptz,
  locked_by_worker text,
  lease_expires_at timestamptz,
  next_attempt_at timestamptz,
  last_error_category text,
  suppression_reason text,
  -- Concise, human-readable explanation of why this channel was selected.
  routing_explanation text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_delivery_intents_payload_len check (char_length(event_payload::text) <= 8192)
);

create index if not exists alert_delivery_intents_due_idx
  on public.alert_delivery_intents (scheduled_at)
  where status in ('pending', 'scheduled') and locked_at is null;
create index if not exists alert_delivery_intents_lease_idx
  on public.alert_delivery_intents (lease_expires_at)
  where locked_at is not null;
create index if not exists alert_delivery_intents_org_idx
  on public.alert_delivery_intents (organization_id, created_at desc);
create index if not exists alert_delivery_intents_channel_idx
  on public.alert_delivery_intents (channel_id, created_at desc);
create index if not exists alert_delivery_intents_incident_idx
  on public.alert_delivery_intents (incident_id, created_at desc);

create trigger alert_delivery_intents_touch
  before update on public.alert_delivery_intents
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- alert_delivery_attempts: append-only record of each send attempt.
-- Never stores raw response bodies, secrets, or provider headers.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid not null references public.alert_delivery_intents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  attempt_number integer not null,
  result text not null
    check (result in ('delivered', 'retryable_failure', 'permanent_failure', 'error')),
  error_category text,
  -- Bounded, safe diagnostic. No response bodies. e.g. HTTP status + short note.
  safe_summary text,
  http_status integer,
  provider_request_id text,
  duration_ms integer,
  is_manual boolean not null default false,
  next_retry_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint alert_delivery_attempts_summary_len check (safe_summary is null or char_length(safe_summary) <= 500)
);

create index if not exists alert_delivery_attempts_intent_idx
  on public.alert_delivery_attempts (intent_id, attempt_number);

-- ---------------------------------------------------------------------------
-- alert_delivery_dead_letters: exhausted or permanently failed intents.
-- Retained for inspection and manual retry. Never silently deleted.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_delivery_dead_letters (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid not null references public.alert_delivery_intents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  channel_id uuid references public.alert_channels (id) on delete set null,
  rule_id uuid references public.alert_routing_rules (id) on delete set null,
  event_type text not null,
  error_category text,
  safe_summary text,
  first_attempt_at timestamptz,
  final_attempt_at timestamptz,
  suggested_action text,
  status text not null default 'open'
    check (status in ('open', 'retried', 'dismissed')),
  resolved_by_user_id uuid references public.user_profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (intent_id)
);

create index if not exists alert_delivery_dead_letters_org_idx
  on public.alert_delivery_dead_letters (organization_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- alert_delivery_suppressions: why an eligible event was not delivered.
-- Never discard a routing decision silently; record the reason.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_delivery_suppressions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  outbox_id uuid references public.incident_delivery_outbox (id) on delete set null,
  incident_id uuid references public.incidents (id) on delete set null,
  channel_id uuid references public.alert_channels (id) on delete set null,
  rule_id uuid references public.alert_routing_rules (id) on delete set null,
  event_type text not null,
  reason text not null,
  explanation text,
  created_at timestamptz not null default now(),
  constraint alert_delivery_suppressions_expl_len check (explanation is null or char_length(explanation) <= 500)
);

create index if not exists alert_delivery_suppressions_org_idx
  on public.alert_delivery_suppressions (organization_id, created_at desc);
create index if not exists alert_delivery_suppressions_incident_idx
  on public.alert_delivery_suppressions (incident_id, created_at desc);

-- ---------------------------------------------------------------------------
-- alert_test_deliveries: dedicated test events, kept separate from real intents
-- so a test can never mutate incident state or alert policy.
-- ---------------------------------------------------------------------------
create table if not exists public.alert_test_deliveries (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.alert_channels (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  channel_version integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'delivered', 'failed')),
  result text,
  error_category text,
  safe_summary text,
  http_status integer,
  duration_ms integer,
  requested_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint alert_test_deliveries_summary_len check (safe_summary is null or char_length(safe_summary) <= 500)
);

create index if not exists alert_test_deliveries_channel_idx
  on public.alert_test_deliveries (channel_id, created_at desc);
