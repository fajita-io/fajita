-- Phase 11: lifecycle delivery engine (atomic database primitives).
--
-- Rule evaluation, eligibility, and rendering live in TypeScript where they
-- are unit tested. The database owns the concurrency-safe pieces, mirroring
-- the Phase 7 alert engine:
--
--   * create_lifecycle_intent        -> dedup-safe intent creation
--   * lease_lifecycle_deliveries     -> lease due intents (SKIP LOCKED)
--   * record_lifecycle_attempt       -> append attempt + advance intent
--   * expire_stale_lifecycle_leases  -> reclaim intents from crashed workers
--   * cancel_lifecycle_intents       -> cancel pending intents (state changed)
--   * reconcile_lifecycle_delivery   -> detect and repair inconsistencies
--
-- service_role only. Customers can never forge delivery, mutate attempts, or
-- drain the queue. Forward-only migration.

-- ---------------------------------------------------------------------------
-- create_lifecycle_intent: dedup-safe creation. The unique dedup_key column is
-- the deduplication authority; a duplicate returns null.
-- ---------------------------------------------------------------------------
create or replace function app.create_lifecycle_intent(
  p_organization_id uuid,
  p_user_id uuid,
  p_message_key text,
  p_message_class text,
  p_template_version integer,
  p_dedup_key text,
  p_payload jsonb,
  p_scheduled_at timestamptz,
  p_related_type text default null,
  p_related_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_id uuid;
begin
  insert into public.lifecycle_delivery_intents (
    organization_id, user_id, message_key, message_class, template_version,
    dedup_key, status, scheduled_at, payload, related_type, related_id
  ) values (
    p_organization_id, p_user_id, p_message_key, p_message_class,
    coalesce(p_template_version, 1), p_dedup_key,
    case when coalesce(p_scheduled_at, now()) > now() then 'scheduled' else 'pending' end,
    coalesce(p_scheduled_at, now()), coalesce(p_payload, '{}'::jsonb),
    p_related_type, p_related_id
  )
  on conflict (dedup_key) do nothing
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- lease_lifecycle_deliveries: lease due intents for the delivery worker.
-- ---------------------------------------------------------------------------
create or replace function app.lease_lifecycle_deliveries(
  p_worker text, p_max integer default 20, p_lease_seconds integer default 60
)
returns table (
  id uuid,
  organization_id uuid,
  user_id uuid,
  message_key text,
  message_class text,
  template_version integer,
  payload jsonb,
  attempt_count integer,
  max_attempts integer,
  related_type text,
  related_id uuid
)
language sql
security definer
set search_path = public, app
as $$
  with due as (
    select i.id
    from public.lifecycle_delivery_intents i
    where i.status in ('pending', 'scheduled')
      and i.locked_at is null
      and i.scheduled_at <= now()
    order by i.scheduled_at
    for update of i skip locked
    limit greatest(1, least(p_max, 100))
  ),
  leased as (
    update public.lifecycle_delivery_intents i
    set status = 'processing',
        locked_at = now(),
        locked_by_worker = p_worker,
        lease_expires_at = now() + make_interval(secs => greatest(15, p_lease_seconds)),
        updated_at = now()
    from due
    where i.id = due.id
    returning i.id, i.organization_id, i.user_id, i.message_key, i.message_class,
              i.template_version, i.payload, i.attempt_count, i.max_attempts,
              i.related_type, i.related_id
  )
  select * from leased;
$$;

-- ---------------------------------------------------------------------------
-- record_lifecycle_attempt: append an attempt and advance intent state.
-- Backoff schedule mirrors the alert engine: 30s, 2m, 10m, 30m, 2h + jitter.
-- p_result = 'suppressed' finalizes the intent as suppressed without retry
-- (eligibility changed between creation and send).
-- ---------------------------------------------------------------------------
create or replace function app.record_lifecycle_attempt(
  p_intent_id uuid,
  p_result text,  -- delivered | retryable_failure | permanent_failure | error | suppressed
  p_error_category text,
  p_safe_summary text,
  p_http_status integer,
  p_provider_message_id text,
  p_duration_ms integer,
  p_suppression_reason text default null
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
  select * into v from public.lifecycle_delivery_intents where id = p_intent_id for update;
  if not found then raise exception 'intent not found'; end if;

  if p_result = 'suppressed' then
    update public.lifecycle_delivery_intents set
      status = 'suppressed',
      suppression_reason = coalesce(p_suppression_reason, 'Suppressed at send time'),
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      completed_at = now(), updated_at = now()
      where id = p_intent_id;
    return 'suppressed';
  end if;

  v_attempt := v.attempt_count + 1;

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

  insert into public.lifecycle_delivery_attempts (
    intent_id, organization_id, attempt_number, result, error_category,
    safe_summary, http_status, provider_message_id, duration_ms,
    next_retry_at, started_at, completed_at
  ) values (
    p_intent_id, v.organization_id, v_attempt, p_result, p_error_category,
    p_safe_summary, p_http_status, p_provider_message_id, p_duration_ms,
    case when v_final = 'pending' then v_next_at else null end, now(), now()
  );

  if v_final = 'delivered' then
    update public.lifecycle_delivery_intents set
      status = 'delivered', attempt_count = v_attempt, completed_at = now(),
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      last_error_category = null, updated_at = now()
      where id = p_intent_id;
  elsif v_final = 'pending' then
    update public.lifecycle_delivery_intents set
      status = 'pending', attempt_count = v_attempt, scheduled_at = v_next_at,
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      last_error_category = p_error_category, updated_at = now()
      where id = p_intent_id;
  else
    update public.lifecycle_delivery_intents set
      status = 'dead_letter', attempt_count = v_attempt, completed_at = now(),
      locked_at = null, locked_by_worker = null, lease_expires_at = null,
      last_error_category = p_error_category, updated_at = now()
      where id = p_intent_id;
  end if;

  return v_final;
end;
$$;

-- ---------------------------------------------------------------------------
-- expire_stale_lifecycle_leases: reclaim intents leased by crashed workers.
-- ---------------------------------------------------------------------------
create or replace function app.expire_stale_lifecycle_leases()
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_count integer;
begin
  update public.lifecycle_delivery_intents set
    status = 'pending', locked_at = null, locked_by_worker = null,
    lease_expires_at = null, updated_at = now()
    where status = 'processing' and locked_at is not null and lease_expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- cancel_lifecycle_intents: cancel pending intents that are no longer current
-- (step completed, preference disabled, member removed, cancellation
-- reversed, deletion canceled). Records the reason; never deletes rows.
-- ---------------------------------------------------------------------------
create or replace function app.cancel_lifecycle_intents(
  p_user_id uuid,
  p_message_keys text[],
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = public, app
as $$
declare
  v_count integer;
begin
  update public.lifecycle_delivery_intents set
    status = 'canceled',
    suppression_reason = coalesce(p_reason, 'Canceled'),
    completed_at = now(), updated_at = now()
    where user_id = p_user_id
      and status in ('pending', 'scheduled')
      and (p_message_keys is null or message_key = any (p_message_keys));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- reconcile_lifecycle_delivery: detect and optionally repair inconsistencies.
-- Dry-run by default. Bounded. Platform-admin only in the application layer.
-- ---------------------------------------------------------------------------
create or replace function app.reconcile_lifecycle_delivery(
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
  v_pending_no_attempt integer := 0;
begin
  select count(*) into v_stale_leases from public.lifecycle_delivery_intents
    where status = 'processing' and lease_expires_at < now();

  select count(*) into v_stuck_processing from public.lifecycle_delivery_intents
    where status = 'processing' and locked_at is null;

  select count(*) into v_pending_no_attempt from public.lifecycle_delivery_intents i
    where i.status in ('pending', 'scheduled') and i.attempt_count = 0
      and i.created_at < now() - interval '6 hours'
      and not exists (select 1 from public.lifecycle_delivery_attempts a where a.intent_id = i.id);

  if not p_dry_run then
    update public.lifecycle_delivery_intents set
      status = 'pending', locked_at = null, locked_by_worker = null,
      lease_expires_at = null, updated_at = now()
      where status = 'processing' and (lease_expires_at < now() or locked_at is null)
      and id in (
        select id from public.lifecycle_delivery_intents
        where status = 'processing' and (lease_expires_at < now() or locked_at is null)
        limit greatest(1, least(p_limit, 5000))
      );
  end if;

  return jsonb_build_object(
    'dry_run', p_dry_run,
    'stale_leases', v_stale_leases,
    'stuck_processing', v_stuck_processing,
    'pending_no_attempt', v_pending_no_attempt
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Public API wrappers. service_role only, matching the Phase 6/7/9 pattern.
-- ---------------------------------------------------------------------------
create or replace function public.create_lifecycle_intent(
  p_organization_id uuid, p_user_id uuid, p_message_key text, p_message_class text,
  p_template_version integer, p_dedup_key text, p_payload jsonb,
  p_scheduled_at timestamptz, p_related_type text default null, p_related_id uuid default null
)
returns uuid language sql security definer set search_path = public, app
as $$ select app.create_lifecycle_intent(p_organization_id, p_user_id, p_message_key,
  p_message_class, p_template_version, p_dedup_key, p_payload, p_scheduled_at,
  p_related_type, p_related_id); $$;

create or replace function public.lease_lifecycle_deliveries(
  p_worker text, p_max integer default 20, p_lease_seconds integer default 60
)
returns table (
  id uuid, organization_id uuid, user_id uuid, message_key text, message_class text,
  template_version integer, payload jsonb, attempt_count integer, max_attempts integer,
  related_type text, related_id uuid
)
language sql security definer set search_path = public, app
as $$ select * from app.lease_lifecycle_deliveries(p_worker, p_max, p_lease_seconds); $$;

create or replace function public.record_lifecycle_attempt(
  p_intent_id uuid, p_result text, p_error_category text, p_safe_summary text,
  p_http_status integer, p_provider_message_id text, p_duration_ms integer,
  p_suppression_reason text default null
)
returns text language sql security definer set search_path = public, app
as $$ select app.record_lifecycle_attempt(p_intent_id, p_result, p_error_category,
  p_safe_summary, p_http_status, p_provider_message_id, p_duration_ms, p_suppression_reason); $$;

create or replace function public.expire_stale_lifecycle_leases()
returns integer language sql security definer set search_path = public, app
as $$ select app.expire_stale_lifecycle_leases(); $$;

create or replace function public.cancel_lifecycle_intents(
  p_user_id uuid, p_message_keys text[], p_reason text
)
returns integer language sql security definer set search_path = public, app
as $$ select app.cancel_lifecycle_intents(p_user_id, p_message_keys, p_reason); $$;

create or replace function public.reconcile_lifecycle_delivery(
  p_dry_run boolean default true, p_limit integer default 500
)
returns jsonb language sql security definer set search_path = public, app
as $$ select app.reconcile_lifecycle_delivery(p_dry_run, p_limit); $$;

do $$
declare
  fn text;
begin
  for fn in
    select p.oid::regprocedure::text
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'create_lifecycle_intent', 'lease_lifecycle_deliveries',
      'record_lifecycle_attempt', 'expire_stale_lifecycle_leases',
      'cancel_lifecycle_intents', 'reconcile_lifecycle_delivery'
    )
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end;
$$;
