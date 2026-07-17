# Billing system architecture

Phase 10 converts Fajita into a paid SaaS on Stripe while keeping Fajita's
organization, permission, and RLS model as the product authority. Stripe owns
money and payment state; Fajita owns product access.

## Sources of truth

Stripe is authoritative for: customer payment method, charge status, invoice
status, Stripe subscription status, price, discount, refund, dispute, and tax.

Fajita is authoritative for: organization access, internal plan key, product
entitlements, feature limits, grace-period behavior, resource counts, downgrade
compliance, product access state, billing notifications, and public product
behavior.

Product access is never computed from browser-visible Stripe responses or from
a checkout success redirect. It is derived from verified server-side billing
state written by signed webhooks.

## Module map

- `src/lib/stripe/plans.ts` approved plan keys and Stripe lookup keys.
- `src/lib/stripe/server.ts` Stripe client singleton.
- `src/lib/billing/catalog.ts` plan identity, typed entitlements, pricing.
- `src/lib/billing/subscription-state.ts` internal state machine (pure).
- `src/lib/billing/grace-period.ts` payment-failure recovery policy (pure).
- `src/lib/billing/mrr.ts` MRR/ARR calculation (pure).
- `src/lib/billing/engine.ts` entitlement resolution, snapshots, reads.
- `src/lib/billing/customers.ts` one Stripe customer per org (idempotent).
- `src/lib/billing/checkout.ts` checkout intents + Checkout Session creation.
- `src/lib/billing/portal.ts` Customer Portal session creation.
- `src/lib/billing/webhook-processor.ts` idempotent event processing.
- `src/lib/billing/usage.ts` rebuildable usage counters.
- `src/lib/app/actions/billing.ts` authorized server actions (checkout, portal,
  change plan, cancel, reactivate).
- `src/lib/monitoring/entitlements.server.ts` projection onto monitor limits.

## Data model

Org-scoped tables cache normalized billing state so product requests never call
Stripe. See `docs/database/phase-10-schema.md` and `phase-10-rls.md`.

## Request flows

### Checkout

1. Client calls `startCheckoutAction(orgId, planKey, interval)`.
2. Server authenticates, checks `billing:manage`, resolves the active org,
   and blocks if a live subscription exists (also enforced by a partial unique
   index at the database layer).
3. Server records a `billing_checkout_intents` row, gets or creates the org
   Stripe customer, resolves the immutable price by lookup key, and creates a
   Stripe Checkout Session with safe metadata (org id, intent id, plan key).
4. Client is redirected to Stripe. On return, `/billing/checkout/success`
   shows a pending state and polls until the webhook-verified subscription is
   active. The success URL is never treated as authorization.

### Webhook

`/api/webhooks/stripe` verifies the signature against the raw body
(`constructStripeEvent`) and hands the event to `processStripeWebhookEvent`,
which records the event in the inbox (unique on `stripe_event_id`), skips
duplicates, dispatches handled events, recalculates the entitlement snapshot,
and marks the outcome. Unhandled events are acknowledged and ignored. Failures
return 500 without leaking internal detail, so Stripe retries.

Handled events: `checkout.session.completed`, `checkout.session.expired`,
`customer.subscription.created/updated/deleted`, `invoice.paid`,
`invoice.payment_failed`, `invoice.finalized`, `charge.refunded`.

### Enforcement

Server actions and workers read entitlements through `getOrgEntitlements`,
which serves the current snapshot (falling back to a live compute). Monitor
limits, check interval, team seats, alert channels, status pages, custom
domains, subscriber caps, retention, and powered-by removal all resolve from
this one path. Frontend gating is only a convenience; the server is the gate.

## Payment failure and recovery

`invoice.payment_failed` opens a grace period and recalculates entitlements.
The grace policy (`grace-period.md`) warns first, then blocks new resource
creation, then restricts (monitoring paused, all data preserved and readable).
`invoice.paid` resolves the grace period and restores entitlements. Public
status pages never expose payment state and never claim "all systems
operational" from stale data.

## Deferred to later phases

Reconciliation job execution, platform-admin billing dashboard, refund admin
UI, dispute evidence workflow, downgrade-compliance UI, Stripe Tax enablement,
promotion codes, trials, billing emails delivery, internal billing lab, and
load tests are scaffolded or documented as policy but not fully shipped in this
slice. See `docs/handoff/phase-10-handoff.md` for the exact status.
