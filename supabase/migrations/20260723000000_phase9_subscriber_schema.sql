-- Phase 9: status-page subscriber system data model.
--
-- Builds on the Phase 8 subscriber FOUNDATION (status_page_subscribers,
-- status_page_subscriber_preferences). Phase 9 adds the consent, double
-- opt-in, preference, event fan-out, and delivery machinery that turns a
-- published public status-page event into a consent-based operational email.
--
-- Hard boundaries preserved from earlier phases:
--   * All writes go through the service role after an explicit TypeScript
--     permission check. No authenticated write policy exists on any table.
--   * Emails are envelope-encrypted (reusing the platform keyring). Duplicate
--     detection uses a deterministic SHA-256 hash, never plaintext.
--   * Confirmation and preference tokens are stored hashed only.
--   * Anonymous visitors never read subscriber tables; the public form and
--     preference center write/read through controlled server endpoints.
--   * Subscriber email is operational, never marketing. No open tracking.
--
-- Forward-only migration. RLS lives in 20260723000200_phase9_subscriber_rls.sql
-- and the atomic delivery engine in 20260723000100_phase9_subscriber_engine.sql.

-- ===========================================================================
-- 1. Extend status_page_subscribers with the full Phase 9 lifecycle.
-- ===========================================================================
-- Widen the status set. Phase 8 allowed pending/confirmed/unsubscribed/
-- suppressed; Phase 9 adds bounced, complained, and the deletion lifecycle.
-- 'pending' continues to mean "pending confirmation" (double opt-in).
alter table public.status_page_subscribers
  drop constraint if exists status_page_subscribers_status_check;
alter table public.status_page_subscribers
  add constraint status_page_subscribers_status_check
  check (status in (
    'pending', 'confirmed', 'unsubscribed',
    'bounced', 'complained', 'suppressed',
    'pending_deletion', 'deleted'
  ));

alter table public.status_page_subscribers
  add column if not exists consent_text_version text,
  add column if not exists consent_ip_hash text,
  add column if not exists consent_user_agent_summary text,
  add column if not exists confirmation_expires_at timestamptz,
  add column if not exists confirmation_sent_at timestamptz,
  add column if not exists confirmation_resend_count integer not null default 0,
  add column if not exists last_confirmation_resend_at timestamptz,
  add column if not exists bounced_at timestamptz,
  add column if not exists complained_at timestamptz,
  add column if not exists suppression_reason text,
  add column if not exists last_delivery_at timestamptz,
  add column if not exists encryption_key_version integer,
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists source text not null default 'public_form',
  add column if not exists soft_bounce_count integer not null default 0;

-- Fast lookups for confirmed fan-out by page and for deletion sweeps.
create index if not exists status_page_subscribers_confirmed_idx
  on public.status_page_subscribers (status_page_id)
  where status = 'confirmed' and deleted_at is null;
create index if not exists status_page_subscribers_deletion_idx
  on public.status_page_subscribers (status)
  where status = 'pending_deletion';

