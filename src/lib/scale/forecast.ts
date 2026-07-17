import type { ForecastScenario } from "./types";

export interface ForecastAssumption {
  key: string;
  label: string;
  value: number | string;
  source: string;
  owner: string;
  confidence: "low" | "medium" | "high";
  scenario: ForecastScenario | "all";
  reviewDate: string;
  actualVsForecast: string;
}

export const FORECAST_ASSUMPTIONS: ForecastAssumption[] = [
  {
    key: "activation_rate",
    label: "Activation rate among new paid orgs",
    value: "unknown_live",
    source: "Phase 19 baseline required",
    owner: "product",
    confidence: "low",
    scenario: "all",
    reviewDate: "2026-08-15",
    actualVsForecast: "no_actual_yet",
  },
  {
    key: "day7_retention",
    label: "Day-7 retained paid organizations",
    value: "unknown_live",
    source: "Phase 19 baseline required",
    owner: "product",
    confidence: "low",
    scenario: "all",
    reviewDate: "2026-08-15",
    actualVsForecast: "no_actual_yet",
  },
  {
    key: "paid_cac_test",
    label: "Paid activated CAC ceiling (test)",
    value: 25000,
    source: "Internal ceiling draft (cents)",
    owner: "founder",
    confidence: "low",
    scenario: "accelerated",
    reviewDate: "2026-09-01",
    actualVsForecast: "n/a_stage0",
  },
];

export interface ForecastInputs {
  newPaidOrganizations: number;
  activationRate: number;
  day7RetentionRate: number;
  avgMrrCents: number;
  churnRate: number;
  expansionMrrCents: number;
  refundRate: number;
  paymentFeesRate: number;
  monitoringCostCents: number;
  supportCostCents: number;
  affiliateCommissionCents: number;
  contentCostCents: number;
  paidAcquisitionCents: number;
  providerUpgradeCents: number;
  hiringCents: number;
  cashBalanceCents: number | null;
}

export interface ForecastOutputs {
  mrrCents: number;
  collectedRevenueCents: number;
  contributionEstimateCents: number;
  cashRequirementCents: number;
  activatedCacCents: number | null;
  paybackMonths: number | null;
  infrastructureCostCents: number;
  hiringTimingNote: string;
  runwayMonths: number | null;
  label: "forecast";
  disclaimer: string;
}

export function runScenarioForecast(
  scenario: ForecastScenario,
  inputs: ForecastInputs,
): { scenario: ForecastScenario; inputs: ForecastInputs; outputs: ForecastOutputs } {
  const activated = Math.round(inputs.newPaidOrganizations * inputs.activationRate);
  const retained = Math.round(activated * inputs.day7RetentionRate);
  const mrrCents = Math.round(
    retained * inputs.avgMrrCents * (1 - inputs.churnRate) + inputs.expansionMrrCents,
  );
  const collected = Math.round(mrrCents * (1 - inputs.refundRate));
  const paymentFees = Math.round(collected * inputs.paymentFeesRate);
  const contribution =
    collected -
    paymentFees -
    inputs.monitoringCostCents -
    inputs.supportCostCents -
    inputs.affiliateCommissionCents;

  const acquisitionSpend =
    inputs.paidAcquisitionCents +
    inputs.contentCostCents +
    inputs.affiliateCommissionCents;
  const activatedCac =
    activated > 0 ? Math.round(acquisitionSpend / activated) : null;
  const payback =
    activatedCac != null && contribution > 0 && retained > 0
      ? Math.round((activatedCac / (contribution / Math.max(retained, 1))) * 10) / 10
      : null;

  const cashRequirement =
    inputs.paidAcquisitionCents +
    inputs.providerUpgradeCents +
    inputs.hiringCents +
    inputs.contentCostCents;

  const runwayMonths =
    inputs.cashBalanceCents != null && cashRequirement > 0
      ? Math.round((inputs.cashBalanceCents / cashRequirement) * 10) / 10
      : null;

  return {
    scenario,
    inputs,
    outputs: {
      mrrCents,
      collectedRevenueCents: collected,
      contributionEstimateCents: contribution,
      cashRequirementCents: cashRequirement,
      activatedCacCents: activatedCac,
      paybackMonths: payback,
      infrastructureCostCents: inputs.monitoringCostCents + inputs.providerUpgradeCents,
      hiringTimingNote:
        scenario === "accelerated"
          ? "Hiring only if triggers satisfied and budget approved"
          : "No hire assumed",
      runwayMonths,
      label: "forecast",
      disclaimer:
        "Forecast estimate only. Not guaranteed. Distinguishes assumptions from actuals when actuals exist.",
    },
  };
}

/** Stage 0 conservative defaults: near-zero intentional acquisition. */
export function defaultScenarioInputs(
  scenario: ForecastScenario,
): ForecastInputs {
  const base: ForecastInputs = {
    newPaidOrganizations: scenario === "conservative" ? 2 : scenario === "base" ? 5 : 15,
    activationRate: 0.7,
    day7RetentionRate: 0.75,
    avgMrrCents: 4900,
    churnRate: 0.05,
    expansionMrrCents: 0,
    refundRate: 0.03,
    paymentFeesRate: 0.029,
    monitoringCostCents: 2000,
    supportCostCents: 1500,
    affiliateCommissionCents: scenario === "accelerated" ? 8000 : 2000,
    contentCostCents: scenario === "conservative" ? 0 : 5000,
    paidAcquisitionCents: scenario === "accelerated" ? 50_000 : 0,
    providerUpgradeCents: 0,
    hiringCents: 0,
    cashBalanceCents: null,
  };
  return base;
}
