# MRR and ARR calculation

Source: `src/lib/billing/mrr.ts` (pure, unit-tested in `mrr.test.ts`).

Revenue is derived from the actual active Stripe recurring price stored on each
subscription (`recurring_amount_cents`), never from public plan prices. All
amounts are integer minor units (cents).

## Per-subscription MRR

`subscriptionMrrCents({ status, interval, recurringAmountCents })`:

- Monthly interval contributes the recurring amount as-is.
- Annual interval contributes `round(recurringAmountCents / 12)`.
- Contributes zero unless the status is in the MRR set.
- Contributes zero when the recurring amount is not positive.

MRR statuses: `active`, `cancellation_scheduled`, `past_due`, `grace_period`.
A subscription set to cancel at period end still counts until the effective
cancellation. `past_due` and `grace_period` are counted here per policy and can
be reported separately as at-risk MRR. `trialing`, `incomplete`, `unpaid`, and
`canceled` contribute zero.

## Aggregate totals

`computeRevenueTotals(rows)` returns:

- `mrrCents` sum of per-subscription MRR.
- `arrCents` = `mrrCents * 12`.
- `payingOrganizations` count of rows with positive MRR.
- `arpaCents` = `round(mrrCents / payingOrganizations)`, or 0.
- `monthlyCount` and `annualCount`.
- `planMix` count of paying subscriptions per plan key.

## Explicitly excluded

Taxes, one-time charges, refunds, trial value, unpaid or incomplete
subscriptions, and future contracted revenue are never mixed into MRR. Refunds
are tracked separately in `billing_payment_events`.

## Formatting

`formatUsdCents(cents)` renders cents as a plain USD string
(for example `1900` renders `$19.00`, `123456` renders `$1,234.56`).

## Not fabricated

There is no manual revenue entry and no demo revenue. MRR is computed only from
persisted subscription rows that mirror verified Stripe state, so Stripe records
can independently verify the numbers for buyer due diligence.
