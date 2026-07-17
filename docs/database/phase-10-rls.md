# Phase 10 row-level security

Migration: `20260724000100_phase10_billing_rls.sql`.

The model matches Phase 3. Every write happens through server actions that
authorize in code and use the service-role connection (which bypasses RLS).
RLS here is defense-in-depth read isolation: customers read only their own
organizations' billing rows, at the right role, and write nothing.

RLS is enabled on all twelve Phase 10 tables.

## Admin/owner read (sensitive: pricing, invoices, Stripe mapping)

Readable only when `app.has_org_role(organization_id, 'admin')`, so ordinary
members never see pricing, invoices, or the Stripe customer id:

- `billing_customers`
- `billing_subscriptions`
- `billing_payment_events`
- `billing_grace_periods`
- `billing_cancellation_records`
- `billing_downgrade_plans`

## Member read (counts and feature flags only)

Readable by any active member via `app.is_org_member(organization_id)` so the
limit-state UI works. These carry counts and boolean feature flags, never
pricing or Stripe identifiers:

- `billing_usage_counters`
- `billing_entitlement_snapshots`

## Service-role only (no customer policy)

RLS is enabled with no policy, so authenticated and anon callers read nothing.
Only the service role (webhook processing and platform-admin tooling) can touch
them:

- `billing_checkout_intents`
- `billing_webhook_events`
- `billing_admin_overrides`
- `billing_reconciliation_runs`

## What customers can never do

No customer policy grants insert, update, or delete on any billing table.
Customers cannot write subscription status, invoice state, entitlement
snapshots, grace periods, refund records, webhook status, or Stripe customer
ids, and cannot attach another organization's subscription. All mutations are
service-role writes behind authorized server actions.
