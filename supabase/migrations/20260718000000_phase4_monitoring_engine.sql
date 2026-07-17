-- Phase 4: proprietary monitoring engine data model.
--
-- Clean-room, independently authored. No competitor schema, enum, or naming
-- convention is reused. Tenant records carry organization_id and reference
-- public.organizations(id). RLS is added in a companion migration; every write
-- runs through the service role after an explicit code authorization check,
-- exactly as Phase 3 established.
--
-- Time units: every duration column is named with an explicit unit suffix
-- (_ms, _seconds). Byte counts use bigint with a _bytes suffix. Units are never
-- mixed within a field.
--
-- Forward-only. Do not edit after apply; add a new migration.

-- ---------------------------------------------------------------------------
-- monitors: durable monitor configuration head. Configuration history lives in
-- monitor_versions; the head row carries current runtime state and the pointer
-- to the active version. Stable uuid id is the only identifier; the mutable
-- name is never used as a key.
-- ---------------------------------------------------------------------------
create table if not exists public.monitors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  monitor_type text not null
    check (monitor_type in ('http', 'https', 'api', 'ssl', 'heartbeat')),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'disabled', 'pending_deletion', 'deleted')),
  target_url text,
  normalized_url text,
  http_method text not null default 'GET'
    check (http_method in ('GET', 'HEAD', 'POST')),
  check_interval_seconds integer not null default 300
    check (check_interval_seconds in (60, 300, 600, 900, 1800, 3600)),
  timeout_ms integer not null default 10000
    check (timeout_ms between 1000 and 60000),
  retry_count integer not null default 1
    check (retry_count between 0 and 5),
  retry_delay_ms integer not null default 3000
    check (retry_delay_ms between 0 and 60000),
  follow_redirects boolean not null default true,
  max_redirects integer not null default 5
    check (max_redirects between 0 and 10),
  expected_status_codes integer[] not null default '{200}',
  response_time_threshold_ms integer
    check (response_time_threshold_ms is null or response_time_threshold_ms > 0),
  body_size_limit_bytes bigint not null default 1048576
    check (body_size_limit_bytes between 1024 and 10485760),
  region_policy text not null default 'any'
    check (region_policy in ('any', 'specific')),
  current_version_id uuid,
  next_check_at timestamptz,
  last_check_at timestamptz,
  last_result_status text,
  last_response_time_ms integer,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  consecutive_successes integer not null default 0,
  consecutive_failures integer not null default 0,
  paused_at timestamptz,
  created_by_user_id uuid references public.user_profiles (id),
  updated_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint monitors_name_len check (char_length(name) between 1 and 160),
  constraint monitors_desc_len check (char_length(description) <= 2000),
  constraint monitors_url_len check (char_length(target_url) <= 2048),
  -- Non-heartbeat monitors require a target; heartbeat monitors do not.
  constraint monitors_target_required check (
    monitor_type = 'heartbeat' or target_url is not null
  )
);

create index if not exists monitors_org_idx
  on public.monitors (organization_id) where deleted_at is null;
create index if not exists monitors_org_status_idx
  on public.monitors (organization_id, status) where deleted_at is null;

create trigger monitors_touch
  before update on public.monitors
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- monitor_versions: immutable configuration snapshots. Every execution and
-- assertion references the exact version that produced it. Snapshots contain no
-- plaintext secrets; secrets are referenced from monitor_secrets by id.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_versions (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  version_number integer not null,
  configuration_snapshot jsonb not null,
  change_summary text,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  constraint monitor_versions_number_positive check (version_number >= 1),
  constraint monitor_versions_summary_len check (char_length(change_summary) <= 500),
  unique (monitor_id, version_number)
);

create index if not exists monitor_versions_monitor_idx
  on public.monitor_versions (monitor_id, version_number desc);

-- Point the head at its active version now that the target table exists.
alter table public.monitors
  drop constraint if exists monitors_current_version_fk;
alter table public.monitors
  add constraint monitors_current_version_fk
  foreign key (current_version_id)
  references public.monitor_versions (id)
  on delete set null;

