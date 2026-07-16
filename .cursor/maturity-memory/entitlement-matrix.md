# Entitlement matrix

Capability by plan for Fajita. Governed by `billing-and-entitlements.mdc`. Update via `billing-and-entitlement-architect`. Do not invent plans or capabilities Phase 0 did not define.

Plans come from `src/lib/stripe/plans.ts`: **Starter** (10 monitors), **Pro** (50 monitors), **Business** (unlimited monitors). A **Free** tier is implied by `entitlements.ts` (`planId: "free"`, `monitorLimit: 0`) but its exact behavior is `[UNRESOLVED]`. Prices are `[UNRESOLVED]` (set in Stripe Dashboard).

**Legend:** value = limit/behavior · `[UNRESOLVED]` = undecided · Server-side = enforcement location

---

## Capability by plan

| Feature | Free / trial behavior | Starter | Pro | Business | Usage limit | Credit cost | Upgrade requirement | Downgrade behavior | Existing-data behavior | Server-side enforcement | Interface state | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Monitors (count) | 0 (per current `entitlements.ts`) `[UNRESOLVED]` if trial differs | 10 | 50 | Unlimited | Monitor count = plan limit | None | Exceed limit requires higher plan | Monitors over new limit: behavior `[UNRESOLVED]` (must warn, not silently delete) | Preserve data; restrict creation, not destroy | Planned (limit stored on subscription; check on create) | Plan-restricted create state `[UNRESOLVED]` | `[UNRESOLVED]` |
| Check interval / frequency | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | n/a | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` |
| Alert channels | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | n/a | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` |
| Status pages | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | n/a | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` |
| Team members | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | n/a | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` |
| Data retention / history | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | n/a | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` |

## Rules

- Application access derives from authoritative server-side billing state, not from reaching a Checkout success URL (`billing-and-entitlements.mdc`).
- Stripe is authoritative; the `billing_subscriptions` table is a performance mirror (currently unpopulated).
- Downgrades must warn before restricting or removing access to data over a new limit, and must never silently destroy user data.
- Every restricted interface must explain what is locked, why, the unlock path, the data fate, whether it is temporary, and whether attempted work was preserved.

## Known gaps

- Free-tier limit is `0` monitors in code; whether that is the intended free/trial experience is `[UNRESOLVED]`.
- Per-plan capabilities beyond monitor count are undefined.
- `monitor_limit` is stored on the subscription cache but the cache is not yet written by the webhook.

## Status

Installation baseline recorded 2026-07-16. Only plan monitor counts are known. Resolve pricing, free/trial behavior, and per-feature entitlements via `billing-and-entitlement-architect` at Gate 3.
