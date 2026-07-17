-- Phase 6: incident engine data model.
--
-- This migration adds the structured tables behind Fajita's incident engine.
-- It converts finalized monitor check results into reliable operational states
-- without turning every failed request into an outage. The design keeps three
-- state layers strictly separate:
--
--   1. Monitor lifecycle state   -> public.monitors.status (draft/active/paused/...)
--   2. Latest check result       -> public.check_results.status (success/failure/...)
--   3. Operational incident state -> public.monitor_operational_states.state
--
-- Incident lifecycle (open/monitoring/resolved/canceled) is separate again from
-- the operational state (operational/verifying_failure/degraded/down/...).
--
-- Forward-only migration. Do not edit after apply; add a new migration instead.
-- RLS lives in 20260720000200_phase6_incident_rls.sql. Engine functions live in
-- 20260720000100_phase6_incident_engine.sql.

-- ---------------------------------------------------------------------------
-- Monitor configuration: incident policy and criticality.
-- Bounded, structured columns. No unbounded severity or priority language.
-- ---------------------------------------------------------------------------
alter table public.monitors
  add column if not exists criticality text not null default 'normal'
    check (criticality in ('low', 'normal', 'high', 'critical')),
  -- Confirmed failures required before an incident opens (retry is separate).
  add column if not exists failure_confirmation_threshold integer not null default 2
    check (failure_confirmation_threshold between 1 and 5),
  -- Consecutive successes required before an incident resolves.
  add column if not exists recovery_confirmation_threshold integer not null default 2
    check (recovery_confirmation_threshold between 1 and 5),
  -- A response slower than this (but still responding) is degraded, not down.
  add column if not exists degraded_response_time_ms integer
    check (degraded_response_time_ms is null or degraded_response_time_ms > 0),
  -- Grace window during which a failure re-opens the just-resolved incident
  -- instead of opening a new one.
  add column if not exists incident_reopen_window_seconds integer not null default 300
    check (incident_reopen_window_seconds between 0 and 3600),
  -- Manual per-monitor suppression: keep checking, never auto-open incidents.
  add column if not exists incident_suppressed boolean not null default false;

