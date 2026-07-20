-- Check volume enforcement: org at limit does not lease scheduled work.
-- Transactional; ROLLS BACK.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/check_volume_enforcement.sql

begin;

insert into public.user_profiles (id, external_id, primary_email, display_name)
values ('dddd0000-0000-0000-0000-0000000000a1', 'clerk_cv_c', 'cvc@example.com', 'CV C');

insert into public.organizations (id, name, slug, owner_user_id, status)
values ('dddd0000-0000-0000-0000-000000000001', 'CV Org', 'cv-org', 'dddd0000-0000-0000-0000-0000000000a1', 'active');

insert into public.billing_entitlement_snapshots (
  organization_id, plan_key, entitlement_version, access_state, entitlements, source
) values (
  'dddd0000-0000-0000-0000-000000000001',
  'starter',
  2,
  'active',
  '{"monitoring_enabled":true,"max_monthly_checks":2,"max_active_monitors":10}'::jsonb,
  'current'
);

insert into public.billing_usage_counters (
  organization_id, checks_this_period, checks_period_start, checks_period_end
) values (
  'dddd0000-0000-0000-0000-000000000001',
  2,
  date_trunc('month', timezone('utc', now())),
  date_trunc('month', timezone('utc', now())) + interval '1 month'
);

insert into public.monitors (id, organization_id, name, monitor_type, status, target_url, normalized_url, check_interval_seconds)
values ('dddd0000-0000-0000-0000-000000000010', 'dddd0000-0000-0000-0000-000000000001', 'CV site', 'https', 'active', 'https://cv.example.com', 'https://cv.example.com', 300);

insert into public.monitor_versions (id, monitor_id, organization_id, version_number, configuration_snapshot)
values ('dddd0000-0000-0000-0000-000000000011', 'dddd0000-0000-0000-0000-000000000010', 'dddd0000-0000-0000-0000-000000000001', 1, '{"monitor_type":"https","target_url":"https://cv.example.com"}');

update public.monitors set current_version_id = 'dddd0000-0000-0000-0000-000000000011'
  where id = 'dddd0000-0000-0000-0000-000000000010';

insert into public.check_schedules (monitor_id, organization_id, monitor_version_id, interval_seconds, next_check_at)
values ('dddd0000-0000-0000-0000-000000000010', 'dddd0000-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000011', 300, now() - interval '5 seconds');

do $$
declare
  v_worker uuid;
  v_leased integer;
begin
  if not app.org_at_check_limit('dddd0000-0000-0000-0000-000000000001') then
    raise exception 'CHECK LIMIT ASSERT FAILED: org should be at check limit';
  end if;

  v_worker := app.worker_register('cv-test-worker', 'us-east', 'v0.0.0', 'testcommit', 'deploy-cv', 1, 10);

  select count(*) into v_leased
  from app.lease_due_checks(v_worker, 'us-east', 10, 60);

  if v_leased <> 0 then
    raise exception 'CHECK LIMIT ASSERT FAILED: leased % rows while at limit', v_leased;
  end if;

  raise notice 'CHECK VOLUME ENFORCEMENT TESTS PASSED';
end;
$$;

rollback;
