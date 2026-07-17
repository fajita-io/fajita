/**
 * Centralized MRR / ARR calculation. Revenue is derived from the actual active
 * Stripe recurring price on each subscription, never from public plan prices.
 *
 * Rules (documented in docs/engineering/mrr-calculation.md):
 *   - Monthly plan contributes its monthly recurring amount.
 *   - Annual plan contributes annual amount / 12.
 *   - Taxes and one-time charges are excluded.
 *   - Cancellation-scheduled subscriptions remain MRR until effective end.
 *   - Trialing / incomplete / unpaid contribute zero.
 *   - Amounts are integer minor units (cents). No floating-point money.
 */
import type { BillingInterval } from "@/lib/stripe/plans";
import type { InternalSubscriptionStatus } from "@/lib/billing/subscription-state";

export interface SubscriptionRevenueInput {
  status: InternalSubscriptionStatus;
  interval: BillingInterval;
  /** Actual recurring amount charged per interval, in minor units (cents). */
  recurringAmountCents: number;
}

/** Statuses that contribute to recurring revenue. */
const MRR_STATUSES = new Set<InternalSubscriptionStatus>([
  "active",
  "cancellation_scheduled",
  // past_due / grace still contribute until effectively churned; classified
  // as "at risk" MRR in reporting but counted here per policy.
  "past_due",
  "grace_period",
]);

/** Monthly recurring value for one subscription, in cents. */
export function subscriptionMrrCents(input: SubscriptionRevenueInput): number {
  if (!MRR_STATUSES.has(input.status)) return 0;
  if (input.recurringAmountCents <= 0) return 0;
  return input.interval === "year"
    ? Math.round(input.recurringAmountCents / 12)
    : input.recurringAmountCents;
}

export interface RevenueTotals {
  mrrCents: number;
  arrCents: number;
  payingOrganizations: number;
  arpaCents: number;
  monthlyCount: number;
  annualCount: number;
  planMix: Record<string, number>;
}

export interface RevenueRow extends SubscriptionRevenueInput {
  planKey: string;
}

/** Aggregate MRR/ARR and mix over a set of subscriptions. */
export function computeRevenueTotals(rows: RevenueRow[]): RevenueTotals {
  let mrrCents = 0;
  let payingOrganizations = 0;
  let monthlyCount = 0;
  let annualCount = 0;
  const planMix: Record<string, number> = {};

  for (const row of rows) {
    const mrr = subscriptionMrrCents(row);
    if (mrr <= 0) continue;
    mrrCents += mrr;
    payingOrganizations += 1;
    if (row.interval === "year") annualCount += 1;
    else monthlyCount += 1;
    planMix[row.planKey] = (planMix[row.planKey] ?? 0) + 1;
  }

  return {
    mrrCents,
    arrCents: mrrCents * 12,
    payingOrganizations,
    arpaCents:
      payingOrganizations > 0
        ? Math.round(mrrCents / payingOrganizations)
        : 0,
    monthlyCount,
    annualCount,
    planMix,
  };
}

/** Format cents to a plain USD string, e.g. 1900 -> "$19.00". */
export function formatUsdCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
