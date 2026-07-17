-- Phase 9: subscriber fan-out + delivery engine (atomic DB primitives).
--
-- Preference and eligibility evaluation happens in SQL (bounded batches, never
-- loading all subscribers into app memory), while the app worker orchestrates.
-- The database owns everything that must be atomic and concurrency-safe:
--
--   * claim_subscriber_events        -> lease pending fan-out events (SKIP LOCKED)
--   * next_subscriber_fanout_batch   -> bounded, cursor-paged eligible candidates
--   * create_subscriber_intent       -> dedup-safe intent creation
--   * record_subscriber_suppression  -> event-level suppression record
--   * mark_subscriber_event          -> record fan-out completion
--   * lease_subscriber_deliveries    -> lease due intents for a worker
--   * record_subscriber_attempt      -> append attempt + advance intent + DLQ
--   * expire_stale_subscriber_leases -> reclaim intents from crashed workers
--   * cancel_pending_subscriber_intents -> stop future sends (unsubscribe etc.)
--   * suppress_subscriber            -> durable suppression + cancel pending
--   * apply_subscriber_provider_event-> verified bounce/complaint/delivered
--   * reconcile_subscriber_delivery  -> detect and safely repair drift
--
-- No external network calls occur in the database. Provider failure never rolls
-- back publication state. Forward-only migration.

-- ---------------------------------------------------------------------------
-- claim_subscriber_events: lease pending fan-out events.
-- ---------------------------------------------------------------------------
create or replace function app.claim_subscriber_events(p_limit integer default 20)
returns table (
  id uuid,
  organization_id uuid,
  status_page_id uuid,
  event_type text,
  content_revision integer,
  public_payload jsonb,
  page_wide boolean,
  occurred_at timestamptz
)
language sql
security definer
set search_path = public, app
as $$
  with due as (
    select e.id
    from public.status_page_subscriber_events e
    where e.fanout_status = 'pending'
    order by e.occurred_at
    for update skip locked
    limit greatest(1, least(p_limit, 200))
  ),
  claimed as (
    update public.status_page_subscriber_events e
    set fanout_status = 'processing', updated_at = now()
    from due
    where e.id = due.id
    returning e.id, e.organization_id, e.status_page_id, e.event_type,
              e.content_revision, e.public_payload, e.page_wide, e.occurred_at
  )
  select * from claimed;
$$;

-- ---------------------------------------------------------------------------
-- next_subscriber_fanout_batch: bounded batch of confirmed subscribers who
-- have not yet been evaluated for this event, annotated with whether their
-- event and component preferences match. Cursor is (created_at, id).
-- ---------------------------------------------------------------------------
create or replace function app.next_subscriber_fanout_batch(
  p_event_id uuid,
  p_after_created timestamptz default '-infinity',
  p_after_id uuid default '00000000-0000-0000-0000-000000000000',
  p_limit integer default 500
)
returns table (
  subscriber_id uuid,
  created_at timestamptz,
  event_pref_ok boolean,
  component_match boolean
)
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_event record;
  v_affected uuid[];
begin
  select * into v_event from public.status_page_subscriber_events where id = p_event_id;
  if not found then return; end if;

  -- Affected component ids from the allowlisted public payload.
  select coalesce(array_agg(x::uuid), '{}') into v_affected
  from jsonb_array_elements_text(coalesce(v_event.public_payload->'affected_component_ids', '[]'::jsonb)) as x;

  return query
  select
    s.id as subscriber_id,
    s.created_at,
    -- Event-type preference (defaults to enabled when no prefs row exists).
    case v_event.event_type
      when 'incident_opened' then coalesce(ep.incident_opened, true)
      when 'incident_update' then coalesce(ep.incident_updates, true)
      when 'incident_resolved' then coalesce(ep.incident_resolved, true)
      when 'incident_reopened' then coalesce(ep.incident_reopened, true)
      when 'maintenance_scheduled' then coalesce(ep.maintenance_scheduled, true)
      when 'maintenance_started' then coalesce(ep.maintenance_started, true)
      when 'maintenance_updated' then coalesce(ep.maintenance_updates, true)
      when 'maintenance_completed' then coalesce(ep.maintenance_completed, true)
      when 'maintenance_canceled' then coalesce(ep.maintenance_canceled, true)
      else true
    end as event_pref_ok,
    -- Component match: all-components, page-wide event, or an explicit overlap.
    (
      coalesce(ep.all_components, true)
      or v_event.page_wide
      or cardinality(v_affected) = 0
      or exists (
        select 1 from public.status_page_subscriber_components sc
        where sc.subscriber_id = s.id
          and sc.status_page_component_id = any(v_affected)
      )
    ) as component_match
  from public.status_page_subscribers s
  left join public.status_page_subscriber_event_prefs ep on ep.subscriber_id = s.id
  where s.status_page_id = v_event.status_page_id
    and s.status = 'confirmed'
    and s.deleted_at is null
    and (s.created_at, s.id) > (p_after_created, p_after_id)
  order by s.created_at, s.id
  limit greatest(1, least(p_limit, 2000));