-- ---------------------------------------------------------------------------
-- monitor_operational_states: one current derived state row per monitor.
-- The evaluation pipeline reads and mutates this under a row lock. Never
-- recompute state by scanning the whole result table on a page request.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_operational_states (
  monitor_id uuid primary key references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  state text not null default 'unknown'
    check (state in (
      'operational', 'verifying_failure', 'degraded', 'down',
      'recovering', 'maintenance', 'unknown'
    )),
  state_since timestamptz not null default now(),
  -- The operational state the monitor held before maintenance began, so it can
  -- be restored/re-evaluated when maintenance ends.
  pre_maintenance_state text
    check (pre_maintenance_state is null or pre_maintenance_state in (
      'operational', 'verifying_failure', 'degraded', 'down',
      'recovering', 'maintenance', 'unknown'
    )),
  active_incident_id uuid,
  verification_started_at timestamptz,
  recovery_started_at timestamptz,
  consecutive_eligible_failures integer not null default 0,
  consecutive_eligible_successes integer not null default 0,
  -- State flips inside the flapping window, used to detect instability.
  recent_transition_count integer not null default 0,
  recent_window_started_at timestamptz,
  flapping_since timestamptz,
  last_evaluated_execution_id uuid,
  last_evaluated_checked_at timestamptz,
  last_eligible_failure_at timestamptz,
  last_eligible_success_at timestamptz,
  maintenance_occurrence_id uuid,
  -- Version of the evaluation logic that last wrote this row (for replay/audit).
  evaluation_version integer not null default 1,
  -- Optimistic-lock counter; bumped on every write.
  lock_version bigint not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists monitor_operational_states_org_state_idx
  on public.monitor_operational_states (organization_id, state);
create index if not exists monitor_operational_states_active_incident_idx
  on public.monitor_operational_states (active_incident_id)
  where active_incident_id is not null;

create trigger monitor_operational_states_touch
  before update on public.monitor_operational_states
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- incidents: the incident head record.
-- ---------------------------------------------------------------------------
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Short human sequence, unique per org (INC-1, INC-2, ...). Assigned by trigger.
  reference_code text,
  title text not null,
  slug text,
  origin text not null default 'automatic'
    check (origin in ('automatic', 'manual', 'maintenance_related', 'imported')),
  lifecycle_status text not null default 'open'
    check (lifecycle_status in ('open', 'monitoring', 'resolved', 'canceled')),
  operational_status text not null default 'down'
    check (operational_status in (
      'operational', 'verifying_failure', 'degraded', 'down',
      'recovering', 'maintenance', 'unknown'
    )),
  severity text not null default 'major'
    check (severity in ('minor', 'major', 'critical', 'maintenance', 'informational')),
  primary_monitor_id uuid references public.monitors (id) on delete set null,
  -- Deterministic correlation key used to prevent duplicate active incidents.
  correlation_key text not null,
  correlation_generation integer not null default 1,
  affected_monitor_count integer not null default 0,
  is_flapping boolean not null default false,
  opened_at timestamptz not null default now(),
  first_failure_at timestamptz,
  acknowledged_at timestamptz,
  recovery_started_at timestamptz,
  resolved_at timestamptz,
  canceled_at timestamptz,
  last_transition_at timestamptz not null default now(),
  -- Content visibility. Public projection stays inactive until Phase 8.
  public_visibility text not null default 'internal'
    check (public_visibility in ('internal', 'status_page_ready', 'published', 'hidden')),
  public_title text,
  public_summary text,
  internal_summary text,
  resolution_summary text,
  cancellation_reason text,
  active_maintenance_occurrence_id uuid,
  created_by_user_id uuid references public.user_profiles (id),
  acknowledged_by_user_id uuid references public.user_profiles (id),
  current_assignee_user_id uuid references public.user_profiles (id),
  resolved_by_user_id uuid references public.user_profiles (id),
  canceled_by_user_id uuid references public.user_profiles (id),
  -- Bounded metadata only. Never response bodies, headers, or secrets.
  metadata jsonb not null default '{}'::jsonb,
  evaluation_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint incidents_title_len check (char_length(title) between 1 and 200),
  constraint incidents_public_title_len check (public_title is null or char_length(public_title) <= 200)
);

-- Deduplication backbone: at most one active (open/monitoring) automatic
-- incident per (org, monitor, correlation family, generation). Concurrent
-- evaluations cannot both open an incident for the same monitor failure.
create unique index if not exists incidents_active_dedup_idx
  on public.incidents (organization_id, primary_monitor_id, correlation_key, correlation_generation)
  where lifecycle_status in ('open', 'monitoring')
    and primary_monitor_id is not null
    and deleted_at is null;

create index if not exists incidents_org_lifecycle_idx
  on public.incidents (organization_id, lifecycle_status, opened_at desc)
  where deleted_at is null;
create index if not exists incidents_org_opened_idx
  on public.incidents (organization_id, opened_at desc)
  where deleted_at is null;
create index if not exists incidents_primary_monitor_idx
  on public.incidents (primary_monitor_id, opened_at desc)
  where deleted_at is null;
create index if not exists incidents_assignee_idx
  on public.incidents (current_assignee_user_id)
  where current_assignee_user_id is not null and deleted_at is null;
create unique index if not exists incidents_org_reference_idx
  on public.incidents (organization_id, reference_code)
  where reference_code is not null;

create trigger incidents_touch
  before update on public.incidents
  for each row execute function app.touch_updated_at();

-- Per-org monotonic reference code. Uses a counter table to avoid gaps races.
create table if not exists public.incident_counters (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  next_value integer not null default 1
);

create or replace function app.assign_incident_reference()
returns trigger
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_next integer;
begin
  if new.reference_code is not null then
    return new;
  end if;
  insert into public.incident_counters (organization_id, next_value)
  values (new.organization_id, 2)
  on conflict (organization_id) do update
    set next_value = public.incident_counters.next_value + 1
  returning next_value - 1 into v_next;
  new.reference_code := 'INC-' || v_next::text;
  if new.slug is null then
    new.slug := lower(new.reference_code);
  end if;
  return new;
