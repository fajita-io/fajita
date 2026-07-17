-- Phase 10: row-level security for billing tables.
--
-- Model matches Phase 3: every write happens through server actions that
-- authorize in code and use the service-role connection (bypasses RLS). RLS is
-- defense-in-depth read isolation. Customers can read only their own
-- organizations' billing rows, and only at the right role; customers can write
-- nothing. Sensitive operational tables (webhook events, admin overrides,
-- checkout intents, reconciliation) have no customer-facing policy at all and
-- are reachable only by the service role.

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_checkout_intents enable row level security;
alter table public.billing_webhook_events enable row level security;
alter table public.billing_entitlement_snapshots enable row level security;
alter table public.billing_usage_counters enable row level security;
alter table public.billing_payment_events enable row level security;
alter table public.billing_grace_periods enable row level security;
alter table public.billing_cancellation_records enable row level security;
alter table public.billing_downgrade_plans enable row level security;
alter table public.billing_admin_overrides enable row level security;
alter table public.billing_reconciliation_runs enable row level security;

-- ---------------------------------------------------------------------------
-- Sensitive billing records: readable by org admins/owners only. Members do
-- not see subscription pricing, invoices, or the Stripe customer mapping.
-- ---------------------------------------------------------------------------
drop policy if exists billing_customers_select on public.billing_customers;
create policy billing_customers_select on public.billing_customers
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

drop policy if exists billing_subscriptions_select on public.billing_subscriptions;
create policy billing_subscriptions_select on public.billing_subscriptions
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

drop policy if exists billing_payment_events_select on public.billing_payment_events;
create policy billing_payment_events_select on public.billing_payment_events
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

drop policy if exists billing_grace_periods_select on public.billing_grace_periods;
create policy billing_grace_periods_select on public.billing_grace_periods
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

drop policy if exists billing_cancellation_records_select on public.billing_cancellation_records;
create policy billing_cancellation_records_select on public.billing_cancellation_records
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

drop policy if exists billing_downgrade_plans_select on public.billing_downgrade_plans;
create policy billing_downgrade_plans_select on public.billing_downgrade_plans
  for select to authenticated
  using (app.has_org_role(organization_id, 'admin'));

-- ---------------------------------------------------------------------------
-- Usage counters and current entitlement snapshot: readable by any active
-- member so limit-state UI works. They carry counts and feature flags, never
-- pricing or Stripe identifiers.
-- ---------------------------------------------------------------------------
drop policy if exists billing_usage_counters_select on public.billing_usage_counters;
create policy billing_usage_counters_select on public.billing_usage_counters
  for select to authenticated
  using (app.is_org_member(organization_id));

drop policy if exists billing_entitlement_snapshots_select on public.billing_entitlement_snapshots;
create policy billing_entitlement_snapshots_select on public.billing_entitlement_snapshots
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- No customer policies for: billing_checkout_intents, billing_webhook_events,
-- billing_admin_overrides, billing_reconciliation_runs. RLS is enabled with no
-- policy, so authenticated/anon callers read nothing; only the service role
-- (used by webhook processing and platform-admin tooling) can touch them.
-- ---------------------------------------------------------------------------
