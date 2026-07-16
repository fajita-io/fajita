# Billing state model

Realistic billing states for Fajita and how the product behaves in each. Governed by `billing-and-entitlements.mdc`. Update via `billing-and-entitlement-architect`.

Stripe is the source of truth. The app derives entitlements from Stripe (`src/lib/stripe/entitlements.ts`) and mirrors state into Supabase (`billing_subscriptions`, currently unpopulated). Code recognizes these subscription statuses today: `free`, `active`, `trialing`, `past_due`, `canceled`, `incomplete`. Other states below are modeled for completeness and may be marked not applicable.

**Legend:** Defined = behavior specified · `[UNRESOLVED]` = undecided · N/A = not applicable to current plan design

---

## States

| State | Entitlement behavior | Product behavior | User messaging | Communications | Admin action | Recovery path | Data retention | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| No billing relationship | Free/none (`monitorLimit: 0` today) | Free-tier limits `[UNRESOLVED]` | Prompt to choose a plan | None / onboarding | None | Start checkout | Retained | Known status `free` |
| Checkout initiated | Not yet entitled | No paid access until confirmed server-side | Processing | None | None | Complete or abandon | N/A | Defined (rule) |
| Checkout abandoned | Free/none | Unchanged | Optional re-engagement `[UNRESOLVED]` | Optional lifecycle | None | Restart checkout | Retained | `[UNRESOLVED]` |
| Trialing | Trial entitlements `[UNRESOLVED]` | Full or limited trial `[UNRESOLVED]` | Trial status + days left | Trial start; trial ending | None | Convert to paid | Retained | Known status `trialing` |
| Active | Full plan entitlements | Full access to plan | None (normal) | Receipts on renewal | None | N/A | Retained | Known status `active` |
| Past due | Retain access during grace `[UNRESOLVED]` | Access continues in grace | Payment problem + fix link | Failed-payment dunning | None | Update payment (portal) | Retained | Known status `past_due` |
| Payment failed | Same as past due until retries exhausted | Access continues in grace | Update payment method | Dunning sequence | None | Update payment | Retained | Represented via `past_due` |
| Incomplete | Not entitled until confirmed | No paid access | Finish payment | Optional | None | Complete payment | N/A | Known status `incomplete` |
| Grace period | Paid access retained for a defined window `[UNRESOLVED]` length | Access continues | Countdown + fix link | Escalating dunning | None | Update payment | Retained | `[UNRESOLVED]` window |
| Paused | `[UNRESOLVED]` | `[UNRESOLVED]` | Paused explanation | Optional | `[UNRESOLVED]` | Resume | Retained | N/A unless pause offered |
| Cancellation scheduled | Full access until period end | Full access; shows end date | Access ends on DATE | Cancellation acknowledgment | None | Reactivate before end | Retained until end | Represented via `cancel_at_period_end` |
| Canceled | Drops to free/none at period end | Paid features locked, data preserved | What is locked + reactivate path | Cancellation confirmed | None | Resubscribe | Retention window `[UNRESOLVED]` | Known status `canceled` |
| Expired | Free/none | Paid features locked | Reactivate to restore | Optional win-back | None | Resubscribe | `[UNRESOLVED]` | `[UNRESOLVED]` |
| Refunded | Depends on refund scope `[UNRESOLVED]` | May revoke access | Explain access change | Refund confirmation | Support-initiated | `[UNRESOLVED]` | Retained | `[UNRESOLVED]` |
| Disputed | `[UNRESOLVED]` (may suspend) | May suspend paid access | Neutral, factual | `[UNRESOLVED]` | Support handles dispute | Resolve dispute | Retained | `[UNRESOLVED]` |
| Reactivated | Restore plan entitlements | Restore access | Welcome back | Reactivation confirmation | None | N/A | Restored | `[UNRESOLVED]` |

## Webhook and reconciliation notes

- Webhook route verifies signatures. Handler currently emits analytics only; it does **not** persist state or dedupe events (gap). Idempotency, duplicate protection, and out-of-order handling must be added before the cache is trusted.
- Reconciliation: on entitlement checks, treat Stripe as authoritative; use the cache only as a fast mirror once it is reliably written.

## Rules

- Never grant paid access from a browser redirect alone.
- Never destructively downgrade without warning.
- Never lock user data permanently without explanation and a recovery path.
- Retention windows after cancellation/expiry must be defined and honest, then reflected in copy and `data-inventory.md`.

## Status

Installation baseline recorded 2026-07-16. Grace-period length, trial entitlements, pause support, and retention windows are `[UNRESOLVED]`. Resolve via `billing-and-entitlement-architect` at Gate 3.
