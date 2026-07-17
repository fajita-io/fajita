import "server-only";

import { serviceClient } from "@/lib/supabase/service";

export interface EarningsSummary {
  /** Commission accrued and still within its holding period, in cents. */
  holdingCents: number;
  /** Commission cleared for payout, in cents. */
  payableCents: number;
  /** Commission already paid out, in cents. */
  paidCents: number;
  /** Total reversed by refunds and lost disputes, in cents. */
  reversedCents: number;
  /** Lifetime gross commission accrued, in cents. */
  lifetimeCents: number;
  /** Net ledger balance (authoritative), in cents. */
  balanceCents: number;
}

const EMPTY: EarningsSummary = {
  holdingCents: 0,
  payableCents: 0,
  paidCents: 0,
  reversedCents: 0,
  lifetimeCents: 0,
  balanceCents: 0,
};

/**
 * Projected earnings for an affiliate dashboard. Derived from the commission
 * rows (state buckets) and the immutable ledger (net balance). Never exposes
 * customer identity: only amounts and states.
 */
export async function getEarningsSummary(
  affiliateId: string,
): Promise<EarningsSummary> {
  const db = serviceClient();

  const { data: commissions } = await db
    .from("affiliate_commissions")
    .select("state, commission_amount_cents, reversed_cents")
    .eq("affiliate_id", affiliateId)
    .limit(5000);

  const summary = { ...EMPTY };
  for (const row of commissions ?? []) {
    const standing = row.commission_amount_cents - row.reversed_cents;
    summary.lifetimeCents += row.commission_amount_cents;
    summary.reversedCents += row.reversed_cents;
    if (row.state === "holding") summary.holdingCents += Math.max(0, standing);
    else if (row.state === "payable" || row.state === "approved" || row.state === "scheduled")
      summary.payableCents += Math.max(0, standing);
    else if (row.state === "paid") summary.paidCents += Math.max(0, standing);
  }

  const { data: ledger } = await db
    .from("affiliate_commission_ledger")
    .select("amount_cents")
    .eq("affiliate_id", affiliateId)
    .limit(20000);
  summary.balanceCents = (ledger ?? []).reduce(
    (sum, e) => sum + e.amount_cents,
    0,
  );

  return summary;
}
