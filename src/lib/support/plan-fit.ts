import { publicPlans, pricingConfig } from "@/lib/site/pricing";
import type { PlanId } from "@/lib/stripe/plans";

export interface PlanFitInput {
  monitorCount?: number;
  intervalSeconds?: number;
  teamSize?: number;
  statusPageCount?: number;
  customDomain?: boolean;
}

export interface PlanFitResult {
  planId: PlanId;
  planName: string;
  reason: string;
  lowerLimitation?: string;
  higherAdvantage?: string;
  pricingNote: string;
}

function limitLabel(n: number | null): string {
  return n === null ? "no fixed monitor cap in the public catalog" : `${n} monitors`;
}

export function recommendPlan(input: PlanFitInput): PlanFitResult {
  const monitors = input.monitorCount ?? 1;
  const starter = publicPlans.find((p) => p.id === "starter")!;
  const pro = publicPlans.find((p) => p.id === "pro")!;
  const business = publicPlans.find((p) => p.id === "business")!;

  let chosen = starter;
  if (monitors > 10 || (input.teamSize ?? 1) > 3 || input.customDomain) {
    chosen = pro;
  }
  if (monitors > 50 || (input.statusPageCount ?? 0) > 3 || (input.teamSize ?? 1) > 10) {
    chosen = business;
  }

  const priceLine =
    pricingConfig.published && chosen.monthlyUsd != null
      ? `${chosen.name} is listed at $${chosen.monthlyUsd}/month or $${chosen.yearlyUsd}/year before tax.`
      : `${chosen.name} pricing is on the pricing page.`;

  const reason = `${chosen.name} fits about ${monitors} active monitor${monitors === 1 ? "" : "s"} (${limitLabel(chosen.monitorLimit)}). ${priceLine}`;

  let lowerLimitation: string | undefined;
  let higherAdvantage: string | undefined;
  if (chosen.id === "pro") {
    lowerLimitation = `Starter stops at ${starter.monitorLimit} monitors.`;
    higherAdvantage = "Business removes the fixed monitor cap in the public catalog.";
  } else if (chosen.id === "starter") {
    higherAdvantage = `Pro raises the limit to ${pro.monitorLimit} monitors.`;
  } else if (chosen.id === "business") {
    lowerLimitation = `Pro stops at ${pro.monitorLimit} monitors.`;
  }

  return {
    planId: chosen.id,
    planName: chosen.name,
    reason,
    lowerLimitation,
    higherAdvantage,
    pricingNote:
      "This is guidance from the current public catalog, not a binding quote. Final availability follows the live pricing page.",
  };
}
