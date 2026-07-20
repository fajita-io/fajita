import { estimateMonthlyChecks } from "@/lib/billing/check-volume";
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

export function recommendPlan(input: PlanFitInput): PlanFitResult {
  const monitors = input.monitorCount ?? 1;
  const interval = input.intervalSeconds ?? 300;
  const estimatedChecks = estimateMonthlyChecks(monitors, interval);

  const starter = publicPlans.find((p) => p.id === "starter")!;
  const pro = publicPlans.find((p) => p.id === "pro")!;
  const business = publicPlans.find((p) => p.id === "business")!;

  let chosen = starter;
  if (
    estimatedChecks > starter.checksIncluded ||
    monitors > starter.monitorLimit ||
    (input.teamSize ?? 1) > 1 ||
    input.customDomain
  ) {
    chosen = pro;
  }
  if (
    estimatedChecks > pro.checksIncluded ||
    monitors > pro.monitorLimit ||
    (input.statusPageCount ?? 0) > 3 ||
    (input.teamSize ?? 1) > 5
  ) {
    chosen = business;
  }

  const priceLine =
    pricingConfig.published && chosen.monthlyUsd != null
      ? `${chosen.name} is listed at $${chosen.monthlyUsd}/month or $${chosen.yearlyUsd}/year before tax.`
      : `${chosen.name} pricing is on the pricing page.`;

  const reason = `${chosen.name} fits about ${monitors} monitor${monitors === 1 ? "" : "s"} at your interval (~${estimatedChecks.toLocaleString()} checks/mo). Includes ${chosen.checksLabel} checks. ${priceLine}`;

  let lowerLimitation: string | undefined;
  let higherAdvantage: string | undefined;
  if (chosen.id === "pro") {
    lowerLimitation = `Core includes ${starter.checksLabel} checks and ${starter.monitorLimit} monitors.`;
    higherAdvantage = `Scale includes ${business.checksLabel} checks and ${business.monitorLimit} monitors.`;
  } else if (chosen.id === "starter") {
    higherAdvantage = `Team includes ${pro.checksLabel} checks and ${pro.monitorLimit} monitors.`;
  } else if (chosen.id === "business") {
    lowerLimitation = `Team includes ${pro.checksLabel} checks and stops at ${pro.monitorLimit} monitors.`;
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
