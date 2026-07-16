export type PlanId = "starter" | "pro" | "business";

export type BillingInterval = "month" | "year";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  description: string;
  monitorLimit: number | null;
  lookupKeys: Record<BillingInterval, string>;
};

/**
 * Stripe Prices should use matching lookup_keys in Dashboard or via API.
 * Example: fajita_starter_monthly, fajita_starter_yearly
 */
export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "For a handful of sites that need to stay up.",
    monitorLimit: 10,
    lookupKeys: {
      month: "fajita_starter_monthly",
      year: "fajita_starter_yearly",
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "More monitors, faster alerts, room to grow.",
    monitorLimit: 50,
    lookupKeys: {
      month: "fajita_pro_monthly",
      year: "fajita_pro_yearly",
    },
  },
  business: {
    id: "business",
    name: "Business",
    description: "High-volume monitoring for teams that cannot miss a beat.",
    monitorLimit: null,
    lookupKeys: {
      month: "fajita_business_monthly",
      year: "fajita_business_yearly",
    },
  },
};

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
}

export function getPlanLookupKey(
  planId: PlanId,
  interval: BillingInterval,
): string {
  return PLANS[planId].lookupKeys[interval];
}
