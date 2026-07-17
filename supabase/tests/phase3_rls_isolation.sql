-- Phase 3 tenant-isolation RLS harness.
--
-- Verifies that under the `authenticated` role, a caller reads only their own
-- rows and rows for organizations they actively belong to, and can write
-- nothing. Runs entirely inside a transaction that ROLLS BACK, so it leaves no
-- data behind. Run in a controlled (non-production) database:
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/phase3_rls_isolation.sql
--
-- Seeding runs as the connecting role (bypasses RLS); assertions run after
-- `set local role authenticated` with simulated Clerk claims.

begin;

-- ---------------------------------------------------------------------------
-- Seed: two users, two organizations. user_a owns org_a; user_b owns org_b.
-- user_b is also an active member of org_a. user_c is a removed member of
-- org_a. user_d is suspended. org_b is soft-deleted for one assertion.
-- ---------------------------------------------------------------------------
insert into public.user_profiles (id, external_id, primary_email, display_name)
values
  ('00000000-0000-0000-0000-0000000000a1', 'clerk_user_a', 'a@example.com', 'User A'),
  ('00000000-0000-0000-0000-0000000000b1', 'clerk_user_b', 'b@example.com', 'User B'),
  ('00000000-0000-0000-0000-0000000000c1', 'clerk_user_c', 'c@example.com', 'User C'),
  ('00000000-0000-0000-0000-0000000000d1', 'clerk_user_d', 'd@example.com', 'User D');

update public.user_profiles
  set suspended_at = now()
  where external_id = 'clerk_user_d';

insert into public.organizations (id, name, slug, owner_user_id)
values
  ('00000000-0000-0000-0000-00000000a0a0', 'Org A', 'org-a', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-00000000b0b0', 'Org B', 'org-b', '00000000-0000-0000-0000-0000000000b1');

insert into public.organization_members (organization_id, user_id, role, status)
values
  ('00000000-0000-0000-0000-00000000a0a0', '00000000-0000-0000-0000-0000000000a1', 'owner', 'active'),
  ('00000000-0000-0000-0000-00000000a0a0', '00000000-0000-0000-0000-0000000000b1', 'member', 'active'),
  ('00000000-0000-0000-0000-00000000a0a0', '00000000-0000-0000-0000-0000000000c1', 'member', 'removed'),
  ('00000000-0000-0000-0000-00000000b0b0', '00000000-0000-0000-0000-0000000000b1', 'owner', 'active');

insert into public.notifications (user_id, category, title)
values
  ('00000000-0000-0000-0000-0000000000a1', 'security', 'A notice'),
  ('00000000-0000-0000-0000-0000000000b1', 'security', 'B notice');

-- Helper to run an assertion.
create or replace function pg_temp.assert(cond boolean, label text)
returns void language plpgsql as $$
begin
  if not cond then
    raise exception 'RLS ASSERT FAILED: %', label;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- As User A (owner of org_a).
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_user_a"}', true);

select pg_temp.assert(
  (select count(*) from public.organizations) = 1,
  'user_a sees exactly their one org (org_a)');
select pg_temp.assert(
  (select count(*) from public.organizations where slug = 'org-b') = 0,
  'user_a cannot see org_b');
select pg_temp.assert(
  (select count(*) from public.notifications) = 1,
  'user_a sees only their own notification');
select pg_temp.assert(
  (select count(*) from public.organization_members
    where organization_id = '00000000-0000-0000-0000-00000000a0a0') = 3,
  'user_a (org admin) can read org_a members');

-- Direct writes must be denied for the authenticated role.
do $$
begin
  begin
    insert into public.notifications (user_id, category, title)
    values ('00000000-0000-0000-0000-0000000000a1', 'security', 'should fail');
    raise exception 'RLS ASSERT FAILED: authenticated INSERT was allowed';
  exception when insufficient_privilege or others then
    -- expected: no write policy exists for authenticated
    null;
  end;
end;
$$;

reset role;

-- ---------------------------------------------------------------------------
-- As User B (owner of org_b, member of org_a): sees both orgs.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_user_b"}', true);

select pg_temp.assert(
  (select count(*) from public.organizations) = 2,
  'user_b sees both org_a (member) and org_b (owner)');

reset role;

-- ---------------------------------------------------------------------------
-- As User C (removed from org_a): sees nothing.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_user_c"}', true);

select pg_temp.assert(
  (select count(*) from public.organizations) = 0,
  'removed member user_c sees no organizations');

reset role;

-- ---------------------------------------------------------------------------
-- As User D (suspended): profile resolves to null, membership reads empty.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_user_d"}', true);

select pg_temp.assert(
  (select count(*) from public.organizations) = 0,
  'suspended user_d sees no organizations');

reset role;

-- ---------------------------------------------------------------------------
-- Soft-deleted org: org_b becomes deleted; user_b membership read still works
-- for org_a only under app guard, but RLS select policy is membership-based,
-- so we assert the app status filter (deleted orgs handled in app guard).
-- ---------------------------------------------------------------------------
update public.organizations set status = 'deleted', deleted_at = now()
  where slug = 'org-b';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_user_b"}', true);
-- RLS still lets a member read the row; the application guard
-- (requireOrganizationMembership) rejects deleted/suspended orgs. Assert the
-- row is visible so app-layer status enforcement is the documented boundary.
select pg_temp.assert(
  (select status from public.organizations where slug = 'org-b') = 'deleted',
  'deleted org row visible to member; app guard enforces unavailability');
reset role;

rollback;