-- ---------------------------------------------------------------------------
-- monitor_assertions: typed, non-programmable assertions bound to a version.
-- No expression language, no regex by default. expected_value is bounded config.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_assertions (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  monitor_version_id uuid not null references public.monitor_versions (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  assertion_type text not null check (assertion_type in (
    'status_code_in', 'response_time_below', 'body_contains', 'body_not_contains',
    'header_equals', 'json_path_exists', 'json_path_not_exists', 'json_path_equals',
    'json_path_not_equals', 'json_number_gt', 'json_number_gte', 'json_number_lt',
    'json_number_lte', 'json_contains_string', 'json_boolean_true',
    'json_boolean_false', 'tls_valid', 'tls_hostname_matches',
    'tls_expires_after_days', 'heartbeat_within_grace'
  )),
  field_path text,
  operator text,
  expected_value text,
  expected_value_type text not null default 'string'
    check (expected_value_type in ('string', 'number', 'boolean', 'duration', 'none')),
  case_sensitive boolean not null default false,
  position integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint monitor_assertions_field_len check (char_length(field_path) <= 512),
  constraint monitor_assertions_value_len check (char_length(expected_value) <= 1024)
);

create index if not exists monitor_assertions_version_idx
  on public.monitor_assertions (monitor_version_id, position);

-- ---------------------------------------------------------------------------
-- monitor_secrets: encrypted request credentials. Envelope-encrypted payloads
-- only; no plaintext anywhere. Never returned in full to clients; masked_label
-- is the only human-readable summary. No RLS read policy is added, so even a
-- direct authenticated PostgREST read returns nothing.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_secrets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  secret_type text not null check (secret_type in (
    'authorization_header', 'api_key', 'bearer_token', 'basic_auth', 'custom_header'
  )),
  header_name text,
  encrypted_payload text not null,
  encryption_key_version integer not null,
  masked_label text not null,
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  rotated_at timestamptz,
  deleted_at timestamptz,
  constraint monitor_secrets_header_len check (char_length(header_name) <= 128),
  constraint monitor_secrets_label_len check (char_length(masked_label) <= 128),
  constraint monitor_secrets_payload_len check (char_length(encrypted_payload) <= 8192)
);

create index if not exists monitor_secrets_monitor_idx
  on public.monitor_secrets (monitor_id) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- check_schedules: durable per-monitor schedule and lease slot. One row per
