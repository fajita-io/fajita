-- Phase 10 billing RLS harness.
--
-- Verifies authenticated callers cannot read webhook inbox, checkout intents,
-- admin overrides, or reconciliation runs. Org admins see only their billing
-- rows. Runs inside a transaction that ROLLS BACK.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/phase10_billing_rls.sql

begin;

insert into public.user_profiles (id, external_id, primary_email, display_name)
values
  ('00000000-0000-0000-0000-00000000a101', 'clerk_p10_a', 'p10a@example.com', 'P10 A'),
  ('00000000-0000-0000-0000-00000000b101', 'clerk_p10_b', 'p10b@example.com', 'P10 B')
on conflict (id) do nothing;

insert into public.organizations (id, name, slug, owner_user_id)
values
  ('00000000-0000-0000-0000-00000000a100', 'P10 Org A', 'p10-org-a', '00000000-0000-0000-0000-00000000a101'),
  ('00000000-0000-0000-0000-00000000b100', 'P10 Org B', 'p10-org-b', '00000000-0000-0000-0000-00000000b101')
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role, status)
values
  ('00000000-0000-0000-0000-00000000a100', '00000000-0000-0000-0000-00000000a101', 'owner', 'active'),
  ('00000000-0000-0000-0000-00000000b100', '00000000-0000-0000-0000-00000000b101', 'owner', 'active')
on conflict do nothing;

insert into public.billing_customers (organization_id, stripe_customer_id)
values
  ('00000000-0000-0000-0000-00000000a100', 'cus_p10_a_fixture'),
  ('00000000-0000-0000-0000-00000000b100', 'cus_p10_b_fixture')
on conflict (organization_id) do nothing;

insert into public.billing_subscriptions (
  organization_id, stripe_subscription_id, stripe_customer_id, plan_key, billing_interval, status, access_state
)
values
  ('00000000-0000-0000-0000-00000000a100', 'sub_p10_a_fixture', 'cus_p10_a_fixture', 'starter', 'month', 'active', 'active'),
  ('00000000-0000-0000-0000-00000000b100', 'sub_p10_b_fixture', 'cus_p10_b_fixture', 'starter', 'month', 'active', 'active')
on conflict (stripe_subscription_id) do nothing;

insert into public.billing_webhook_events (
  stripe_event_id, event_type, status, summary, received_at
)
values
  (
    'evt_p10_fixture_rls',
    'customer.subscription.updated',
    'processed',
    '{}'::jsonb,
    now()
  )
on conflict (stripe_event_id) do nothing;

create or replace function pg_temp.assert(cond boolean, label text)
returns void language plpgsql as $$
begin
  if not cond then raise exception 'RLS ASSERT FAILED: %', label; end if;
end;
$$;

-- User A sees own billing customer, not org B.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"clerk_p10_a"}', true);

select pg_temp.assert(
  (select count(*) from public.billing_customers) = 1,
  'billing_customers tenant isolation'
);

select pg_temp.assert(
  (select count(*) from public.billing_subscriptions) = 1,
  'billing_subscriptions tenant isolation'
);

-- Webhook inbox: deny-by-default for authenticated.
select pg_temp.assert(
  (select count(*) from public.billing_webhook_events) = 0,
  'billing_webhook_events deny authenticated'
);

select pg_temp.assert(
  (select count(*) from public.billing_checkout_intents) = 0,
  'billing_checkout_intents deny authenticated'
);

select pg_temp.assert(
  (select count(*) from public.billing_admin_overrides) = 0,
  'billing_admin_overrides deny authenticated'
);

select pg_temp.assert(
  (select count(*) from public.billing_reconciliation_runs) = 0,
  'billing_reconciliation_runs deny authenticated'
);

rollback;