end;
$$;

create trigger incidents_assign_reference
  before insert on public.incidents
  for each row execute function app.assign_incident_reference();

-- ---------------------------------------------------------------------------
-- incident_monitors: monitors affected by an incident, with per-monitor role.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_monitors (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  -- Snapshot of the monitor name at attach time (survives rename/deletion).
  monitor_name_snapshot text,
  relationship text not null default 'affected'
    check (relationship in ('primary', 'affected')),
  attach_origin text not null default 'automatic'
    check (attach_origin in ('automatic', 'manual')),
  relationship_note text,
  attached_by_user_id uuid references public.user_profiles (id),
  attached_at timestamptz not null default now(),
  removed_at timestamptz,
  unique (incident_id, monitor_id)
);

create index if not exists incident_monitors_incident_idx
  on public.incident_monitors (incident_id)
  where removed_at is null;
create index if not exists incident_monitors_monitor_idx
  on public.incident_monitors (monitor_id);

-- ---------------------------------------------------------------------------
-- incident_events: the immutable, ordered incident timeline.
-- Corrections append new events; history is never rewritten.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_events (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Stable monotonic order within an incident.
  sequence bigint not null,
  event_type text not null,
  actor_kind text not null default 'system'
    check (actor_kind in ('system', 'user', 'platform_admin', 'service')),
  actor_user_id uuid references public.user_profiles (id),
  monitor_id uuid references public.monitors (id) on delete set null,
  region text,
  title text not null,
  -- Safe, sanitized description. No secrets, no response bodies, no full URLs.
  description text,
  visibility text not null default 'internal'
    check (visibility in ('system', 'internal', 'public_ready')),
  evidence_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (incident_id, sequence)
);

create index if not exists incident_events_incident_idx
  on public.incident_events (incident_id, sequence desc);
