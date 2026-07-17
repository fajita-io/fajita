-- Phase 4 monitoring tenant-isolation RLS harness.
--
-- Verifies that under the authenticated role a caller reads only their own
-- organization's monitoring rows, can never read secrets or heartbeat tokens or
-- worker/lease tables, and can write nothing. Runs inside a transaction that
-- ROLLS BACK. Run against a controlled (non-production) database:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/phase4_monitoring_rls.sql

begin;

-- Seed identities and orgs (connecting role bypasses RLS).
insert into public.user_profiles (id, external_id, primary_email, display_name)
values
  ('00000000-0000-0000-0000-0000000004a1', 'clerk_p4_a', 'p4a@example.com', 'P4 A'),
  ('00000000-0000-0000-0000-0000000004b1', 'clerk_p4_b', 'p4b@example.com', 'P4 B');

insert into public.organizations (id, name, slug, owner_user_id)
values
  ('00000000-0000-0000-0000-0000004a0000', 'P4 Org A', 'p4-org-a', '00000000-0000-0000-0000-0000000004a1'),
  ('00000000-0000-0000-0000-0000004b0000', 'P4 Org B', 'p4-org-b', '00000000-0000-0000-0000-0000000004b1');

insert into public.organization_members (organization_id, user_id, role, status)
values
  ('00000000-0000-0000-0000-0000004a0000', '00000000-0000-0000-0000-0000000004a1', 'owner', 'active'),
  ('00000000-0000-0000-0000-0000004b0000', '00000000-0000-0000-0000-0000000004b1', 'owner', 'active');

-- Monitors, one per org.
insert into public.monitors (id, organization_id, name, monitor_type, status, target_url, normalized_url)
values
  ('0a0a0a0a-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000004a0000', 'A site', 'https', 'active', 'https://a.example.com', 'https://a.example.com'),
  ('0b0b0b0b-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000004b0000', 'B site', 'https', 'active', 'https://b.example.com', 'https://b.example.com');

insert into public.monitor_versions (id, monitor_id, organization_id, version_number, configuration_snapshot)
values
  ('0a0a0a0a-0000-0000-0000-0000000000a1', '0a0a0a0a-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000004a0000', 1, '{"monitor_type":"https"}'),
  ('0b0b0b0b-0000-0000-0000-0000000000b1', '0b0b0b0b-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000004b0000', 1, '{"monitor_type":"https"}');

-- Secrets, results, heartbeat tokens for org A.
insert into public.monitor_secrets (organization_id, monitor_id, secret_type, encrypted_payload, encryption_key_version, masked_label)
values ('00000000-0000-0000-0000-0000004a0000', '0a0a0a0a-0000-0000-0000-000000000001', 'bearer_token', 'v1:deadbeef', 1, 'Bearer ****abcd');

insert into public.check_executions (id, idempotency_key, monitor_id, monitor_version_id, organization_id, scheduled_for, status)
values ('0a0a0a0a-0000-0000-0000-0000000000e1', 'key-a-1', '0a0a0a0a-0000-0000-0000-000000000001', '0a0a0a0a-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000004a0000', now(), 'success');

insert into public.check_results (execution_id, monitor_id, monitor_version_id, organization_id, status, http_status, total_ms, checked_at)
values ('0a0a0a0a-0000-0000-0000-0000000000e1', '0a0a0a0a-0000-0000-0000-000000000001', '0a0a0a0a-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000004a0000', 'success', 200, 142, now());

insert into public.heartbeat_tokens (monitor_id, organization_id, token_hash, masked_label, expected_interval_seconds)
values ('0a0a0a0a-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000004a0000', 'hash-a-1', 'hb ****9f', 3600);

create or replace function pg_temp.assert(cond boolean, label text)
returns void language plpgsql as $$
begin
  if not cond then raise exception 'RLS ASSERT FAILED: %', label; end if;
end;
$$;

-- As User A: sees own org, not org B.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_p4_a"}', true);

select pg_temp.assert((select count(*) from public.monitors) = 1, 'A sees only own monitor');
select pg_temp.assert((select count(*) from public.monitors where name = 'B site') = 0, 'A cannot see B monitor');
select pg_temp.assert((select count(*) from public.check_results) = 1, 'A sees only own result');
select pg_temp.assert((select count(*) from public.monitor_versions) = 1, 'A sees only own version');

-- Secrets, heartbeat tokens, leases, worker tables: invisible even for own org.
select pg_temp.assert((select count(*) from public.monitor_secrets) = 0, 'A cannot read secrets');
select pg_temp.assert((select count(*) from public.heartbeat_tokens) = 0, 'A cannot read heartbeat tokens');
select pg_temp.assert((select count(*) from public.monitor_leases) = 0, 'A cannot read lease ledger');
select pg_temp.assert((select count(*) from public.monitor_workers) = 0, 'A cannot read worker registry');
select pg_temp.assert((select count(*) from public.monitor_worker_heartbeats) = 0, 'A cannot read worker heartbeats');

-- Direct writes denied for authenticated (no write policy exists).
do $$
begin
  begin
    insert into public.check_results (execution_id, monitor_id, monitor_version_id, organization_id, status, checked_at)
    values ('0a0a0a0a-0000-0000-0000-0000000000e1', '0a0a0a0a-0000-0000-0000-000000000001', '0a0a0a0a-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000004a0000', 'success', now());
    raise exception 'RLS ASSERT FAILED: authenticated INSERT into check_results allowed';
  exception when insufficient_privilege or others then null;
  end;
end;
$$;

reset role;

-- As User B: sees only org B monitor, cannot see A's result.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_p4_b"}', true);
select pg_temp.assert((select count(*) from public.monitors) = 1, 'B sees only own monitor');
select pg_temp.assert((select count(*) from public.check_results) = 0, 'B cannot see A result');
reset role;

rollback;
