-- Phase 7: alert delivery engine (atomic database primitives).
--
-- The routing decision (which rules match, which channels, quiet hours,
-- recovery behavior) is evaluated in the TypeScript delivery service where it
-- is unit tested. The database owns only the pieces that must be atomic and
-- concurrency-safe:
--
--   * claim_alert_outbox        -> lease incident outbox rows (SKIP LOCKED)
--   * create_alert_intent       -> dedup-safe intent creation (insert-on-conflict)
--   * mark_alert_outbox         -> record outbox consumption result
--   * lease_alert_deliveries    -> lease due intents for a worker (SKIP LOCKED)
--   * record_alert_attempt      -> append attempt + advance intent + health + DLQ
--   * record_alert_test_result  -> record a test send + channel verification
--   * expire_stale_alert_leases -> reclaim intents from crashed workers
--   * reconcile_alert_delivery  -> detect and safely repair inconsistencies
--
-- No external network calls happen in the database. Provider failure can never
-- roll back incident state. Forward-only migration.

-- ---------------------------------------------------------------------------
-- claim_alert_outbox: atomically lease pending incident outbox rows.
-- The TS consumer evaluates routing for each row, then calls mark_alert_outbox.
-- ---------------------------------------------------------------------------
create or replace function app.claim_alert_outbox(p_limit integer default 50)
returns table (
  id uuid,
  organization_id uuid,
  incident_id uuid,
  monitor_id uuid,
  event_type text,
  schema_version integer,
  payload jsonb,
  occurred_at timestamptz
)
language sql
security definer
set search_path = public, app
as $$
  with due as (
    select o.id
    from public.incident_delivery_outbox o
    where o.status = 'pending'
    order by o.occurred_at
    for update skip locked
    limit greatest(1, least(p_limit, 500))
  ),
  claimed as (
    update public.incident_delivery_outbox o
    set status = 'processing', updated_at = now()
    from due
    where o.id = due.id
    returning o.id, o.organization_id, o.incident_id, o.monitor_id,
              o.event_type, o.schema_version, o.payload, o.occurred_at
  )
  select * from claimed;
$$;

-- ---------------------------------------------------------------------------
-- mark_alert_outbox: record the result of consuming one outbox row.
-- p_status in ('delivered','suppressed','failed','canceled','pending').
-- 'delivered' here means "handed off to the delivery queue as intents".
-- ---------------------------------------------------------------------------
create or replace function app.mark_alert_outbox(
  p_outbox_id uuid, p_status text, p_reason text default null
)
returns void
language sql
security definer
set search_path = public, app
as $$
  update public.incident_delivery_outbox
  set status = p_status,
      suppression_reason = coalesce(p_reason, suppression_reason),
      updated_at = now()
  where id = p_outbox_id;
$$;

