# Payment grace period

Source: `src/lib/billing/grace-period.ts` (pure, unit-tested in
`grace-period.test.ts`). State: `billing_grace_periods` table.

One place defines how long a failed payment is tolerated before the
organization is restricted. Values are configurable in `GRACE_POLICY` and never
hardcoded across the product.

## Provisional policy

`GRACE_POLICY = { warnUntilDay: 3, blockNewUntilDay: 7 }`.

- Days 0 to 3 (`warn`): full operation continues, prominent billing warning,
  Stripe retries payment, no public service change.
- Days 4 to 7 (`block_new`): existing monitoring continues, new resource
  creation is blocked, billing fixes remain available.
- After day 7 (`restricted`): the org enters the restricted access state. New
  checks stop after a controlled transition, existing data remains readable,
  status pages stay available using the last safe projection, and billing and
  data export remain accessible.

## Functions

- `daysElapsed(fromIso, now)` whole days since the first failure, never
  negative.
- `gracePhase(failedAtIso, now, policy)` returns `warn` / `block_new` /
  `restricted`.
- `blocksNewResources(phase)` true for `block_new` and `restricted`.
- `restrictionStartsAt(failedAtIso, policy)` ISO instant when restriction
  begins (the day after the block window ends).

## Lifecycle

`invoice.payment_failed` opens one grace period per org (idempotent; a partial
unique index enforces a single active window). The engine reads the open record
to decide `restricted` and derive the access state. `invoice.paid` resolves the
open grace period, records `billing.payment_recovered`, and recalculates the
entitlement snapshot. Recovery resumes schedules with jitter and never
fabricates a healthy state before new checks complete.