create index if not exists incident_events_occurred_idx
  on public.incident_events (incident_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- incident_state_transitions: audit of every operational-state change.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_state_transitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid references public.monitors (id) on delete set null,
  incident_id uuid references public.incidents (id) on delete set null,
  from_state text not null,
  to_state text not null,
  reason text,
  trigger text not null default 'evaluation'
    check (trigger in ('evaluation', 'manual', 'maintenance', 'reconciliation', 'replay')),
  execution_id uuid,
  evaluation_version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists incident_state_transitions_monitor_idx
  on public.incident_state_transitions (monitor_id, occurred_at desc);
create index if not exists incident_state_transitions_incident_idx
  on public.incident_state_transitions (incident_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- incident_evidence: bounded links from transitions to check executions.
-- References existing check results; never duplicates full payloads or bodies.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_evidence (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid references public.monitors (id) on delete set null,
  execution_id uuid,
  monitor_version_id uuid,
  role text not null default 'confirmation'
    check (role in ('first_failure', 'confirmation', 'recovery', 'resolution', 'sample')),
  result_status text,
  failure_category text,
  http_status integer,
  response_time_ms integer,
  tls_summary jsonb,
  region text,
  attempt_count integer,
  safe_failure_summary text,
  scheduled_for timestamptz,
  checked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists incident_evidence_incident_idx
  on public.incident_evidence (incident_id, checked_at desc);
create index if not exists incident_evidence_monitor_idx
  on public.incident_evidence (monitor_id, checked_at desc);

-- ---------------------------------------------------------------------------
-- incident_updates: operator-authored updates (internal or public-ready).
-- Corrections are versioned via supersedes_update_id, not silent edits.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_updates (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  update_type text not null default 'informational'
    check (update_type in ('investigating', 'identified', 'monitoring', 'resolved', 'informational')),
  visibility text not null default 'internal'
    check (visibility in ('internal', 'public_ready')),
  body text not null,
  author_user_id uuid references public.user_profiles (id),
  supersedes_update_id uuid references public.incident_updates (id),
  superseded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint incident_updates_body_len check (char_length(body) between 1 and 4000)
);

create index if not exists incident_updates_incident_idx
  on public.incident_updates (incident_id, created_at desc);

-- ---------------------------------------------------------------------------
-- incident_notes: private internal notes. Never public, never in projections.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_notes (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  body text not null,
  author_user_id uuid references public.user_profiles (id),
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint incident_notes_body_len check (char_length(body) between 1 and 4000)
);

create index if not exists incident_notes_incident_idx
  on public.incident_notes (incident_id, created_at desc)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- incident_acknowledgments and incident_assignments: history tables.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  action text not null default 'acknowledged'
    check (action in ('acknowledged', 'unacknowledged')),
  actor_user_id uuid references public.user_profiles (id),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists incident_acknowledgments_incident_idx
  on public.incident_acknowledgments (incident_id, created_at desc);

create table if not exists public.incident_assignments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  assignee_user_id uuid references public.user_profiles (id),
  assigned_by_user_id uuid references public.user_profiles (id),
  action text not null default 'assigned'
    check (action in ('assigned', 'unassigned', 'reassigned')),
  created_at timestamptz not null default now()
);

create index if not exists incident_assignments_incident_idx
  on public.incident_assignments (incident_id, created_at desc);

-- ---------------------------------------------------------------------------
-- incident_public_projections: public-safe projection, one per incident.
-- Allowlisted fields only. Stays inactive (not exposed) until Phase 8.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_public_projections (
  incident_id uuid primary key references public.incidents (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  visibility text not null default 'internal'
    check (visibility in ('internal', 'status_page_ready', 'published', 'hidden')),
  public_title text,
  public_summary text,
  public_status text not null default 'operational'
    check (public_status in (
      'operational', 'degraded', 'down', 'recovering', 'maintenance', 'resolved'
    )),
  severity text,
  opened_at timestamptz,
  resolved_at timestamptz,
  -- Allowlisted, append-only public update snapshots (no internal content).
  public_updates jsonb not null default '[]'::jsonb,
  affected_components jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger incident_public_projections_touch
  before update on public.incident_public_projections
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- incident_delivery_outbox: durable events for future Phase 7 alert delivery.
-- Phase 6 never delivers externally; records remain pending or suppressed.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_delivery_outbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  incident_id uuid references public.incidents (id) on delete cascade,
  monitor_id uuid references public.monitors (id) on delete set null,
  event_type text not null,
  schema_version integer not null default 1,
  idempotency_key text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'delivered', 'failed', 'suppressed', 'canceled')),
  -- Safe payload only. No secrets, no bodies, no full URLs.
  payload jsonb not null default '{}'::jsonb,
  suppression_reason text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists incident_delivery_outbox_status_idx
  on public.incident_delivery_outbox (status, occurred_at)
  where status in ('pending', 'processing');
create index if not exists incident_delivery_outbox_incident_idx
  on public.incident_delivery_outbox (incident_id, occurred_at desc);

create trigger incident_delivery_outbox_touch
  before update on public.incident_delivery_outbox
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- monitor_state_evaluations: durable evaluation queue.
-- app.finalize_check enqueues one row per finalized production result inside
-- the same transaction. A drain processor consumes them idempotently. This
-- decouples incident evaluation from check execution while staying durable and
-- replayable.
-- ---------------------------------------------------------------------------
create table if not exists public.monitor_state_evaluations (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null unique,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'processed', 'failed', 'skipped')),
  attempts integer not null default 0,
  source text not null default 'finalize'
    check (source in ('finalize', 'heartbeat', 'maintenance', 'replay', 'reconciliation')),
  last_error text,
  enqueued_at timestamptz not null default now(),
  locked_at timestamptz,
  processed_at timestamptz
);

create index if not exists monitor_state_evaluations_pending_idx
  on public.monitor_state_evaluations (enqueued_at)
  where status = 'pending';
create index if not exists monitor_state_evaluations_monitor_idx
  on public.monitor_state_evaluations (monitor_id, enqueued_at desc);