end;
$$;

-- ---------------------------------------------------------------------------
-- create_subscriber_intent: dedup-safe creation of one delivery intent.
-- ---------------------------------------------------------------------------
create or replace function app.create_subscriber_intent(
  p_organization_id uuid,
  p_status_page_id uuid,
  p_event_id uuid,
  p_subscriber_id uuid,
  p_event_type text,
  p_message_kind text,
  p_content_revision integer,
  p_render_payload jsonb,
  p_match_explanation text,
  p_dedup_key text,
  p_is_manual boolean default false
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
    insert into public.status_page_subscriber_delivery_deduplication (dedup_key, organization_id)
      values (p_dedup_key, p_organization_id)
      on conflict (dedup_key) do nothing;
    if not found then
      return null;  -- an intent for this (event, revision, subscriber) exists.
    end if;
  end if;

  insert into public.status_page_subscriber_delivery_intents (
    organization_id, status_page_id, event_id, subscriber_id, event_type,
    message_kind, content_revision, render_payload, match_explanation,
    status, dedup_key, scheduled_at, is_manual
  ) values (
    p_organization_id, p_status_page_id, p_event_id, p_subscriber_id, p_event_type,
    p_message_kind, coalesce(p_content_revision, 1), coalesce(p_render_payload, '{}'::jsonb),
    p_match_explanation, 'pending', p_dedup_key, now(), coalesce(p_is_manual, false)
  )
  returning id into v_id;

  if p_dedup_key is not null then
    update public.status_page_subscriber_delivery_deduplication
      set intent_id = v_id where dedup_key = p_dedup_key;
  end if;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- record_subscriber_suppression: event-level "did not send, and why".
-- ---------------------------------------------------------------------------
create or replace function app.record_subscriber_suppression(
  p_organization_id uuid,
  p_status_page_id uuid,
  p_event_id uuid,
  p_subscriber_id uuid,
  p_event_type text,
  p_reason text,
  p_explanation text
)
returns void
language sql
security definer
set search_path = public, app
as $$
  insert into public.status_page_subscriber_delivery_suppressions (
    organization_id, status_page_id, event_id, subscriber_id, event_type, reason, explanation
  ) values (
    p_organization_id, p_status_page_id, p_event_id, p_subscriber_id, p_event_type, p_reason, p_explanation
  );
$$;

-- ---------------------------------------------------------------------------
-- mark_subscriber_event: record fan-out completion for one event.
-- ---------------------------------------------------------------------------
create or replace function app.mark_subscriber_event(
  p_event_id uuid, p_status text, p_eligible integer, p_intent_count integer
)
returns void
language sql
security definer
set search_path = public, app
as $$
  update public.status_page_subscriber_events set
    fanout_status = p_status,
    eligible_count = coalesce(p_eligible, eligible_count),
    intent_count = coalesce(p_intent_count, intent_count),
    fanned_out_at = case when p_status = 'completed' then now() else fanned_out_at end,
    updated_at = now()
  where id = p_event_id;
$$;

-- ---------------------------------------------------------------------------
-- lease_subscriber_deliveries: lease due intents for a worker.
-- Confirmed + non-suppressed subscribers only; a status change between fan-out
-- and send (unsubscribe, complaint) removes the intent from the lease set.
-- ---------------------------------------------------------------------------
create or replace function app.lease_subscriber_deliveries(
  p_worker text, p_max integer default 50, p_lease_seconds integer default 90
)
returns table (
  id uuid,
  organization_id uuid,
  status_page_id uuid,
  subscriber_id uuid,
  event_id uuid,
  event_type text,
  message_kind text,
  render_payload jsonb,
  attempt_count integer,
  max_attempts integer
)
language sql
security definer
set search_path = public, app
as $$
  with due as (
    select i.id
    from public.status_page_subscriber_delivery_intents i
    join public.status_page_subscribers s on s.id = i.subscriber_id
    where i.status in ('pending', 'scheduled')
      and i.locked_at is null
      and i.scheduled_at <= now()
      and s.status = 'confirmed'
      and s.deleted_at is null
    order by i.scheduled_at
    for update of i skip locked
    limit greatest(1, least(p_max, 200))
  ),
  leased as (
    update public.status_page_subscriber_delivery_intents i
    set status = 'processing',
        locked_at = now(),
        locked_by_worker = p_worker,
        lease_expires_at = now() + make_interval(secs => greatest(15, p_lease_seconds)),
        updated_at = now()
    from due
    where i.id = due.id
    returning i.id, i.organization_id, i.status_page_id, i.subscriber_id, i.event_id,
              i.event_type, i.message_kind, i.render_payload, i.attempt_count, i.max_attempts
  )
  select * from leased;
$$;

-- ---------------------------------------------------------------------------
-- record_subscriber_attempt: append attempt + advance intent state + DLQ.
-- ---------------------------------------------------------------------------
create or replace function app.record_subscriber_attempt(
  p_intent_id uuid,
  p_result text,              -- delivered | retryable_failure | permanent_failure | error
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
begin
  select * into v from public.status_page_subscriber_delivery_intents where id = p_intent_id for update;
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
    v_final := 'pending';
  end if;

  insert into public.status_page_subscriber_delivery_attempts (
    intent_id, organization_id, attempt_number, result, error_category, safe_summary,
    http_status, provider_request_id, duration_ms, is_manual, next_retry_at, started_at, completed_at
  ) values (
    p_intent_id, v.organization_id, v_attempt, p_result, p_error_category, p_safe_summary,
    p_http_status, p_provider_request_id, p_duration_ms, coalesce(p_is_manual, false),
    case when v_final = 'pending' then v_next_at else null end, now(), now()
  );

  if v_final = 'delivered' then
    update public.status_page_subscriber_delivery_intents set
      status = 'delivered', attempt_count = v_attempt, completed_at = now(),
      provider_message_id = coalesce(p_provider_request_id, provider_message_id),
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      last_error_category = null, next_attempt_at = null, updated_at = now()
      where id = p_intent_id;

    update public.status_page_subscribers set last_delivery_at = now(), updated_at = now()
      where id = v.subscriber_id;

  elsif v_final = 'pending' then
    update public.status_page_subscriber_delivery_intents set
      status = 'pending', attempt_count = v_attempt, scheduled_at = v_next_at,
      next_attempt_at = v_next_at, locked_at = null, locked_by_worker = null,
      lease_expires_at = null, last_error_category = p_error_category, updated_at = now()
      where id = p_intent_id;

  else  -- dead_letter
    update public.status_page_subscriber_delivery_intents set
      status = 'dead_letter', attempt_count = v_attempt, completed_at = now(),
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      last_error_category = p_error_category, next_attempt_at = null, updated_at = now()
      where id = p_intent_id;

    insert into public.status_page_subscriber_delivery_dead_letters (
      intent_id, organization_id, status_page_id, event_id, event_type,
      error_category, safe_summary, provider_message_id, first_attempt_at, final_attempt_at, suggested_action
    )
    select p_intent_id, v.organization_id, v.status_page_id, v.event_id, v.event_type,
      p_error_category, p_safe_summary, p_provider_request_id,
      (select min(started_at) from public.status_page_subscriber_delivery_attempts where intent_id = p_intent_id),
      now(),
      case p_error_category
        when 'recipient_invalid' then 'Subscriber address is invalid; it has been suppressed.'
        when 'recipient_suppressed' then 'Subscriber is suppressed; no further email will be sent.'
        when 'configuration_error' then 'Check the sending domain and provider configuration.'
        else 'Transient failure exhausted retries. Retry is available while the subscriber remains eligible.'
      end
    on conflict (intent_id) do nothing;
  end if;

  return v_final;
end;
$$;

-- ---------------------------------------------------------------------------
-- expire_stale_subscriber_leases: reclaim intents from crashed workers.
-- ---------------------------------------------------------------------------
create or replace function app.expire_stale_subscriber_leases()
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare v_count integer;
begin
  update public.status_page_subscriber_delivery_intents set
    status = 'pending', locked_at = null, locked_by_worker = null,
    lease_expires_at = null, updated_at = now()
    where status = 'processing' and locked_at is not null and lease_expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- cancel_pending_subscriber_intents: stop future sends for one subscriber.
-- ---------------------------------------------------------------------------
create or replace function app.cancel_pending_subscriber_intents(p_subscriber_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare v_count integer;
begin
  update public.status_page_subscriber_delivery_intents set
    status = 'canceled', locked_at = null, locked_by_worker = null,
    lease_expires_at = null, updated_at = now()
    where subscriber_id = p_subscriber_id and status in ('pending', 'scheduled', 'processing');
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- suppress_subscriber: durable suppression + cancel pending. Complaint and
-- hard-bounce suppressions are not reversible; administrative ones are.
-- ---------------------------------------------------------------------------
create or replace function app.suppress_subscriber(
  p_subscriber_id uuid,
  p_reason text,
  p_reversible boolean default false,
  p_actor_profile_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public, app
as $$
declare v record;
begin
  select id, organization_id, status_page_id, email_hash, status
    into v from public.status_page_subscribers where id = p_subscriber_id for update;
  if not found then return; end if;

  update public.status_page_subscribers set
    status = case p_reason
      when 'hard_bounce' then 'bounced'
      when 'repeated_soft_bounce' then 'bounced'
      when 'complaint' then 'complained'
      else 'suppressed' end,
    suppressed_at = now(),
    suppression_reason = p_reason,
    bounced_at = case when p_reason in ('hard_bounce', 'repeated_soft_bounce') then now() else bounced_at end,
    complained_at = case when p_reason = 'complaint' then now() else complained_at end,
    updated_at = now()
    where id = p_subscriber_id;

  insert into public.status_page_subscriber_suppressions (
    organization_id, status_page_id, email_hash, subscriber_id, reason, reversible, created_by_user_id
  ) values (
    v.organization_id, v.status_page_id, v.email_hash, p_subscriber_id, p_reason, p_reversible, p_actor_profile_id
  )
  on conflict (status_page_id, email_hash) do update
    set reason = excluded.reason,
        reversible = case when public.status_page_subscriber_suppressions.reversible then excluded.reversible else false end,
        removed_at = null, removed_by_user_id = null;

  perform app.cancel_pending_subscriber_intents(p_subscriber_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- apply_subscriber_provider_event: verified provider callback application.
-- Idempotent via unique (provider, provider_event_id). The caller has already
-- verified the signature and mapped provider_message_id -> intent -> subscriber.
-- ---------------------------------------------------------------------------
create or replace function app.apply_subscriber_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_provider_message_id text,
  p_event_type text,          -- delivered | bounced | complained
  p_bounce_class text,        -- hard | soft | null
  p_safe_summary text,
  p_soft_bounce_threshold integer default 3
)
returns text
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_intent record;
  v_sub record;
  v_inserted boolean;
begin
  -- Idempotency: a duplicate callback is a no-op.
  insert into public.status_page_subscriber_provider_events (
    provider, provider_event_id, provider_message_id, event_type, bounce_class, safe_summary, received_at
  ) values (
    p_provider, p_provider_event_id, p_provider_message_id, p_event_type, p_bounce_class, p_safe_summary, now()
  )
  on conflict (provider, provider_event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return 'duplicate'; end if;

  select * into v_intent from public.status_page_subscriber_delivery_intents
    where provider_message_id = p_provider_message_id
    order by created_at desc limit 1;

  if found then
    update public.status_page_subscriber_provider_events
      set organization_id = v_intent.organization_id, status_page_id = v_intent.status_page_id,
          intent_id = v_intent.id, subscriber_id = v_intent.subscriber_id
      where provider = p_provider and provider_event_id = p_provider_event_id;

    select * into v_sub from public.status_page_subscribers where id = v_intent.subscriber_id for update;
  end if;

  if p_event_type = 'complained' then
    if v_intent.subscriber_id is not null then
      perform app.suppress_subscriber(v_intent.subscriber_id, 'complaint', false, null);
    end if;
    return 'complaint';
  elsif p_event_type = 'bounced' then
    if v_intent.subscriber_id is null then return 'no_subscriber'; end if;
    if coalesce(p_bounce_class, 'hard') = 'hard' then
      perform app.suppress_subscriber(v_intent.subscriber_id, 'hard_bounce', false, null);
      return 'hard_bounce';
    else
      update public.status_page_subscribers
        set soft_bounce_count = soft_bounce_count + 1, updated_at = now()
        where id = v_intent.subscriber_id
        returning soft_bounce_count into v_sub;
      if coalesce(v_sub.soft_bounce_count, 0) >= greatest(1, p_soft_bounce_threshold) then
        perform app.suppress_subscriber(v_intent.subscriber_id, 'repeated_soft_bounce', false, null);
        return 'soft_bounce_suppressed';
      end if;
      return 'soft_bounce';
    end if;
  else
    -- delivered / other: record only.
    return coalesce(p_event_type, 'recorded');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- reconcile_subscriber_delivery: detect and optionally repair drift. Dry-run
-- by default, bounded, platform-admin only in the app.
-- ---------------------------------------------------------------------------
create or replace function app.reconcile_subscriber_delivery(
  p_dry_run boolean default true, p_limit integer default 500
)
returns jsonb
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_stale integer := 0;
  v_ineligible_pending integer := 0;
  v_complaint_not_suppressed integer := 0;
  v_confirmed_with_token integer := 0;
begin
  select count(*) into v_stale from public.status_page_subscriber_delivery_intents
    where status = 'processing' and (lease_expires_at < now() or locked_at is null);

  -- Pending deliveries to subscribers who are no longer eligible.
  select count(*) into v_ineligible_pending
    from public.status_page_subscriber_delivery_intents i
    join public.status_page_subscribers s on s.id = i.subscriber_id
    where i.status in ('pending', 'scheduled') and s.status <> 'confirmed';

  -- Complained subscribers not marked suppressed.
  select count(*) into v_complaint_not_suppressed
    from public.status_page_subscribers
    where complained_at is not null and status not in ('complained', 'suppressed', 'deleted');

  -- Confirmed subscribers still holding a live confirmation token.
  select count(*) into v_confirmed_with_token
    from public.status_page_subscribers
    where status = 'confirmed' and confirmation_token_hash is not null;

  if not p_dry_run then
    -- Reclaim stale leases.
    update public.status_page_subscriber_delivery_intents set
      status = 'pending', locked_at = null, locked_by_worker = null, lease_expires_at = null, updated_at = now()
      where status = 'processing' and (lease_expires_at < now() or locked_at is null)
      and id in (
        select id from public.status_page_subscriber_delivery_intents
        where status = 'processing' and (lease_expires_at < now() or locked_at is null)
        limit greatest(1, least(p_limit, 5000))
      );
    -- Cancel pending intents to ineligible subscribers.
    update public.status_page_subscriber_delivery_intents i set
      status = 'canceled', updated_at = now()
      from public.status_page_subscribers s
      where s.id = i.subscriber_id and i.status in ('pending', 'scheduled') and s.status <> 'confirmed';
    -- Clear stale confirmation tokens from confirmed subscribers.
    update public.status_page_subscribers set confirmation_token_hash = null, updated_at = now()
      where status = 'confirmed' and confirmation_token_hash is not null;
  end if;

  return jsonb_build_object(
    'dry_run', p_dry_run,
    'stale_leases', v_stale,
    'ineligible_pending', v_ineligible_pending,
    'complaint_not_suppressed', v_complaint_not_suppressed,
    'confirmed_with_token', v_confirmed_with_token
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Public API wrappers. service_role only, mirroring the Phase 7 pattern, so
-- customers can never forge fan-out, delivery success, consent, or suppression.
-- ---------------------------------------------------------------------------
create or replace function public.claim_subscriber_events(p_limit integer default 20)
returns table (id uuid, organization_id uuid, status_page_id uuid, event_type text,
  content_revision integer, public_payload jsonb, page_wide boolean, occurred_at timestamptz)
language sql security definer set search_path = public, app
as $$ select * from app.claim_subscriber_events(p_limit); $$;

create or replace function public.next_subscriber_fanout_batch(
  p_event_id uuid, p_after_created timestamptz default '-infinity',
  p_after_id uuid default '00000000-0000-0000-0000-000000000000', p_limit integer default 500)
returns table (subscriber_id uuid, created_at timestamptz, event_pref_ok boolean, component_match boolean)
language sql security definer set search_path = public, app
as $$ select * from app.next_subscriber_fanout_batch(p_event_id, p_after_created, p_after_id, p_limit); $$;

create or replace function public.create_subscriber_intent(
  p_organization_id uuid, p_status_page_id uuid, p_event_id uuid, p_subscriber_id uuid,
  p_event_type text, p_message_kind text, p_content_revision integer, p_render_payload jsonb,
  p_match_explanation text, p_dedup_key text, p_is_manual boolean default false)
returns uuid language sql security definer set search_path = public, app
as $$ select app.create_subscriber_intent(p_organization_id, p_status_page_id, p_event_id, p_subscriber_id,
  p_event_type, p_message_kind, p_content_revision, p_render_payload, p_match_explanation, p_dedup_key, p_is_manual); $$;

create or replace function public.record_subscriber_suppression(
  p_organization_id uuid, p_status_page_id uuid, p_event_id uuid, p_subscriber_id uuid,
  p_event_type text, p_reason text, p_explanation text)
returns void language sql security definer set search_path = public, app
as $$ select app.record_subscriber_suppression(p_organization_id, p_status_page_id, p_event_id, p_subscriber_id, p_event_type, p_reason, p_explanation); $$;

create or replace function public.mark_subscriber_event(p_event_id uuid, p_status text, p_eligible integer, p_intent_count integer)
returns void language sql security definer set search_path = public, app
as $$ select app.mark_subscriber_event(p_event_id, p_status, p_eligible, p_intent_count); $$;

create or replace function public.lease_subscriber_deliveries(p_worker text, p_max integer default 50, p_lease_seconds integer default 90)
returns table (id uuid, organization_id uuid, status_page_id uuid, subscriber_id uuid, event_id uuid,
  event_type text, message_kind text, render_payload jsonb, attempt_count integer, max_attempts integer)
language sql security definer set search_path = public, app
as $$ select * from app.lease_subscriber_deliveries(p_worker, p_max, p_lease_seconds); $$;

create or replace function public.record_subscriber_attempt(
  p_intent_id uuid, p_result text, p_error_category text, p_safe_summary text,
  p_http_status integer, p_provider_request_id text, p_duration_ms integer, p_is_manual boolean default false)
returns text language sql security definer set search_path = public, app
as $$ select app.record_subscriber_attempt(p_intent_id, p_result, p_error_category, p_safe_summary, p_http_status, p_provider_request_id, p_duration_ms, p_is_manual); $$;

create or replace function public.expire_stale_subscriber_leases()
returns integer language sql security definer set search_path = public, app
as $$ select app.expire_stale_subscriber_leases(); $$;

create or replace function public.cancel_pending_subscriber_intents(p_subscriber_id uuid)
returns integer language sql security definer set search_path = public, app
as $$ select app.cancel_pending_subscriber_intents(p_subscriber_id); $$;

create or replace function public.suppress_subscriber(p_subscriber_id uuid, p_reason text, p_reversible boolean default false, p_actor_profile_id uuid default null)
returns void language sql security definer set search_path = public, app
as $$ select app.suppress_subscriber(p_subscriber_id, p_reason, p_reversible, p_actor_profile_id); $$;

create or replace function public.apply_subscriber_provider_event(
  p_provider text, p_provider_event_id text, p_provider_message_id text, p_event_type text,
  p_bounce_class text, p_safe_summary text, p_soft_bounce_threshold integer default 3)
returns text language sql security definer set search_path = public, app
as $$ select app.apply_subscriber_provider_event(p_provider, p_provider_event_id, p_provider_message_id, p_event_type, p_bounce_class, p_safe_summary, p_soft_bounce_threshold); $$;

create or replace function public.reconcile_subscriber_delivery(p_dry_run boolean default true, p_limit integer default 500)
returns jsonb language sql security definer set search_path = public, app
as $$ select app.reconcile_subscriber_delivery(p_dry_run, p_limit); $$;

do $$
declare fn text;
begin
  for fn in
    select p.oid::regprocedure::text
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'claim_subscriber_events', 'next_subscriber_fanout_batch', 'create_subscriber_intent',
      'record_subscriber_suppression', 'mark_subscriber_event', 'lease_subscriber_deliveries',
      'record_subscriber_attempt', 'expire_stale_subscriber_leases', 'cancel_pending_subscriber_intents',
      'suppress_subscriber', 'apply_subscriber_provider_event', 'reconcile_subscriber_delivery'
    )
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end;
$$;
