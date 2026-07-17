-- Phase 11 follow-up: give record_lifecycle_attempt's optional parameters
-- explicit null defaults so callers (and the generated client types) can omit
-- them. Same behavior, same signature types; forward-only.

create or replace function app.record_lifecycle_attempt(
  p_intent_id uuid,
  p_result text,
  p_error_category text default null,
  p_safe_summary text default null,
  p_http_status integer default null,
  p_provider_message_id text default null,
  p_duration_ms integer default null,
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

create or replace function public.record_lifecycle_attempt(
  p_intent_id uuid, p_result text, p_error_category text default null,
  p_safe_summary text default null, p_http_status integer default null,
  p_provider_message_id text default null, p_duration_ms integer default null,
  p_suppression_reason text default null
)
returns text language sql security definer set search_path = public, app
as $$ select app.record_lifecycle_attempt(p_intent_id, p_result, p_error_category,
  p_safe_summary, p_http_status, p_provider_message_id, p_duration_ms, p_suppression_reason); $$;

-- Re-assert restricted execution after replace.
revoke all on function public.record_lifecycle_attempt(uuid, text, text, text, integer, text, integer, text)
  from public, anon, authenticated;
grant execute on function public.record_lifecycle_attempt(uuid, text, text, text, integer, text, integer, text)
  to service_role;
