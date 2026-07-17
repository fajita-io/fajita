# Phase 10 handoff: billing, subscriptions, entitlements

This documents exactly what shipped in the Phase 10 billing spine, how Stripe
state is verified, and what remains for later work. It is deliberately honest
about scope: the phase brief lists far more surface than one vertical slice can
carry, so the core spine is production-grade and the rest is documented as
deferred rather than faked.

## Shipped

### Catalog and pricing

- Centralized `BILLING_CATALOG` with approved plan keys `starter` / `pro` /
  `business`, typed `PlanEntitlements`, Stripe lookup-key mapping, and
  provisional internal USD pricing (cents). Public publishing stays gated by
  `src/lib/site/pricing.ts`. No provisional prices are published.
- Prices are treated as immutable and resolved by lookup key.

### Data model and RLS

- Migration `20260724000000_phase10_billing_schema.sql` (applied to the linked
  remote): twelve org-scoped billing tables, duplicate-subscription unique
  index, one-open-grace unique index, payment-event dedupe, current-snapshot
  unique index. Legacy user-keyed scaffolding dropped.
- Migration `20260724000100_phase10_billing_rls.sql`: admin/owner read on
  sensitive rows, member read on counts and current snapshot, service-role only
  on operational tables, no customer writes anywhere.
- `src/lib/supabase/types.ts` regenerated for the new tables.

### Subscription state machine

- Pure `subscription-state.ts` maps Stripe status to a bounded internal status
  and derives the product access state. Out-of-order guard via
  `shouldApplyEvent`. Customer-friendly labels only. Unit-tested.

### Entitlement engine

- `engine.ts` computes org billing state from persisted subscription + grace +
  admin overrides, writes reproducible snapshots (current + historical), and
  serves fast enforcement reads. Never calls Stripe on product requests.
- `billingLaunched()` gates beta grant vs locked for unbilled orgs.
- Monitor entitlements now resolve from the engine
  (`entitlements.server.ts`), wiring feature enforcement to billing.

### Stripe integration

- One idempotent Stripe customer per org (`customers.ts`).
- Checkout intents + Checkout Session creation with safe metadata and
  server-side duplicate prevention (`checkout.ts`).
- Customer Portal session creation (`portal.ts`).
- Idempotent, signature-verified webhook processor (`webhook-processor.ts`)
  persisting subscriptions, payment events, and grace periods, then
  recalculating snapshots. Inbox with duplicate and out-of-order protection.
- `/api/stripe/checkout`, `/api/stripe/portal`, and `/api/webhooks/stripe`
  refactored to authorized, org-scoped paths; the client never supplies a
  customer or price id.

### Server actions and UI

- Actions: `startCheckoutAction`, `openBillingPortalAction`, `changePlanAction`
  (immediate upgrade with proration, scheduled downgrade via subscription
  schedules), `scheduleCancellationAction`, `reactivateSubscriptionAction`. All
  authorize, audit, and revalidate.
- Pages: `/app/settings/billing` (overview + grace/cancellation banners),
  `/app/settings/billing/plans`, `/app/settings/billing/usage`,
  `/app/settings/billing/invoices`, `/billing/checkout/success` (polls for
  verified state), `/billing/checkout/canceled`.
- Settings navigation gained a permission-aware Billing link.

### MRR

- Pure `mrr.ts` computes MRR/ARR, paying orgs, ARPA, and plan mix from actual
  recurring amounts. Unit-tested. No fabricated revenue.

### Tests and checks

- 30 billing unit tests (catalog, state machine, MRR, grace period) plus the
  existing suite: 70 tests passing. `tsc --noEmit` clean. ESLint clean on all
  billing files.

## Deferred (documented, not faked)

- Scheduled Stripe/Fajita reconciliation job and reconciliation dashboard
  (table and design exist).
- Platform-admin billing view (`/internal/billing`), refund admin UI, and
  dispute evidence workflow. Refunds are ingested from webhooks; admin issuance
  UI and step-up auth are not built.
- Downgrade-compliance selection UI (schema and scheduling exist).
- Billing email delivery (no sending provider wired; copy and triggers are the
  Phase 11 lifecycle boundary).
- Stripe Tax enablement, promotion codes, and trials (foundations only,
  disabled by default).
- Internal billing lab, Stripe test-clock lifecycle runs, load tests, and
  full concurrency/E2E matrices.
- Usage-counter transactional updates (counters are rebuildable; live
  event-driven increments are not yet wired everywhere).

## How to verify Stripe state

Product access derives only from `billing_subscriptions.access_state`, written
by signed webhooks and read through the entitlement snapshot. To confirm a
subscription is real: check the `billing_webhook_events` inbox for a processed
`checkout.session.completed` / `customer.subscription.*` event, then the
`billing_subscriptions` row, then the `current` `billing_entitlement_snapshots`
row. Stripe Dashboard is the independent source of truth for money.

## Not prematurely implemented

No affiliate system, affiliate attribution, affiliate payouts, marketing
lifecycle campaigns, promotional cancellation offers, lifetime plans, credit
system, usage-based or overage or per-seat billing, custom enterprise
contracts, Pamphlet chatbot, or fake revenue.

## Related docs

`billing-system-architecture.md`, `subscription-state-machine.md`,
`entitlement-engine.md`, `payment-grace-period.md`, `mrr-calculation.md`,
`../database/phase-10-schema.md`, `../database/phase-10-rls.md`,
`../security/billing-security-review.md`.
