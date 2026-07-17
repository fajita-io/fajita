# Entitlement engine

Sources:

- `src/lib/billing/catalog.ts` plan identity, typed entitlement values, Stripe
  mapping (pure; unit-tested).
- `src/lib/billing/engine.ts` server-side resolution, snapshots, and reads.
- `src/lib/monitoring/entitlements.server.ts` projection onto monitor limits.

Every product limit and feature decision reads from the engine. Nothing else in
the product hardcodes a plan name or a numeric limit.

## Catalog

Plan identity uses the approved internal keys `starter` / `pro` / `business`.
`BILLING_CATALOG` maps each plan to its Stripe price lookup keys, provisional
internal pricing (cents), and a fully typed `PlanEntitlements` value. Only keys
with a real enforcement path exist. A `null` numeric limit means fair-use "no
fixed cap", never "infinite".

Special entitlement sets:

- `LOCKED_ENTITLEMENTS` applied when there is no active paid subscription
  (`none` / `restricted` / `canceled`). Monitoring off, no resource creation,
  but data is never deleted and billing/export stay reachable.
- `BETA_ENTITLEMENTS` applied to orgs with no subscription while billing is
  pre-launch, preserving pre-billing product behavior so existing beta orgs are
  not locked out before pricing opens.

`effectiveEntitlements(planKey, access)` returns the plan entitlements only for
`active` and `grace_period`; every other access state returns
`LOCKED_ENTITLEMENTS`. Grace period keeps full entitlements so existing
monitoring continues during recovery.

## Engine resolution

`computeOrgBillingState(organizationId)` is a pure read (no writes, never calls
Stripe). It:

1. Loads the current live subscription (or most recent) from
   `billing_subscriptions`.
2. If none: returns beta grant while `billingLaunched()` is false, otherwise
   locked.
3. Resolves any open grace period and its phase to decide `restricted`.
4. Derives the access state from the internal status and restriction.
5. Layers active, non-expired admin overrides on top with `applyOverrides`.

`billingLaunched()` is driven by the `billing` feature flag stage. While the
flag is pre-customer, unbilled orgs get the beta grant; once billing is
customer-available, unbilled orgs resolve to locked.

## Snapshots

`writeEntitlementSnapshot(organizationId, source)` computes the state and
persists it to `billing_entitlement_snapshots`: one historical row plus one
`current` row (idempotent, unique per org). Every snapshot is reproducible from
catalog + subscription + approved overrides + access state, and carries
`ENTITLEMENT_VERSION`.

The webhook processor calls `writeEntitlementSnapshot` after any subscription,
invoice, or grace change, so the current snapshot always reflects verified
Stripe state.

## Enforcement reads

`getOrgEntitlements(organizationId)` is the fast read used by server enforcement
and workers. It prefers the stored `current` snapshot and falls back to a live
compute if none exists yet. It never calls Stripe.

`resolveEntitlements` in `entitlements.server.ts` projects `PlanEntitlements`
onto the existing `MonitorEntitlements` shape, so monitor creation, activation,
check interval, and related limits are enforced server-side and by workers
against billing state.

## Admin overrides

`applyOverrides(base, overrides)` sets shape-compatible values for keys that
exist in `PlanEntitlements`. Overrides are platform-admin only, must be
expiring for temporary use, and are visible to reconciliation. They are never
used to fabricate paid revenue.
