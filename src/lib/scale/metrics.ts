/**
 * Retained-revenue, activated CAC, retained CAC, and payback models.
 * Never treat raw signups as customers. Never use gross MRR as contribution.
 */

import type { DataCompleteness, MetricMeta } from "./types";

export const ACTIVATION_DEFINITION_VERSION = "activation-v1-core-monitor";
export const RETENTION_DEFINITION_VERSION = "retention-v1-d7-d30-good-standing";
export const RETAINED_REVENUE_VERSION = "retained-mrr-v1";
export const CAC_VERSION = "cac-v1";
export const PAYBACK_VERSION = "payback-v1-estimate";

const BASE_META = {
  currency: "USD",
  billingStateFilter: "active|trialing paid; exclude refunded, disputed, fraudulent, unpaid",
  activationDefinitionVersion: ACTIVATION_DEFINITION_VERSION,
  retentionDefinitionVersion: RETENTION_DEFINITION_VERSION,
  refundTreatment: "Excluded from retained revenue; counted in refund rate",
  cancellationTreatment: "Churned MRR after effective cancellation; not retained",
} as const;

export function metricMeta(partial: {
  calculationVersion: string;
  cohortDate: string | null;
  completeness: DataCompleteness;
  immatureCohort: boolean;
  label: string;
}): MetricMeta {
  return { ...BASE_META, ...partial };
}

export interface RetainedRevenueInput {
  newPaidMrrCents: number;
  activatedNewMrrCents: number;
  day7RetainedNewMrrCents: number;
  day30RetainedNewMrrCents: number | null;
  expansionMrrCents: number;
  reactivationMrrCents: number;
  contractionMrrCents: number;
  churnedMrrCents: number;
  channelRetainedMrrCents: Record<string, number>;
  cohortDate: string;
  completeness: DataCompleteness;
  day30Available: boolean;
}

export interface RetainedRevenueResult {
  newMrrCents: number;
  activatedNewMrrCents: number;
  day7RetainedNewMrrCents: number;
  day30RetainedNewMrrCents: number | null;
  netRetainedMrrMovementCents: number;
  channelRetainedMrrCents: Record<string, number>;
  meta: MetricMeta;
}

export function computeRetainedRevenue(
  input: RetainedRevenueInput,
): RetainedRevenueResult {
  const net =
    input.day7RetainedNewMrrCents +
    input.expansionMrrCents +
    input.reactivationMrrCents -
    input.contractionMrrCents -
    input.churnedMrrCents;

  return {
    newMrrCents: input.newPaidMrrCents,
    activatedNewMrrCents: input.activatedNewMrrCents,
    day7RetainedNewMrrCents: input.day7RetainedNewMrrCents,
    day30RetainedNewMrrCents: input.day30Available
      ? input.day30RetainedNewMrrCents
      : null,
    netRetainedMrrMovementCents: net,
    channelRetainedMrrCents: input.channelRetainedMrrCents,
    meta: metricMeta({
      calculationVersion: RETAINED_REVENUE_VERSION,
      cohortDate: input.cohortDate,
      completeness: input.completeness,
      immatureCohort: !input.day30Available,
      label: "Estimate when Day-30 incomplete; never call refunded subs retained",
    }),
  };
}

export interface CacInput {
  eligibleChannelCostCents: number;
  activatedPaidOrganizations: number;
  day7RetainedOrganizations: number;
  day30RetainedOrganizations: number | null;
  fullyLoadedCostCents: number | null;
  cohortDate: string;
  channel: string;
  completeness: DataCompleteness;
  costAllocationMethod: string;
}

export interface CacResult {
  directActivatedCacCents: number | null;
  fullyLoadedActivatedCacCents: number | null;
  day7RetainedCacCents: number | null;
  day30RetainedCacCents: number | null;
  sampleActivated: number;
  sampleDay7: number;
  sampleDay30: number | null;
  costAllocationMethod: string;
  meta: MetricMeta;
}

function safeDivide(
  numerator: number,
  denominator: number,
): number | null {
  if (denominator <= 0) return null;
  return Math.round(numerator / denominator);
}

export function computeCac(input: CacInput): CacResult {
  return {
    directActivatedCacCents: safeDivide(
      input.eligibleChannelCostCents,
      input.activatedPaidOrganizations,
    ),
    fullyLoadedActivatedCacCents:
      input.fullyLoadedCostCents == null
        ? null
        : safeDivide(input.fullyLoadedCostCents, input.activatedPaidOrganizations),
    day7RetainedCacCents: safeDivide(
      input.eligibleChannelCostCents,
      input.day7RetainedOrganizations,
    ),
    day30RetainedCacCents:
      input.day30RetainedOrganizations == null
        ? null
        : safeDivide(
            input.eligibleChannelCostCents,
            input.day30RetainedOrganizations,
          ),
    sampleActivated: input.activatedPaidOrganizations,
    sampleDay7: input.day7RetainedOrganizations,
    sampleDay30: input.day30RetainedOrganizations,
    costAllocationMethod: input.costAllocationMethod,
    meta: metricMeta({
      calculationVersion: CAC_VERSION,
      cohortDate: input.cohortDate,
      completeness: input.completeness,
      immatureCohort: input.day30RetainedOrganizations == null,
      label: `Channel ${input.channel}. Signups are not the denominator.`,
    }),
  };
}

export interface PaybackInput {
  cacCents: number | null;
  expectedMonthlyContributionCents: number | null;
  cohortDate: string;
  completeness: DataCompleteness;
  includedCosts: string[];
  excludedCosts: string[];
  assumptions: string[];
}

export interface PaybackResult {
  paybackMonths: number | null;
  isEstimate: true;
  includedCosts: string[];
  excludedCosts: string[];
  assumptions: string[];
  meta: MetricMeta;
}

/**
 * Contribution-based payback. Do not use gross MRR as contribution.
 * Never present as guaranteed.
 */
export function computePayback(input: PaybackInput): PaybackResult {
  let paybackMonths: number | null = null;
  if (
    input.cacCents != null &&
    input.expectedMonthlyContributionCents != null &&
    input.expectedMonthlyContributionCents > 0
  ) {
    paybackMonths =
      Math.round(
        (input.cacCents / input.expectedMonthlyContributionCents) * 10,
      ) / 10;
  }

  return {
    paybackMonths,
    isEstimate: true,
    includedCosts: input.includedCosts,
    excludedCosts: input.excludedCosts,
    assumptions: input.assumptions,
    meta: metricMeta({
      calculationVersion: PAYBACK_VERSION,
      cohortDate: input.cohortDate,
      completeness: input.completeness,
      immatureCohort: input.completeness !== "complete",
      label: "Estimate only. Not guaranteed payback.",
    }),
  };
}

/** Monthly contribution estimate from collected revenue minus direct costs. */
export function estimateMonthlyContributionCents(input: {
  collectedSubscriptionCents: number;
  paymentFeesCents: number;
  monitoringComputeCents: number;
  databaseCents: number;
  alertDeliveryCents: number;
  subscriberEmailCents: number;
  supportCents: number;
  affiliateCommissionCents: number;
}): number {
  return (
    input.collectedSubscriptionCents -
    input.paymentFeesCents -
    input.monitoringComputeCents -
    input.databaseCents -
    input.alertDeliveryCents -
    input.subscriberEmailCents -
    input.supportCents -
    input.affiliateCommissionCents
  );
}
