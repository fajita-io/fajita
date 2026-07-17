/**
 * Commission calculation. Pure and integer-only: minor units (cents) and basis
 * points, never floats for money. This is the single place commission amounts
 * are derived so the webhook engine, tests, and any admin recompute agree.
 *
 * The input is the real cash a customer paid on one invoice, plus the tax
 * portion of that payment. Stripe's `amount_paid` is already net of discounts
 * and applied customer credit, so those exclusions are inherent; tax is removed
 * here when the program excludes it.
 */

export interface CommissionInput {
  /** Actual cash paid on the invoice, in cents (Stripe amount_paid). */
  amountPaidCents: number;
  /** Tax portion included in amountPaidCents, in cents. */
  taxCents: number;
  /** Commission rate in basis points (2000 = 20%). */
  rateBps: number;
  /** Whether the program excludes tax from the commissionable base. */
  excludeTax: boolean;
}

export interface CommissionResult {
  /** Commissionable base after exclusions, in cents (never negative). */
  grossEligibleCents: number;
  /** Amount removed from the paid total by exclusions, in cents. */
  excludedCents: number;
  /** Commission owed on this invoice, in cents (floored). */
  commissionCents: number;
}

/** Compute the commission for a single paid invoice. */
export function computeCommission(input: CommissionInput): CommissionResult {
  const amountPaid = Math.max(0, Math.trunc(input.amountPaidCents));
  const tax = Math.max(0, Math.trunc(input.taxCents));
  const excluded = input.excludeTax ? Math.min(tax, amountPaid) : 0;
  const grossEligible = Math.max(0, amountPaid - excluded);
  const rate = Math.max(0, Math.trunc(input.rateBps));
  const commission = Math.floor((grossEligible * rate) / 10000);
  return {
    grossEligibleCents: grossEligible,
    excludedCents: excluded,
    commissionCents: commission,
  };
}

/**
 * The incremental reversal to apply when revenue is refunded or a dispute is
 * lost. `refundedCents` is the cumulative refunded revenue on the invoice
 * (Stripe reports cumulative `amount_refunded`), so this returns the delta
 * beyond what has already been reversed. Proportional to the refunded share of
 * the original eligible base, never more than the commission still standing.
 * Integer math, floored so the program never over-reverses.
 */
export function computeReversal(input: {
  /** Original commissionable base for the invoice, in cents. */
  grossEligibleCents: number;
  /** Commission originally accrued for the invoice, in cents. */
  commissionCents: number;
  /** Cents already reversed against this commission. */
  alreadyReversedCents: number;
  /** Cumulative cents of revenue refunded/lost on the invoice. */
  refundedCents: number;
  /** Whether this is a full reversal regardless of amount (dispute lost). */
  full?: boolean;
}): number {
  const commission = Math.max(0, Math.trunc(input.commissionCents));
  const alreadyReversed = Math.max(0, Math.trunc(input.alreadyReversedCents));
  const standing = Math.max(0, commission - alreadyReversed);
  if (input.full) return standing;

  const base = Math.max(0, Math.trunc(input.grossEligibleCents));
  if (base === 0) return standing;
  const refunded = Math.max(0, Math.trunc(input.refundedCents));
  const share = Math.min(refunded, base);
  const targetCumulative = Math.floor((commission * share) / base);
  const delta = targetCumulative - alreadyReversed;
  return Math.min(Math.max(0, delta), standing);
}
