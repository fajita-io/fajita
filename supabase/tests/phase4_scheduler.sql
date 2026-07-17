-- Phase 4 scheduler and idempotency harness.
--
-- Exercises the restricted worker functions end to end: register, lease due
-- work with SKIP LOCKED, finalize idempotently (duplicate delivery is a no-op),
-- schedule advancement, and stale-lease recovery. Transactional; ROLLS BACK.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/phase4_scheduler.sql

begin;

insert into public.user_profiles (id, external_id, primary_email, display_name)
values ('cccc0000-0000-0000-0000-0000000000a1', 'clerk_p4_c', 'p4c@example.com', 'P4 C');

insert into public.organizations (id, name, slug, owner_user_id, status)
values ('cccc0000-0000-0000-0000-000000000001', 'P4 Org C', 'p4-org-c', 'cccc0000-0000-0000-0000-0000000000a1', 'active');

insert into public.monitors (id, organization_id, name, monitor_type, status, target_url, normalized_url, check_interval_seconds)
values ('cccc0000-0000-0000-0000-000000000010', 'cccc0000-0000-0000-0000-000000000001', 'C site', 'https', 'active', 'https://c.example.com', 'https://c.example.com', 300);

insert into public.monitor_versions (id, monitor_id, organization_id, version_number, configuration_snapshot)
values ('cccc0000-0000-0000-0000-000000000011', 'cccc0000-0000-0000-0000-000000000010', 'cccc0000-0000-0000-0000-000000000001', 1, '{"monitor_type":"https","target_url":"https://c.example.com"}');

update public.monitors set current_version_id = 'cccc0000-0000-0000-0000-000000000011'
  where id = 'cccc0000-0000-0000-0000-000000000010';

insert into public.check_schedules (monitor_id, organization_id, monitor_version_id, interval_seconds, next_check_at)
values ('cccc0000-0000-0000-0000-000000000010', 'cccc0000-0000-0000-0000-000000000001', 'cccc0000-0000-0000-0000-000000000011', 300, now() - interval '5 seconds');

do $$
declare
  v_worker uuid;
  v_row record;
  v_key text;
  v_sched timestamptz;
  v_exec uuid;
  v_exec2 uuid;
  v_count integer;
  v_reclaimed integer;
begin
  -- Register a worker.
  v_worker := app.worker_register('p4-test-worker', 'us-east', 'v0.0.0', 'testcommit', 'deploy-1', 1, 10);
  if v_worker is null then raise exception 'SCHED ASSERT FAILED: worker_register returned null'; end if;

  -- Lease due work.
  select * into v_row from app.lease_due_checks(v_worker, 'us-east', 10, 60) limit 1;
  if v_row.monitor_id is null then raise exception 'SCHED ASSERT FAILED: no due work leased'; end if;
  v_key := v_row.idempotency_key;
  v_sched := v_row.scheduled_for;

  -- Schedule must now be locked.
  if (select count(*) from public.check_schedules
      where monitor_id = 'cccc0000-0000-0000-0000-000000000010' and locked_at is not null) <> 1 then
    raise exception 'SCHED ASSERT FAILED: schedule not locked after lease';
  end if;

  -- A second lease pass finds nothing (locked row skipped).
  if (select count(*) from app.lease_due_checks(v_worker, 'us-east', 10, 60)) <> 0 then
    raise exception 'SCHED ASSERT FAILED: locked schedule was leased again';
  end if;

  -- Lease ledger has the idempotency key.
  if (select count(*) from public.monitor_leases where idempotency_key = v_key) <> 1 then
    raise exception 'SCHED ASSERT FAILED: lease ledger missing key';
  end if;

  -- Finalize.
  v_exec := app.finalize_check(
    v_key, 'cccc0000-0000-0000-0000-000000000010', 'cccc0000-0000-0000-0000-000000000011',
    'cccc0000-0000-0000-0000-000000000001', v_worker, 'us-east',
    v_sched, now(), now(), now(), 1, 'success', 'completed', null,
    200, 'https://c.example.com', 0, 1024, 5, 10, 15, 20, 120,
    '{"tls_version":"1.3"}'::jsonb, null, null, '[]'::jsonb, gen_random_uuid(), false,
    v_sched + interval '300 seconds');
  if v_exec is null then raise exception 'SCHED ASSERT FAILED: finalize returned null'; end if;

  -- Duplicate delivery: same key returns same execution, writes nothing new.
  v_exec2 := app.finalize_check(
    v_key, 'cccc0000-0000-0000-0000-000000000010', 'cccc0000-0000-0000-0000-000000000011',
    'cccc0000-0000-0000-0000-000000000001', v_worker, 'us-east',
    v_sched, now(), now(), now(), 1, 'success', 'completed', null,
    200, 'https://c.example.com', 0, 1024, 5, 10, 15, 20, 120,
    '{"tls_version":"1.3"}'::jsonb, null, null, '[]'::jsonb, gen_random_uuid(), false,
    v_sched + interval '300 seconds');
  if v_exec2 <> v_exec then raise exception 'SCHED ASSERT FAILED: duplicate finalize created new execution'; end if;

  select count(*) into v_count from public.check_executions where idempotency_key = v_key;
  if v_count <> 1 then raise exception 'SCHED ASSERT FAILED: duplicate execution rows (%).', v_count; end if;

  select count(*) into v_count from public.check_results where execution_id = v_exec;
  if v_count <> 1 then raise exception 'SCHED ASSERT FAILED: expected exactly one result (%).', v_count; end if;

  -- Schedule advanced and unlocked.
  if (select count(*) from public.check_schedules
      where monitor_id = 'cccc0000-0000-0000-0000-000000000010'
        and locked_at is null
        and next_check_at > now()) <> 1 then
    raise exception 'SCHED ASSERT FAILED: schedule not advanced/unlocked after finalize';
  end if;

  -- Monitor head runtime updated.
  if (select consecutive_successes from public.monitors where id = 'cccc0000-0000-0000-0000-000000000010') <> 1 then
    raise exception 'SCHED ASSERT FAILED: monitor consecutive_successes not incremented';
  end if;

  -- Stale-lease recovery: simulate a crashed worker holding an expired lease.
  update public.check_schedules set
    locked_at = now() - interval '2 minutes',
    locked_by_worker_id = v_worker,
    lease_expires_at = now() - interval '1 minute'
  where monitor_id = 'cccc0000-0000-0000-0000-000000000010';

  v_reclaimed := app.expire_stale_leases();
  if v_reclaimed < 1 then raise exception 'SCHED ASSERT FAILED: expired lease not reclaimed'; end if;
  if (select count(*) from public.check_schedules
      where monitor_id = 'cccc0000-0000-0000-0000-000000000010' and locked_at is not null) <> 0 then
    raise exception 'SCHED ASSERT FAILED: schedule still locked after expiry';
  end if;

  raise notice 'PHASE 4 SCHEDULER TESTS PASSED';
end;
$$;

rollback;