-- ---------------------------------------------------------------------------
-- maintenance_windows and occurrences.
-- Phase 6 ships reliable one-time windows. Recurrence is scaffolded but a
-- window generates exactly one occurrence unless recurrence is later enabled.
-- ---------------------------------------------------------------------------
create table if not exists public.maintenance_windows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  internal_notes text,
  timezone text not null default 'UTC',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  suppression_policy text not null default 'suppress_incidents'
    check (suppression_policy in ('suppress_incidents', 'annotate_only', 'do_not_suppress')),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'completed', 'canceled')),
  public_visibility text not null default 'internal'
    check (public_visibility in ('internal', 'status_page_ready', 'published', 'hidden')),
  public_summary text,
  -- Recurrence scaffold. 'none' means a single occurrence (Phase 6 default).
  recurrence text not null default 'none'
    check (recurrence in ('none', 'weekly', 'monthly')),
  created_by_user_id uuid references public.user_profiles (id),
  canceled_by_user_id uuid references public.user_profiles (id),
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_windows_name_len check (char_length(name) between 1 and 160),
  constraint maintenance_windows_time_order check (ends_at > starts_at)
);

create index if not exists maintenance_windows_org_status_idx
  on public.maintenance_windows (organization_id, status, starts_at);

create trigger maintenance_windows_touch
  before update on public.maintenance_windows
  for each row execute function app.touch_updated_at();

create table if not exists public.maintenance_monitor_links (
  id uuid primary key default gen_random_uuid(),
  maintenance_window_id uuid not null references public.maintenance_windows (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (maintenance_window_id, monitor_id)
);

create index if not exists maintenance_monitor_links_monitor_idx
  on public.maintenance_monitor_links (monitor_id);

create table if not exists public.maintenance_occurrences (
  id uuid primary key default gen_random_uuid(),
  maintenance_window_id uuid not null references public.maintenance_windows (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'completed', 'canceled')),
  started_at timestamptz,
  ended_at timestamptz,
  suppressed_failure_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_occurrences_time_order check (ends_at > starts_at)
);

create index if not exists maintenance_occurrences_window_idx
  on public.maintenance_occurrences (maintenance_window_id, starts_at);
create index if not exists maintenance_occurrences_active_idx
  on public.maintenance_occurrences (organization_id, status, starts_at)
  where status in ('scheduled', 'active');

create trigger maintenance_occurrences_touch
  before update on public.maintenance_occurrences
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- incident_suppressions: records of suppressed evaluation outcomes.
-- Used for maintenance suppression evidence and manual reopen-suppression.
-- ---------------------------------------------------------------------------
create table if not exists public.incident_suppressions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  monitor_id uuid references public.monitors (id) on delete cascade,
  incident_id uuid references public.incidents (id) on delete set null,
  maintenance_occurrence_id uuid references public.maintenance_occurrences (id) on delete set null,
  reason text not null
    check (reason in ('maintenance', 'monitor_suppressed', 'manual_resolution_window', 'platform_uncertainty')),
  execution_id uuid,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists incident_suppressions_monitor_idx
  on public.incident_suppressions (monitor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Cross-table foreign keys deferred until both tables exist.
-- ---------------------------------------------------------------------------
alter table public.monitor_operational_states
  drop constraint if exists monitor_operational_states_active_incident_fk;
alter table public.monitor_operational_states
  add constraint monitor_operational_states_active_incident_fk
  foreign key (active_incident_id) references public.incidents (id) on delete set null;

alter table public.monitor_operational_states
  drop constraint if exists monitor_operational_states_maintenance_fk;
alter table public.monitor_operational_states
  add constraint monitor_operational_states_maintenance_fk
  foreign key (maintenance_occurrence_id) references public.maintenance_occurrences (id) on delete set null;

alter table public.incidents
  drop constraint if exists incidents_active_maintenance_fk;
alter table public.incidents
  add constraint incidents_active_maintenance_fk
  foreign key (active_maintenance_occurrence_id) references public.maintenance_occurrences (id) on delete set null;

alter table public.incident_events
  drop constraint if exists incident_events_evidence_fk;
alter table public.incident_events
  add constraint incident_events_evidence_fk
  foreign key (evidence_id) references public.incident_evidence (id) on delete set null;