-- schedulable monitor. The scheduler leases due rows with FOR UPDATE SKIP
-- LOCKED (see docs/engineering/postgres-scheduler.md).
-- ---------------------------------------------------------------------------
create table if not exists public.check_schedules (
  monitor_id uuid primary key references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_version_id uuid not null references public.monitor_versions (id),
  interval_seconds integer not null
    check (interval_seconds in (60, 300, 600, 900, 1800, 3600)),
  priority integer not null default 100,
  next_check_at timestamptz not null,
  schedule_generation bigint not null default 1,
  locked_at timestamptz,
  locked_by_worker_id uuid,
  lease_expires_at timestamptz,
  attempt_count integer not null default 0,
  consecutive_lease_failures integer not null default 0,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Hot path: due, enabled, unlocked schedules ordered by priority then time.
create index if not exists check_schedules_due_idx
  on public.check_schedules (priority, next_check_at)
  where enabled = true and locked_at is null;
-- Reaper path: expired leases to recover.
create index if not exists check_schedules_lease_expiry_idx
  on public.check_schedules (lease_expires_at)
  where locked_at is not null;
create index if not exists check_schedules_org_idx
  on public.check_schedules (organization_id);

create trigger check_schedules_touch
  before update on public.check_schedules
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- monitor_leases: append-only lease-grant ledger. One row per (monitor,
-- version, tick, generation) via a unique idempotency key, so a duplicate
-- worker claiming the same tick is detected and cannot double-finalize.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_leases (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_version_id uuid not null,
  schedule_generation bigint not null,
  scheduled_for timestamptz not null,
  idempotency_key text not null unique,
  worker_id uuid not null,
  region text not null,
  leased_at timestamptz not null default now(),
  lease_expires_at timestamptz not null,
  released_at timestamptz,
  outcome text check (outcome in ('completed', 'expired', 'released', 'failed'))
);

create index if not exists monitor_leases_monitor_idx
  on public.monitor_leases (monitor_id, scheduled_for desc);
create index if not exists monitor_leases_open_idx
  on public.monitor_leases (lease_expires_at) where released_at is null;

-- ---------------------------------------------------------------------------
-- check_executions: immutable operational record of one scheduled execution.
-- The idempotency key makes finalization exactly-once even under duplicate
-- delivery. Repair metadata is the only permitted post-finalization mutation.
-- ---------------------------------------------------------------------------
create table if not exists public.check_executions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  monitor_version_id uuid not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  worker_id uuid,
  region text,
  scheduled_for timestamptz not null,
  leased_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  attempt_count integer not null default 1,
  status text not null default 'error'
    check (status in ('success', 'failure', 'error', 'timed_out', 'blocked', 'canceled')),
  phase text,
  correlation_id uuid,
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists check_executions_monitor_idx
  on public.check_executions (monitor_id, scheduled_for desc);
create index if not exists check_executions_org_idx
  on public.check_executions (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- check_results: normalized outcome and measurements queried for history and
-- future aggregation. One-to-one with check_executions.
-- ---------------------------------------------------------------------------
create table if not exists public.check_results (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null unique references public.check_executions (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  monitor_version_id uuid not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  worker_id uuid,
  region text,
  status text not null
    check (status in ('success', 'failure', 'error', 'timed_out', 'blocked', 'canceled')),
  failure_category text check (failure_category in (
    'dns_failure', 'blocked_destination', 'connection_refused', 'connection_reset',
    'connect_timeout', 'tls_failure', 'tls_expired', 'tls_hostname_mismatch',
    'response_timeout', 'unexpected_status', 'response_too_large', 'invalid_json',
    'assertion_failed', 'redirect_blocked', 'redirect_limit', 'unsupported_scheme',
    'invalid_configuration', 'worker_error', 'heartbeat_missed', 'canceled', 'unknown'
  )),
  http_status integer,
  final_url text,
  redirect_count integer,
  response_bytes bigint,
  dns_ms integer,
  connect_ms integer,
  tls_ms integer,
  ttfb_ms integer,
  total_ms integer,
  tls_summary jsonb,
  diagnostic_snippet text,
  safe_error_message text,
  checked_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint check_results_snippet_len check (char_length(diagnostic_snippet) <= 2048),
  constraint check_results_error_len check (char_length(safe_error_message) <= 512),
  constraint check_results_final_url_len check (char_length(final_url) <= 2048)
);

create index if not exists check_results_monitor_time_idx
  on public.check_results (monitor_id, checked_at desc);
create index if not exists check_results_org_time_idx
  on public.check_results (organization_id, checked_at desc);

-- ---------------------------------------------------------------------------
-- check_assertion_results: per-assertion outcome for a result. Safe summaries
-- only; never full secrets, bodies, or authorization material.
-- ---------------------------------------------------------------------------
create table if not exists public.check_assertion_results (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.check_results (id) on delete cascade,
  execution_id uuid not null references public.check_executions (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  assertion_id uuid references public.monitor_assertions (id) on delete set null,
  assertion_type text not null,
  passed boolean not null,
  expected_summary text,
  actual_summary text,
  failure_reason text,
  evaluation_ms integer,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint check_assertion_results_expected_len check (char_length(expected_summary) <= 512),
  constraint check_assertion_results_actual_len check (char_length(actual_summary) <= 512)
);

create index if not exists check_assertion_results_result_idx
  on public.check_assertion_results (result_id, position);

-- ---------------------------------------------------------------------------
-- monitor_regions: catalog of execution regions. Region identity is stored on
-- every result. Multi-region is architecturally ready; only live regions are
-- ever claimed publicly.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_regions (
  code text primary key,
  display_name text not null,
  status text not null default 'active'
    check (status in ('active', 'draining', 'disabled')),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  constraint monitor_regions_code_len check (char_length(code) between 2 and 40)
);

-- ---------------------------------------------------------------------------
-- monitor_workers: worker registry. Not customer-readable. Worker identity is
-- the stable worker_key from the deployment, mapped to an internal uuid.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_workers (
  id uuid primary key default gen_random_uuid(),
  worker_key text not null unique,
  deployment_id text,
  region text not null references public.monitor_regions (code),
  version text,
  build_commit text,
  contract_version integer not null default 1,
  status text not null default 'starting'
    check (status in ('starting', 'healthy', 'degraded', 'draining', 'offline')),
  started_at timestamptz,
  last_heartbeat_at timestamptz,
  active_lease_count integer not null default 0,
  check_capacity integer,
  recent_success_count integer not null default 0,
  recent_failure_count integer not null default 0,
  avg_execution_ms integer,
  queue_lag_seconds integer,
  shutdown_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists monitor_workers_region_idx
  on public.monitor_workers (region, status);

create trigger monitor_workers_touch
  before update on public.monitor_workers
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- monitor_worker_heartbeats: time-series worker health samples for lag/rate.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_worker_heartbeats (
  id bigint generated always as identity primary key,
  worker_id uuid not null references public.monitor_workers (id) on delete cascade,
  region text,
  status text,
  active_lease_count integer,
  queue_lag_seconds integer,
  avg_execution_ms integer,
  reported_at timestamptz not null default now()
);

create index if not exists monitor_worker_heartbeats_worker_idx
  on public.monitor_worker_heartbeats (worker_id, reported_at desc);

-- ---------------------------------------------------------------------------
-- monitor_security_events: SSRF/abuse/protection events. Org-scoped where a
-- monitor is involved; global events use a null organization_id. No secrets,
-- no full sensitive URLs.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_security_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  monitor_id uuid references public.monitors (id) on delete set null,
  event_type text not null check (event_type in (
    'blocked_private_address', 'blocked_metadata_address', 'unsupported_scheme',
    'blocked_port', 'dns_rebinding_attempt', 'redirect_to_blocked',
    'excessive_redirects', 'oversized_response', 'abusive_test_requests',
    'invalid_heartbeat_token_volume', 'rate_limit_enforced',
    'suspicious_destination', 'embedded_credentials'
  )),
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical')),
  safe_summary text not null,
  metadata jsonb,
  worker_id uuid,
  correlation_id uuid,
  created_at timestamptz not null default now(),
  constraint monitor_security_events_summary_len check (char_length(safe_summary) <= 512)
);

create index if not exists monitor_security_events_org_idx
  on public.monitor_security_events (organization_id, created_at desc);
create index if not exists monitor_security_events_type_idx
  on public.monitor_security_events (event_type, created_at desc);

-- ---------------------------------------------------------------------------
-- heartbeat_tokens: hashed cron/heartbeat tokens. Only the hash is stored; the
-- raw token is shown once at creation. No RLS read policy: even the owner org
-- cannot read a token after creation.
-- ---------------------------------------------------------------------------
create table if not exists public.heartbeat_tokens (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  token_hash text not null unique,
  masked_label text not null,
  expected_interval_seconds integer not null
    check (expected_interval_seconds between 60 and 2592000),
  grace_period_seconds integer not null default 60
    check (grace_period_seconds between 0 and 86400),
  last_heartbeat_at timestamptz,
  next_expected_at timestamptz,
  state text not null default 'pending'
    check (state in ('pending', 'healthy', 'missed', 'paused', 'revoked')),
  created_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  rotated_at timestamptz,
  revoked_at timestamptz,
  constraint heartbeat_tokens_label_len check (char_length(masked_label) <= 128)
);

create index if not exists heartbeat_tokens_monitor_idx
  on public.heartbeat_tokens (monitor_id) where revoked_at is null;

-- ---------------------------------------------------------------------------
-- heartbeat_events: bounded ingestion records. Optional external_event_id gives
-- idempotency for retried pings via a partial unique index.
-- ---------------------------------------------------------------------------
create table if not exists public.heartbeat_events (
  id bigint generated always as identity primary key,
  heartbeat_token_id uuid not null references public.heartbeat_tokens (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_source text check (event_source in ('get', 'post')),
  external_event_id text,
  safe_metadata jsonb,
  received_at timestamptz not null default now(),
  constraint heartbeat_events_external_id_len check (char_length(external_event_id) <= 200)
);

create unique index if not exists heartbeat_events_dedupe_idx
  on public.heartbeat_events (heartbeat_token_id, external_event_id)
  where external_event_id is not null;
create index if not exists heartbeat_events_token_idx
  on public.heartbeat_events (heartbeat_token_id, received_at desc);

-- ---------------------------------------------------------------------------
-- Seed the initial single production region. Multi-region stays architecturally
-- ready but is not claimed until a second live region exists.
-- ---------------------------------------------------------------------------
insert into public.monitor_regions (code, display_name, status, is_public)
values ('us-east', 'US East', 'active', true)
on conflict (code) do nothing;