-- ===========================================================================
-- 2. Per-subscriber event preferences (one row per subscriber). Structured
--    booleans, not an opaque JSON blob (per Phase 9 preference model).
-- ===========================================================================
create table if not exists public.status_page_subscriber_event_prefs (
  subscriber_id uuid primary key references public.status_page_subscribers (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- true = every visible component; false = only the components joined below.
  all_components boolean not null default true,
  incident_opened boolean not null default true,
  incident_updates boolean not null default true,
  incident_resolved boolean not null default true,
  incident_reopened boolean not null default true,
  maintenance_scheduled boolean not null default true,
  maintenance_started boolean not null default true,
  maintenance_updates boolean not null default true,
  maintenance_completed boolean not null default true,
  maintenance_canceled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_event_prefs_page_idx
  on public.status_page_subscriber_event_prefs (status_page_id);

create trigger status_page_subscriber_event_prefs_touch
  before update on public.status_page_subscriber_event_prefs
  for each row execute function app.touch_updated_at();

-- ===========================================================================
-- 3. Component selection relationships (only meaningful when all_components=false).
-- ===========================================================================
create table if not exists public.status_page_subscriber_components (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.status_page_subscribers (id) on delete cascade,
  status_page_component_id uuid not null references public.status_page_components (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (subscriber_id, status_page_component_id)
);

create index if not exists status_page_subscriber_components_subscriber_idx
  on public.status_page_subscriber_components (subscriber_id);
create index if not exists status_page_subscriber_components_component_idx
  on public.status_page_subscriber_components (status_page_component_id);

-- ===========================================================================
-- 4. Preference-access tokens: passwordless, revocable, hashed, single scope.
-- ===========================================================================
create table if not exists public.status_page_subscriber_preference_tokens (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.status_page_subscribers (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  token_hash text not null,
  purpose text not null default 'preference'
    check (purpose in ('preference', 'unsubscribe')),
  expires_at timestamptz,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (token_hash)
);

create index if not exists status_page_subscriber_preference_tokens_sub_idx
  on public.status_page_subscriber_preference_tokens (subscriber_id, purpose)
  where revoked_at is null;

-- ===========================================================================
-- 5. Consent records: immutable evidence of each consent event.
-- ===========================================================================
create table if not exists public.status_page_subscriber_consent_records (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.status_page_subscribers (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event text not null
    check (event in ('subscribe_requested', 'confirmed', 'imported', 'resubscribe_requested', 'preferences_changed')),
  consent_text_version text,
  consent_source text,
  policy_version text,
  selected_scope text,          -- 'all_components' | 'selected_components'
  ip_hash text,
  user_agent_summary text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_consent_records_sub_idx
  on public.status_page_subscriber_consent_records (subscriber_id, occurred_at desc);

-- ===========================================================================
-- 6. Subscriber events: the fan-out source. Created from a PUBLISHED public
--    status-page event only. Holds an allowlisted public projection, never
--    internal notes or private evidence.
-- ===========================================================================
create table if not exists public.status_page_subscriber_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  event_type text not null check (event_type in (
    'incident_opened', 'incident_update', 'incident_resolved', 'incident_reopened',
    'maintenance_scheduled', 'maintenance_started', 'maintenance_updated',
    'maintenance_completed', 'maintenance_canceled', 'manual_notice'
  )),
  incident_id uuid references public.incidents (id) on delete set null,
  maintenance_window_id uuid references public.maintenance_windows (id) on delete set null,
  manual_message_id uuid references public.status_page_manual_messages (id) on delete set null,
  -- Monotonic revision of the underlying public content; a corrected update
  -- that is intentionally republished increments this and re-fans-out.
  content_revision integer not null default 1,
  -- Allowlisted public payload the templates render (title, status, affected
  -- component ids/names, timestamps, public summary, links). No secrets.
  public_payload jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  page_wide boolean not null default false,
  -- Idempotency across duplicate emission (same logical event + revision).
  idempotency_key text not null,
  fanout_status text not null default 'pending'
    check (fanout_status in ('pending', 'processing', 'completed', 'canceled', 'error')),
  eligible_count integer,
  intent_count integer not null default 0,
  occurred_at timestamptz not null default now(),
  fanned_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (idempotency_key)
);

create index if not exists status_page_subscriber_events_fanout_idx
  on public.status_page_subscriber_events (fanout_status, occurred_at)
  where fanout_status in ('pending', 'processing');
create index if not exists status_page_subscriber_events_page_idx
  on public.status_page_subscriber_events (status_page_id, occurred_at desc);

create trigger status_page_subscriber_events_touch
  before update on public.status_page_subscriber_events
  for each row execute function app.touch_updated_at();

-- ===========================================================================
-- 7. Delivery deduplication: DB-level guarantee of one intent per logical
--    (event, revision, subscriber). Retries and duplicate callbacks are safe.
-- ===========================================================================
create table if not exists public.status_page_subscriber_delivery_deduplication (
  dedup_key text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  intent_id uuid,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- 8. Delivery intents: one planned email per eligible subscriber per event.
-- ===========================================================================
create table if not exists public.status_page_subscriber_delivery_intents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  event_id uuid references public.status_page_subscriber_events (id) on delete set null,
  subscriber_id uuid not null references public.status_page_subscribers (id) on delete cascade,
  event_type text not null,
  message_kind text not null,      -- template key (see src/lib/subscribers/templates)
  content_revision integer not null default 1,
  -- Snapshot of the public payload at intent creation so a later content edit
  -- or subscriber preference change cannot mutate an already-planned message.
  render_payload jsonb not null default '{}'::jsonb,
  -- Why this subscriber qualified (component + event preference explanation).
  match_explanation text,
  status text not null default 'pending'
    check (status in ('scheduled', 'pending', 'processing', 'delivered', 'dead_letter', 'canceled')),
  dedup_key text,
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  scheduled_at timestamptz not null default now(),
  next_attempt_at timestamptz,
  last_error_category text,
  provider_message_id text,
  is_manual boolean not null default false,
  locked_at timestamptz,
  locked_by_worker text,
  lease_expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_intents_due_idx
  on public.status_page_subscriber_delivery_intents (scheduled_at)
  where status in ('pending', 'scheduled') and locked_at is null;
create index if not exists status_page_subscriber_intents_event_idx
  on public.status_page_subscriber_delivery_intents (event_id);
create index if not exists status_page_subscriber_intents_sub_idx
  on public.status_page_subscriber_delivery_intents (subscriber_id, created_at desc);
create index if not exists status_page_subscriber_intents_page_idx
  on public.status_page_subscriber_delivery_intents (status_page_id, created_at desc);
create index if not exists status_page_subscriber_intents_provider_msg_idx
  on public.status_page_subscriber_delivery_intents (provider_message_id)
  where provider_message_id is not null;

create trigger status_page_subscriber_intents_touch
  before update on public.status_page_subscriber_delivery_intents
  for each row execute function app.touch_updated_at();

-- ===========================================================================
-- 9. Delivery attempts: append-only per-attempt record. No provider payloads.
-- ===========================================================================
create table if not exists public.status_page_subscriber_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid not null references public.status_page_subscriber_delivery_intents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  attempt_number integer not null,
  result text not null
    check (result in ('delivered', 'retryable_failure', 'permanent_failure', 'error')),
  error_category text,
  safe_summary text,
  http_status integer,
  provider_request_id text,
  duration_ms integer,
  is_manual boolean not null default false,
  next_retry_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists status_page_subscriber_attempts_intent_idx
  on public.status_page_subscriber_delivery_attempts (intent_id, attempt_number);

-- ===========================================================================
-- 10. Dead letters: exhausted or permanently failed intents.
-- ===========================================================================
create table if not exists public.status_page_subscriber_delivery_dead_letters (
  intent_id uuid primary key references public.status_page_subscriber_delivery_intents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  event_id uuid references public.status_page_subscriber_events (id) on delete set null,
  event_type text,
  error_category text,
  safe_summary text,
  provider_message_id text,
  first_attempt_at timestamptz,
  final_attempt_at timestamptz,
  suggested_action text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_dead_letters_page_idx
  on public.status_page_subscriber_delivery_dead_letters (status_page_id, created_at desc)
  where resolved_at is null;

-- ===========================================================================
-- 11. Suppressions at the event level: why an eligible-looking subscriber did
--     NOT receive a given event (unsubscribed before send, complaint, etc.).
-- ===========================================================================
create table if not exists public.status_page_subscriber_delivery_suppressions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  event_id uuid references public.status_page_subscriber_events (id) on delete set null,
  subscriber_id uuid references public.status_page_subscribers (id) on delete cascade,
  event_type text,
  reason text not null,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_suppressions_event_idx
  on public.status_page_subscriber_delivery_suppressions (event_id);

-- ===========================================================================
-- 12. Subscriber-status suppression list: durable "never email again" record,
--     keyed by email hash so it survives resubscribe and import attempts.
-- ===========================================================================
create table if not exists public.status_page_subscriber_suppressions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  email_hash text not null,
  subscriber_id uuid references public.status_page_subscribers (id) on delete set null,
  reason text not null check (reason in (
    'hard_bounce', 'repeated_soft_bounce', 'complaint', 'administrative',
    'abuse', 'invalid_address', 'provider_suppression', 'legal_request'
  )),
  -- Complaint/hard-bounce suppressions are not casually reversible.
  reversible boolean not null default false,
  created_by_user_id uuid references public.user_profiles (id),
  removed_at timestamptz,
  removed_by_user_id uuid references public.user_profiles (id),
  created_at timestamptz not null default now(),
  unique (status_page_id, email_hash)
);

create index if not exists status_page_subscriber_suppressions_hash_idx
  on public.status_page_subscriber_suppressions (status_page_id, email_hash)
  where removed_at is null;

-- ===========================================================================
-- 13. Verified provider callbacks (bounce/complaint/delivery). Safe summary
--     only; full provider payloads are never retained.
-- ===========================================================================
create table if not exists public.status_page_subscriber_provider_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  status_page_id uuid references public.status_pages (id) on delete cascade,
  intent_id uuid references public.status_page_subscriber_delivery_intents (id) on delete set null,
  subscriber_id uuid references public.status_page_subscribers (id) on delete set null,
  provider text not null default 'resend',
  provider_message_id text,
  event_type text not null,       -- delivered | bounced | complained | ...
  bounce_class text,              -- hard | soft | null
  safe_summary text,
  -- Provider event id for idempotent callback processing.
  provider_event_id text,
  occurred_at timestamptz,
  received_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index if not exists status_page_subscriber_provider_events_msg_idx
  on public.status_page_subscriber_provider_events (provider_message_id);
create index if not exists status_page_subscriber_provider_events_page_idx
  on public.status_page_subscriber_provider_events (status_page_id, received_at desc);

-- ===========================================================================
-- 14. Import / export jobs. Files live in tenant-scoped, expiring storage;
--     these rows track the job, not the file bytes.
-- ===========================================================================
create table if not exists public.status_page_subscriber_import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  requested_by_user_id uuid references public.user_profiles (id),
  storage_path text,
  status text not null default 'pending'
    check (status in ('pending', 'validating', 'processing', 'completed', 'failed', 'canceled')),
  consent_attested boolean not null default false,
  consent_source text,
  -- Imported subscribers default to pending confirmation unless proof recorded.
  activation_mode text not null default 'require_confirmation'
    check (activation_mode in ('require_confirmation', 'confirmed_with_proof')),
  total_rows integer,
  valid_rows integer,
  pending_rows integer,
  confirmed_rows integer,
  duplicate_rows integer,
  invalid_rows integer,
  suppressed_rows integer,
  failed_rows integer,
  result_report_path text,
  error_summary text,
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_import_jobs_page_idx
  on public.status_page_subscriber_import_jobs (status_page_id, created_at desc);

create trigger status_page_subscriber_import_jobs_touch
  before update on public.status_page_subscriber_import_jobs
  for each row execute function app.touch_updated_at();

create table if not exists public.status_page_subscriber_export_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status_page_id uuid not null references public.status_pages (id) on delete cascade,
  requested_by_user_id uuid references public.user_profiles (id),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'expired')),
  filters jsonb not null default '{}'::jsonb,
  row_count integer,
  storage_path text,
  download_expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists status_page_subscriber_export_jobs_page_idx
  on public.status_page_subscriber_export_jobs (status_page_id, created_at desc);

create trigger status_page_subscriber_export_jobs_touch
  before update on public.status_page_subscriber_export_jobs
  for each row execute function app.touch_updated_at();

-- ===========================================================================
-- 15. Per-status-page subscriber settings (explicit columns, bounded).
-- ===========================================================================
alter table public.status_pages
  add column if not exists subscriptions_enabled boolean not null default false,
  add column if not exists subscriber_incident_opened_enabled boolean not null default true,
  add column if not exists subscriber_incident_updates_enabled boolean not null default true,
  add column if not exists subscriber_incident_resolved_enabled boolean not null default true,
  add column if not exists subscriber_incident_reopened_enabled boolean not null default true,
  add column if not exists subscriber_maintenance_scheduled_enabled boolean not null default true,
  add column if not exists subscriber_maintenance_started_enabled boolean not null default false,
  add column if not exists subscriber_maintenance_updated_enabled boolean not null default true,
  add column if not exists subscriber_maintenance_completed_enabled boolean not null default true,
  add column if not exists subscriber_maintenance_canceled_enabled boolean not null default true,
  add column if not exists subscriber_manual_notice_enabled boolean not null default false,
  add column if not exists subscriber_component_selection_enabled boolean not null default true,
  add column if not exists subscriber_all_components_default boolean not null default true,
  add column if not exists subscriber_confirmation_cooldown_seconds integer not null default 120,
  add column if not exists subscriber_reply_to text,
  add column if not exists subscriber_reply_to_verified boolean not null default false,
  add column if not exists subscriber_privacy_url text,
  add column if not exists subscriber_public_count_visible boolean not null default false,
  add column if not exists subscriber_powered_by_removed boolean not null default false,
  add column if not exists subscriber_form_auto_paused_at timestamptz,
  add column if not exists subscriber_form_pause_reason text;

alter table public.status_pages
  drop constraint if exists status_pages_subscriber_cooldown_check;
alter table public.status_pages
  add constraint status_pages_subscriber_cooldown_check
  check (subscriber_confirmation_cooldown_seconds between 30 and 3600);
