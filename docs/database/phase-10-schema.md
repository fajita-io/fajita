# Phase 10 database schema

Migration: `20260724000000_phase10_billing_schema.sql`. RLS in
`20260724000100_phase10_billing_rls.sql` (see `phase-10-rls.md`).

Billing belongs to the organization, not the user. Stripe is the source of
truth for payment, invoice, and subscription status. These tables are the
normalized in-app cache that entitlement checks and the billing UI read, so
product requests never call Stripe. The webhook processor and (future)
reconciliation job are the only writers, all through the service role.

The Phase 0.5 user-keyed scaffolding (`billing_accounts`,
`billing_subscriptions`) is dropped here. It held no data and no product code
read it. Its Phase 3 select policies drop with the tables.

## Tables

- `billing_customers` one Stripe customer per organization
  (`organization_id` PK, `stripe_customer_id` unique). Holds billing email,
  billing name, and a `tax_id_present` flag. No card data.
- `billing_subscriptions` the org subscription cached from Stripe. Internal
  `status` (state machine) and `access_state` (`none` / `active` /
  `grace_period` / `restricted` / `canceled`), `plan_key`
  (`starter` / `pro` / `business`), `billing_interval`, `recurring_amount_cents`,
  `currency`, period bounds, `cancel_at_period_end`, `cancellation_effective_at`,
  and `stripe_updated_at` (out-of-order guard). A partial unique index
  (`billing_subscriptions_one_live_idx`) enforces at most one live subscription
  per org, which is the core duplicate-subscription prevention at the data layer.
- `billing_checkout_intents` short-lived record of an initiated checkout.
  `status` in `pending` / `checkout_created` / `completed` / `expired` /
  `canceled` / `replaced` / `failed`, with `expires_at`. Unique on the Stripe
  checkout session id.
- `billing_webhook_events` bounded inbox keyed by `stripe_event_id` (PK). Stores
  event type, object id, api version, livemode, `status`
  (`received` / `processing` / `processed` / `failed` / `ignored` /
  `dead_letter`), attempts, and a small `summary` jsonb. No raw payloads.
- `billing_entitlement_snapshots` versioned, reproducible entitlement state.
  One `current` row per org (partial unique index) plus historical rows for
  audit and reproduction. Stores `entitlement_version`, `access_state`, and the
  full `entitlements` jsonb.
- `billing_usage_counters` one row per org with resource counts (active/total
  monitors, team members, pending invitations, status pages, custom domains,
  alert channels, alert rules, confirmed subscribers) plus `rebuilt_at`.
- `billing_payment_events` normalized invoice and payment history
  (`paid` / `failed` / `action_required` / `refunded` / `partially_refunded` /
  `finalized`), amount, currency, hosted invoice url, invoice pdf url. Deduped
  on `(stripe_invoice_id, kind)`.
- `billing_grace_periods` payment-failure recovery windows. `status` in
  `open` / `resolved` / `restricted`, with `restriction_at`. Partial unique
  index enforces one active window per org.
- `billing_cancellation_records` cancellation intent, optional reason and
  feedback, `effective_at`, and `status` (`scheduled` / `effective` /
  `reactivated`).
- `billing_downgrade_plans` scheduled downgrades and compliance selections
  (`from_plan_key`, `to_plan_key`, `effective_at`, `selections` jsonb, status).
- `billing_admin_overrides` tightly controlled, expiring entitlement overrides
  (`entitlement_key`, `override_value` jsonb, `reason`, `reference`,
  `effective_at`, `expires_at`).
- `billing_reconciliation_runs` audit of Stripe/Fajita reconciliation
  (dry-run flag, counts, `report` jsonb).

## Money

All amounts are integer minor units (cents) with an explicit `currency`
column defaulting to `usd`. No floating-point money anywhere.

## Deletion

Every org-scoped table is `on delete cascade` from `organizations`, except
`created_by` / `requested_by` user references which are `set null` so billing
history survives a member leaving. Legally required billing history lives in
Stripe and is not deleted with product data.
