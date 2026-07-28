import type { PlanId } from "@/lib/stripe/plans";

/**
 * Map AppSumo tier integers to Fajita plan keys.
 * Tier 1 → Core (starter), tier 2 → Team (pro), tier 3+ → Scale (business).
 */
export function planKeyFromAppsumoTier(tier: number | undefined | null): PlanId {
  const t = tier ?? 1;
  if (t >= 3) return "business";
  if (t === 2) return "pro";
  return "starter";
}
