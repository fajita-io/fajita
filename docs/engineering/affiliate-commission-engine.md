# Affiliate conversion and commission engine

Internal engineering reference for Phase 12D. Describes how verified Stripe
billing events become affiliate conversions, commissions, and immutable ledger
entries. Money is always integer minor units (cents); rates are basis points.

## Principles

- One source of billing truth. The engine consumes the existing Stripe webhook
  inbox (`billing_webhook_events`, verified and idempotent). It does not open a
  second webhook or a second subscription system.
- One calculator. `src/lib/affiliates/commission.ts` is pure and integer-only.
  Every amount (accrual and reversal) flows through it.
- Idempotent writes. A commission is unique per
  `(conversion, invoice, calculation_version)`. Every ledger row carries a unique
  `idempotency_key`. Refund and dispute source events are unique per Stripe
  event. Re-delivery is safe.
- Privacy. The engine writes service-role-only tables. Affiliates never see
  customer identity; dashboards read projected amounts and states only.

## Integration point

`src/lib/billing/webhook-processor.ts` dispatches affiliate side effects after
its own billing side effects, inside the same idempotent event handler:

| Stripe event | Affiliate effect |
| --- | --- |
| `invoice.paid` | `processInvoicePaidForAffiliate` (accrue commission) |
| `customer.subscription.deleted` | `processSubscriptionCanceledForAffiliate` (end window) |
| `charge.refunded` | `processRefundForAffiliate` (proportional reversal) |
| `charge.dispute.created` | `processDisputeForAffiliate` status `opened` (hold) |
| `charge.dispute.closed` | `processDisputeForAffiliate` status `won`/`lost` |

Affiliate failures propagate (do not swallow) so the idempotent webhook retries.
Because all writes are idempotent, retry converges without double counting.

## Attribution to conversion

On the first paid subscription invoice for an org that has an eligible or locked
attribution (`affiliate_attributions.eligibility_status`), the engine:

1. Confirms the affiliate membership still allows accrual (`active`).
2. Confirms the plan is eligible (`isEligiblePlan`).
3. Creates one `affiliate_conversions` row (unique per org), state `active`,
   with an anonymous ref, plan, interval, subscription id, and first-paid
   markers.
4. Locks the attribution (`eligibility_status = locked`), so it can no longer be
   replaced.
5. Opens an `affiliate_eligibility_windows` row from first paid date for
   `recurringEligibilityMonths`.

If the subscription row is not yet synced when `invoice.paid` arrives, the
engine throws so the webhook retries (only for subscription invoices).

## Commission accrual

For each eligible paid invoice within the eligibility window:

- `computeCommission` derives `grossEligibleCents` (paid minus tax when the
  program excludes tax), `excludedCents`, and `commissionCents` (floored).
- Inserts one `affiliate_commissions` row in state `holding` with
  `hold_release_at = paid_at + commissionHoldingDays`.
- Writes ledger `commission_accrued` (`+commission`), key `accrue:{commission}`.
- Records an `affiliate_conversion_events` row.

`amount_paid` is already net of discounts and applied customer credit, so those
exclusions are inherent. Zero-amount (trial) invoices never accrue.

## Reversals

- Refund (`charge.refunded`): records an idempotent `affiliate_refund_events`
  row, then reverses in proportion to the refunded share of the original base
  (`computeReversal`, cumulative-aware), capped at the standing commission.
  Ledger `refund_reversal` (`-delta`). Commission state moves to
  `partially_reversed` or `reversed`.
- Dispute opened: commission moves to `disputed` (ledger `dispute_hold`, amount
  0) so it cannot pay out.
- Dispute won: `disputed` returns to `holding`.
- Dispute lost: reverses the standing amount, ledger `dispute_reversal`, state
  `reversed`.

## Maturation and expiry (worker)

`POST /api/internal/affiliates/run` (bearer `AFFILIATE_WORKER_TOKEN`), idempotent:

- `expire`: end eligibility windows past their end and set their conversions to
  `expired` (no new accrual).
- `mature`: move `holding` commissions with an elapsed hold and no reversal to
  `payable`. Writes ledger `commission_approved` and `commission_payable`
  (amount 0; accrual already moved the balance). Payouts (12E) consume `payable`.

## Ledger balance

`affiliate_commission_ledger` is append-only signed cents. Net balance is the
sum of `amount_cents`. Accrual adds, reversals subtract, state transitions are
amount 0, and payout (12E) will subtract on `commission_paid`. `getEarningsSummary`
projects holding/payable/paid/reversed/lifetime plus the net balance for the
dashboard.

## Not yet built (12E onward)

Payout batches and Stripe Connect transfers (`commission_paid` ledger entries),
tax handling, negative-balance carry, admin commission adjustments UI, fraud
review actions, and reconciliation against Stripe. Integration tests against a
test database are pending.
