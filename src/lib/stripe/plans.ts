export type PlanId = "starter" | "pro" | "business";

export type BillingInterval = "month" | "year";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  description: string;
  monitorLimit: number;
  lookupKeys: Record<BillingInterval, string>;
};

/**
 * Stripe Prices use matching lookup_keys in Dashboard or via API.
 * Internal keys (starter/pro/business) are stable for billing; customer-facing
 * names are Core, Team, and Scale.
 */
export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Core",
    description: "One product. One person on call. Checks included.",
    monitorLimit: 10,
    lookupKeys: {
      month: "fajita_starter_monthly",
      year: "fajita_starter_yearly",
    },
  },
  pro: {
    id: "pro",
    name: "Team",
    description: "More monitors, faster checks, room for the whole crew.",
    monitorLimit: 50,
    lookupKeys: {
      month: "fajita_pro_monthly",
      year: "fajita_pro_yearly",
    },
  },
  business: {
    id: "business",
    name: "Scale",
    description: "High-volume monitoring for teams that cannot miss a beat.",
    monitorLimit: 150,
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
