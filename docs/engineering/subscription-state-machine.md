# Subscription state machine

Source: `src/lib/billing/subscription-state.ts` (pure, unit-tested in
`subscription-state.test.ts`).

Stripe owns the raw subscription status. Fajita derives a bounded internal
status and a product access state from it. The product reads only the internal
states, never a raw Stripe status string, so provider changes never leak into
the UI.

## Internal statuses

`none`, `checkout_pending`, `trialing`, `active`, `past_due`,
`payment_action_required`, `grace_period`, `restricted`, `unpaid`,
`cancellation_scheduled`, `canceled`, `incomplete`, `incomplete_expired`,
`paused`, `admin_suspended`.

## Stripe status to internal status

`mapStripeSubscriptionStatus({ status, cancelAtPeriodEnd, paymentActionRequired })`:

| Stripe status | Condition | Internal status |
| --- | --- | --- |
| `trialing` | `cancelAtPeriodEnd` | `cancellation_scheduled` |
| `trialing` | otherwise | `trialing` |
| `active` | `cancelAtPeriodEnd` | `cancellation_scheduled` |
| `active` | otherwise | `active` |
| `past_due` | `paymentActionRequired` | `payment_action_required` |
| `past_due` | otherwise | `past_due` |
| `unpaid` | | `unpaid` |
| `canceled` | | `canceled` |
| `incomplete` | `paymentActionRequired` | `payment_action_required` |
| `incomplete` | otherwise | `incomplete` |
| `incomplete_expired` | | `incomplete_expired` |
| `paused` | | `paused` |
| unknown | | `none` |

Cancellation-at-period-end on an otherwise-active subscription surfaces as
`cancellation_scheduled` so the UI can offer reactivation while access
continues.

## Internal status to access state

`deriveAccessState({ status, restricted, adminSuspended })` returns the
`BillingAccessState` the entitlement engine consumes:

- `adminSuspended` always returns `restricted`.
- `active` / `trialing` / `cancellation_scheduled` return `active`.
- `past_due` / `payment_action_required` / `grace_period` return `grace_period`
  until the recovery window elapses, then `restricted`.
- `unpaid` / `restricted` / `paused` / `admin_suspended` return `restricted`.
- `canceled` returns `canceled` (read-only retention).
- everything else returns `none` (locked).

The `restricted` input is set true once the open grace period has reached the
restriction phase (see `payment-grace-period.md`).

## Out-of-order protection

`shouldApplyEvent(storedStripeUpdatedAt, incomingStripeUpdatedAt)` returns true
when the incoming Stripe object is newer or equal (idempotent), false when it
is older. Stripe events are not assumed to arrive in order; an older event
never overwrites a newer stored state.

## Labels

`subscriptionStatusLabel(status)` maps every internal status to calm,
customer-friendly copy (for example `cancellation_scheduled` renders
"Cancels at period end"). No raw Stripe string reaches the UI.