-- ---------------------------------------------------------------------------
-- create_alert_intent: dedup-safe creation of one delivery intent.
-- When p_dedup_key is provided, a unique deduplication row guarantees exactly
-- one intent per logical (event, channel, generation). A duplicate returns
-- null so the caller knows the intent already exists. Test/fallback intents
-- pass a null dedup key.
-- ---------------------------------------------------------------------------
create or replace function app.create_alert_intent(
  p_organization_id uuid,
  p_outbox_id uuid,
  p_incident_id uuid,
  p_monitor_id uuid,
  p_channel_id uuid,
  p_channel_version integer,
  p_rule_id uuid,
  p_provider text,
  p_event_type text,
  p_severity text,
  p_kind text,
  p_event_payload jsonb,
  p_dedup_key text,
  p_scheduled_at timestamptz,
  p_max_attempts integer,
  p_routing_explanation text
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_id uuid;
begin
  if p_dedup_key is not null then
    insert into public.alert_delivery_deduplication (dedup_key, organization_id)
      values (p_dedup_key, p_organization_id)
      on conflict (dedup_key) do nothing;
    if not found then
      -- An intent for this logical event/channel already exists.
      return null;
    end if;
  end if;

  insert into public.alert_delivery_intents (
    organization_id, outbox_id, incident_id, monitor_id, channel_id, channel_version,
    rule_id, provider, event_type, severity, kind, event_payload, status, dedup_key,
    scheduled_at, max_attempts, routing_explanation
  ) values (
    p_organization_id, p_outbox_id, p_incident_id, p_monitor_id, p_channel_id,
    p_channel_version, p_rule_id, p_provider, p_event_type, p_severity,
    coalesce(p_kind, 'event'), coalesce(p_event_payload, '{}'::jsonb),
    case when coalesce(p_scheduled_at, now()) > now() then 'scheduled' else 'pending' end,
    p_dedup_key, coalesce(p_scheduled_at, now()), coalesce(p_max_attempts, 5),
    p_routing_explanation
  )
  returning id into v_id;

  if p_dedup_key is not null then
    update public.alert_delivery_deduplication set intent_id = v_id where dedup_key = p_dedup_key;
  end if;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- lease_alert_deliveries: lease due intents for a delivery worker.
-- Mirrors the Phase 4 check-lease pattern: SKIP LOCKED, bounded batch, lease
-- expiry so a crashed worker's intents are reclaimed by expire_stale_leases.
-- ---------------------------------------------------------------------------
create or replace function app.lease_alert_deliveries(
  p_worker text, p_max integer default 20, p_lease_seconds integer default 60
)
returns table (
  id uuid,
  organization_id uuid,
  incident_id uuid,
  monitor_id uuid,
  channel_id uuid,
  channel_version integer,
  provider text,
  event_type text,
  severity text,
  kind text,
  event_payload jsonb,
  attempt_count integer,
  max_attempts integer,
  rule_id uuid
)
language sql
security definer
set search_path = public, app
as $$
  with due as (
    select i.id
    from public.alert_delivery_intents i
    join public.alert_channels c on c.id = i.channel_id
    where i.status in ('pending', 'scheduled')
      and i.locked_at is null
      and i.scheduled_at <= now()
      -- Do not attempt delivery through a paused/disabled/deleted channel.
      and c.status in ('active', 'testing', 'degraded')
      and c.deleted_at is null
    order by i.scheduled_at
    for update of i skip locked
    limit greatest(1, least(p_max, 100))
  ),
  leased as (
    update public.alert_delivery_intents i
    set status = 'processing',
        locked_at = now(),
        locked_by_worker = p_worker,
        lease_expires_at = now() + make_interval(secs => greatest(15, p_lease_seconds)),
        updated_at = now()
    from due
    where i.id = due.id
    returning i.id, i.organization_id, i.incident_id, i.monitor_id, i.channel_id,
              i.channel_version, i.provider, i.event_type, i.severity, i.kind,
              i.event_payload, i.attempt_count, i.max_attempts, i.rule_id
  )
  select * from leased;
$$;

-- ---------------------------------------------------------------------------
-- record_alert_attempt: append an attempt and advance intent state.
-- Computes retry backoff, moves exhausted/permanent failures to the dead-letter
-- queue, updates channel health, and auto-pauses a channel after repeated
-- permanent failures. Idempotent-friendly: attempt_number is caller supplied.
-- ---------------------------------------------------------------------------
create or replace function app.record_alert_attempt(
  p_intent_id uuid,
  p_result text,          -- delivered | retryable_failure | permanent_failure | error
  p_error_category text,
  p_safe_summary text,
  p_http_status integer,
  p_provider_request_id text,
  p_duration_ms integer,
  p_is_manual boolean default false
)
returns text
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v record;
  v_attempt integer;
  v_next_at timestamptz;
  v_final text;
  v_backoff interval;
  v_consec integer;
begin
  select * into v from public.alert_delivery_intents where id = p_intent_id for update;
  if not found then raise exception 'intent not found'; end if;

  v_attempt := v.attempt_count + 1;

  -- Backoff schedule with jitter: 30s, 2m, 10m, 30m, 2h.
  v_backoff := case v_attempt
    when 1 then interval '30 seconds'
    when 2 then interval '2 minutes'
    when 3 then interval '10 minutes'
    when 4 then interval '30 minutes'
    else interval '2 hours'
  end;
  v_next_at := now() + v_backoff + make_interval(secs => floor(random() * 20)::int);

  if p_result = 'delivered' then
    v_final := 'delivered';
  elsif p_result = 'permanent_failure' then
    v_final := 'dead_letter';
  elsif v_attempt >= v.max_attempts then
    v_final := 'dead_letter';
  else
    v_final := 'pending';  -- scheduled for retry via scheduled_at
  end if;

  insert into public.alert_delivery_attempts (
    intent_id, organization_id, attempt_number, result, error_category, safe_summary,
    http_status, provider_request_id, duration_ms, is_manual,
    next_retry_at, started_at, completed_at
  ) values (
    p_intent_id, v.organization_id, v_attempt, p_result, p_error_category, p_safe_summary,
    p_http_status, p_provider_request_id, p_duration_ms, coalesce(p_is_manual, false),
    case when v_final = 'pending' then v_next_at else null end, now(), now()
  );

  if v_final = 'delivered' then
    update public.alert_delivery_intents set
      status = 'delivered', attempt_count = v_attempt, completed_at = now(),
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      last_error_category = null, next_attempt_at = null, updated_at = now()
      where id = p_intent_id;

    update public.alert_channels set
      last_success_at = now(), consecutive_failures = 0,
      health_status = case when status = 'testing' then health_status else 'healthy' end,
      updated_at = now()
      where id = v.channel_id;

  elsif v_final = 'pending' then
    update public.alert_delivery_intents set
      status = 'pending', attempt_count = v_attempt, scheduled_at = v_next_at,
      next_attempt_at = v_next_at, locked_at = null, locked_by_worker = null,
      lease_expires_at = null, last_error_category = p_error_category, updated_at = now()
      where id = p_intent_id;

    update public.alert_channels set
      last_failure_at = now(), consecutive_failures = consecutive_failures + 1,
      updated_at = now()
      where id = v.channel_id
      returning consecutive_failures into v_consec;

    -- Transient degradation: mark degraded at 3, do not pause on transient.
    update public.alert_channels set health_status = 'degraded'
      where id = v.channel_id and status not in ('paused', 'disabled')
        and coalesce(v_consec, 0) >= 3 and health_status = 'healthy';

  else  -- dead_letter
    update public.alert_delivery_intents set
      status = 'dead_letter', attempt_count = v_attempt, completed_at = now(),
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      last_error_category = p_error_category, next_attempt_at = null, updated_at = now()
      where id = p_intent_id;

    insert into public.alert_delivery_dead_letters (
      intent_id, organization_id, channel_id, rule_id, event_type,
      error_category, safe_summary, first_attempt_at, final_attempt_at, suggested_action
    )
    select p_intent_id, v.organization_id, v.channel_id, v.rule_id, v.event_type,
      p_error_category, p_safe_summary,
      (select min(started_at) from public.alert_delivery_attempts where intent_id = p_intent_id),
      now(),
      case p_error_category
        when 'authentication_failed' then 'Reconnect the channel and run a test.'
        when 'destination_missing' then 'Replace the destination and run a test.'
        when 'recipient_invalid' then 'Use another verified recipient.'
        when 'recipient_suppressed' then 'Use another verified recipient.'
        when 'webhook_blocked' then 'Point the webhook at a public HTTPS endpoint.'
        else 'Review the channel configuration and retry.'
      end
    on conflict (intent_id) do nothing;

    update public.alert_channels set
      last_failure_at = now(), consecutive_failures = consecutive_failures + 1,
      health_status = 'failing', updated_at = now()
      where id = v.channel_id
      returning consecutive_failures into v_consec;

    -- Auto-pause only after repeated permanent failures, never one transient.
    update public.alert_channels set
      status = 'paused', paused_at = now(),
      paused_reason = 'Automatically paused after repeated delivery failures. Run a test to reactivate.'
      where id = v.channel_id and status in ('active', 'testing', 'degraded')
        and coalesce(v_consec, 0) >= 5;
  end if;

  return v_final;
end;
$$;

-- ---------------------------------------------------------------------------
-- record_alert_test_result: record a channel test outcome + verification.
-- A successful test verifies the channel (activation is still an explicit
-- operator step). Tests never touch incident state or real routing.
-- ---------------------------------------------------------------------------
create or replace function app.record_alert_test_result(
  p_test_id uuid,
  p_result text,          -- delivered | failed
  p_error_category text,
  p_safe_summary text,
  p_http_status integer,
  p_duration_ms integer
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_channel uuid;
begin
  update public.alert_test_deliveries set
    status = case when p_result = 'delivered' then 'delivered' else 'failed' end,
    result = p_result, error_category = p_error_category, safe_summary = p_safe_summary,
    http_status = p_http_status, duration_ms = p_duration_ms, completed_at = now()
    where id = p_test_id
    returning channel_id into v_channel;

  if v_channel is null then return; end if;

  if p_result = 'delivered' then
    update public.alert_channels set
      last_tested_at = now(), last_success_at = now(),
      verification_status = 'verified', verified_at = now(),
      health_status = case when status in ('paused', 'disabled') then health_status else 'healthy' end,
      consecutive_failures = 0, updated_at = now()
      where id = v_channel;
  else
    update public.alert_channels set
      last_tested_at = now(), last_failure_at = now(),
      verification_status = case when verification_status = 'verified' then 'verified' else 'failed' end,
      updated_at = now()
      where id = v_channel;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- expire_stale_alert_leases: reclaim intents leased by crashed workers.
-- ---------------------------------------------------------------------------
create or replace function app.expire_stale_alert_leases()
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_count integer;
begin
  update public.alert_delivery_intents set
    status = 'pending', locked_at = null, locked_by_worker = null,
    lease_expires_at = null, updated_at = now()
    where status = 'processing' and locked_at is not null and lease_expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- reconcile_alert_delivery: detect and (optionally) repair inconsistencies.
-- Dry-run by default. Bounded. Platform-admin only in the app.
-- ---------------------------------------------------------------------------
create or replace function app.reconcile_alert_delivery(
  p_dry_run boolean default true, p_limit integer default 500
)
returns jsonb
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_stale_leases integer := 0;
  v_stuck_processing integer := 0;
  v_intents_no_attempt integer := 0;
begin
  -- Intents stuck in processing with an expired lease.
  select count(*) into v_stale_leases from public.alert_delivery_intents
    where status = 'processing' and lease_expires_at < now();

  -- Intents left processing with no lock (worker died between claim and update).
  select count(*) into v_stuck_processing from public.alert_delivery_intents
    where status = 'processing' and locked_at is null;

  -- Long-pending intents with no attempt recorded.
  select count(*) into v_intents_no_attempt from public.alert_delivery_intents i
    where i.status in ('pending', 'scheduled') and i.attempt_count = 0
      and i.created_at < now() - interval '1 hour'
      and not exists (select 1 from public.alert_delivery_attempts a where a.intent_id = i.id);

  if not p_dry_run then
    update public.alert_delivery_intents set
      status = 'pending', locked_at = null, locked_by_worker = null, lease_expires_at = null,
      updated_at = now()
      where status = 'processing' and (lease_expires_at < now() or locked_at is null)
      and id in (
        select id from public.alert_delivery_intents
        where status = 'processing' and (lease_expires_at < now() or locked_at is null)
        limit greatest(1, least(p_limit, 5000))
      );
  end if;

  return jsonb_build_object(
    'dry_run', p_dry_run,
    'stale_leases', v_stale_leases,
    'stuck_processing', v_stuck_processing,
    'pending_no_attempt', v_intents_no_attempt
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Public API wrappers. service_role only, exactly like the Phase 6 incident
-- API. authenticated/anon can never call them, so customers can never forge
-- delivery success, mutate attempts, or drain the queue.
-- ---------------------------------------------------------------------------
create or replace function public.claim_alert_outbox(p_limit integer default 50)
returns table (
  id uuid, organization_id uuid, incident_id uuid, monitor_id uuid,
  event_type text, schema_version integer, payload jsonb, occurred_at timestamptz
)
language sql security definer set search_path = public, app
as $$ select * from app.claim_alert_outbox(p_limit); $$;

create or replace function public.mark_alert_outbox(p_outbox_id uuid, p_status text, p_reason text default null)
returns void language sql security definer set search_path = public, app
as $$ select app.mark_alert_outbox(p_outbox_id, p_status, p_reason); $$;

create or replace function public.create_alert_intent(
  p_organization_id uuid, p_outbox_id uuid, p_incident_id uuid, p_monitor_id uuid,
  p_channel_id uuid, p_channel_version integer, p_rule_id uuid, p_provider text,
  p_event_type text, p_severity text, p_kind text, p_event_payload jsonb,
  p_dedup_key text, p_scheduled_at timestamptz, p_max_attempts integer, p_routing_explanation text
)
returns uuid language sql security definer set search_path = public, app
as $$ select app.create_alert_intent(p_organization_id, p_outbox_id, p_incident_id, p_monitor_id,
  p_channel_id, p_channel_version, p_rule_id, p_provider, p_event_type, p_severity, p_kind,
  p_event_payload, p_dedup_key, p_scheduled_at, p_max_attempts, p_routing_explanation); $$;

create or replace function public.lease_alert_deliveries(p_worker text, p_max integer default 20, p_lease_seconds integer default 60)
returns table (
  id uuid, organization_id uuid, incident_id uuid, monitor_id uuid, channel_id uuid,
  channel_version integer, provider text, event_type text, severity text, kind text,
  event_payload jsonb, attempt_count integer, max_attempts integer, rule_id uuid
)
language sql security definer set search_path = public, app
as $$ select * from app.lease_alert_deliveries(p_worker, p_max, p_lease_seconds); $$;

create or replace function public.record_alert_attempt(
  p_intent_id uuid, p_result text, p_error_category text, p_safe_summary text,
  p_http_status integer, p_provider_request_id text, p_duration_ms integer, p_is_manual boolean default false
)
returns text language sql security definer set search_path = public, app
as $$ select app.record_alert_attempt(p_intent_id, p_result, p_error_category, p_safe_summary,
  p_http_status, p_provider_request_id, p_duration_ms, p_is_manual); $$;

create or replace function public.record_alert_test_result(
  p_test_id uuid, p_result text, p_error_category text, p_safe_summary text,
  p_http_status integer, p_duration_ms integer
)
returns void language sql security definer set search_path = public, app
as $$ select app.record_alert_test_result(p_test_id, p_result, p_error_category, p_safe_summary, p_http_status, p_duration_ms); $$;

create or replace function public.expire_stale_alert_leases()
returns integer language sql security definer set search_path = public, app
as $$ select app.expire_stale_alert_leases(); $$;

create or replace function public.reconcile_alert_delivery(p_dry_run boolean default true, p_limit integer default 500)
returns jsonb language sql security definer set search_path = public, app
as $$ select app.reconcile_alert_delivery(p_dry_run, p_limit); $$;

do $$
declare
  fn text;
begin
  for fn in
    select p.oid::regprocedure::text
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'claim_alert_outbox', 'mark_alert_outbox', 'create_alert_intent',
      'lease_alert_deliveries', 'record_alert_attempt', 'record_alert_test_result',
      'expire_stale_alert_leases', 'reconcile_alert_delivery'
    )
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end;
$$;
