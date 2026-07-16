---
name: billing-and-entitlement-architect
description: >-
  Billing and entitlement workflow for Fajita. Invoke before implementing
  pricing, checkout, trials, subscriptions, credits, usage limits, upgrades,
  downgrades, cancellation, failed-payment recovery, or plan-gated features.
  Produces entitlement matrix, billing state model, and webhook plan.
---

# Billing and entitlement architect

## Purpose

Design authoritative billing state and product entitlements before implementation, keeping "what the customer pays" separate from "what the product allows." Governed by `billing-and-entitlements.mdc`. Uses Stripe as the payment authority.

## When to invoke

Before implementing pricing, checkout, trials, subscriptions, credits, usage limits, one-time purchases, upgrades, downgrades, cancellation, failed-payment recovery, the billing portal, or plan-gated features. This is Gate 3 in `DESIGN_WORKFLOW.md`, and it re-runs when billing or entitlement logic changes.

## Required inputs

- The billing or entitlement change under design.
- Current `entitlement-matrix.md`, `billing-state-model.md`.
- Existing code: `src/lib/stripe/plans.ts`, `entitlements.ts`, `webhooks.ts`, checkout and portal routes, and the `billing_*` Supabase tables.
- Phase 0 pricing intent (`creative-thesis.md` marks pricing model `[UNRESOLVED]`).
- The permissions matrix (entitlements interact with authorization, not replace it).

## Step-by-step workflow

1. Identify products and prices.
2. Identify plans.
3. Identify entitlements.
4. Identify usage or credit behavior.
5. Define authoritative billing state.
6. Define authoritative entitlement state.
7. Define webhook events.
8. Define idempotency.
9. Define state transitions.
10. Define grace periods.
11. Define upgrade behavior.
12. Define downgrade behavior.
13. Define cancellation behavior.
14. Define reactivation.
15. Define refund and dispute implications.
16. Define user-facing interface states.
17. Define support and administrative recovery.
18. Define tests.

Require an entitlement matrix showing each capability by plan, a state-transition model covering realistic billing conditions, reconciliation between Stripe state and application state, and a safe strategy for missed, duplicate, delayed, and out-of-order webhook events.

## Required outputs

- Product and price model.
- Entitlement matrix.
- Billing state model.
- Webhook processing plan.
- Upgrade and downgrade behavior.
- Failed-payment behavior.
- Cancellation and reactivation behavior.
- Test plan.
- Recovery plan.

## Quality gates

- Application access derives from server-side state, never from a success URL.
- Every plan-gated capability has a server-side entitlement check in the matrix.
- Webhook processing is idempotent and handles duplicate and out-of-order events.
- Downgrade and cancellation define what happens to data over the new limit.
- Every restricted interface explains unavailability, unlock path, data fate, and whether work was preserved.
- Stripe-versus-cache authority is stated explicitly for each check.

## Failure conditions

- Paid access granted from a browser redirect alone.
- Duplicate webhook processing could double-apply an effect.
- A downgrade destroys data without warning.
- Entitlements leak across workspaces or accounts.
- The plan structure invents plans Phase 0 did not define.

## Memory updates

- `entitlement-matrix.md`
- `billing-state-model.md`
- `production-readiness-scorecard.md`

## Validation procedure

- Inspect `src/lib/stripe/*` and the webhook route to confirm the documented plan matches real code, including the known gaps (no cache persistence, no idempotency yet).
- Confirm the entitlement matrix only lists plans that exist (`starter`, `pro`, `business`).
- Confirm the state model marks non-applicable states rather than inventing them.
- Confirm reconciliation defines Stripe as authoritative and the cache as a mirror.

## Explicit limits

This skill designs and documents billing and entitlement behavior, matrices, and tests. It does not implement checkout, webhooks, or database changes, does not set real prices, and does not redesign marketing or pricing pages visually. It never invents pricing amounts, plans, or promotions not defined in Phase 0; unknown values are marked `[UNRESOLVED]`.
