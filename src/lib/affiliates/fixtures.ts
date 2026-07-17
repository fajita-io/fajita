/**
 * Deterministic affiliate fixtures for the internal lab and unit tests.
 * No database, no customer identity, no live Stripe. Safe to import anywhere.
 */

import { computeCommission, computeReversal } from "./commission";
import {
  activeTerms,
  commissionRatePercentLabel,
  programPublished,
} from "./config";
import {
  resolvePayoutStatus,
  type PayoutEligibilityInput,
  type PayoutStatus,
} from "./payout-eligibility";

export interface CommissionFixture {
  id: string;
  label: string;
  amountPaidCents: number;
  taxCents: number;
  expectedGrossEligibleCents: number;
  expectedCommissionCents: number;
}

/** Invoice scenarios covering tax exclusion and rounding. */
export function commissionFixtures(): CommissionFixture[] {
  const terms = activeTerms();
  const cases = [
    {
      id: "clean_month",
      label: "Clean $29 invoice, no tax",
      amountPaidCents: 2900,
      taxCents: 0,
    },
    {
      id: "with_tax",
      label: "$99 invoice with $8.25 tax excluded",
      amountPaidCents: 10_725,
      taxCents: 825,
    },
    {
      id: "fractional",
      label: "$19.99 with fractional commission",
      amountPaidCents: 1999,
      taxCents: 0,
    },
  ];

  return cases.map((c) => {
    const result = computeCommission({
      amountPaidCents: c.amountPaidCents,
      taxCents: c.taxCents,
      rateBps: terms.commissionRateBps,
      excludeTax: terms.excludeTax,
    });
    return {
      ...c,
      expectedGrossEligibleCents: result.grossEligibleCents,
      expectedCommissionCents: result.commissionCents,
    };
  });
}

export interface ReversalFixture {
  id: string;
  label: string;
  grossEligibleCents: number;
  commissionCents: number;
  alreadyReversedCents: number;
  refundedCents: number;
  full: boolean;
  expectedDeltaCents: number;
}

export function reversalFixtures(): ReversalFixture[] {
  return [
    {
      id: "full_refund",
      label: "Full refund reverses remaining standing",
      grossEligibleCents: 2900,
      commissionCents: 580,
      alreadyReversedCents: 0,
      refundedCents: 2900,
      full: true,
      expectedDeltaCents: computeReversal({
        grossEligibleCents: 2900,
        commissionCents: 580,
        alreadyReversedCents: 0,
        refundedCents: 2900,
        full: true,
      }),
    },
    {
      id: "partial_half",
      label: "Half refund reverses half commission",
      grossEligibleCents: 10_000,
      commissionCents: 2000,
      alreadyReversedCents: 0,
      refundedCents: 5000,
      full: false,
      expectedDeltaCents: computeReversal({
        grossEligibleCents: 10_000,
        commissionCents: 2000,
        alreadyReversedCents: 0,
        refundedCents: 5000,
        full: false,
      }),
    },
  ];
}

export interface PayoutEligibilityFixture {
  id: string;
  label: string;
  input: PayoutEligibilityInput;
  expected: PayoutStatus;
}

export function payoutEligibilityFixtures(): PayoutEligibilityFixture[] {
  const base: PayoutEligibilityInput = {
    membershipState: "active",
    payoutHold: false,
    grossPayableCents: 10_000,
    thresholdCents: activeTerms().minimumPayoutThresholdCents,
    provider: "stripe_connect",
    accountEnabled: true,
    taxStatus: "not_required",
  };

  const cases: { id: string; label: string; input: PayoutEligibilityInput }[] = [
    { id: "ready", label: "Ready when everything is clear", input: base },
    {
      id: "below",
      label: "Below threshold",
      input: { ...base, grossPayableCents: 1000 },
    },
    {
      id: "setup",
      label: "Payout setup required",
      input: { ...base, accountEnabled: false },
    },
    {
      id: "tax",
      label: "Tax information required",
      input: { ...base, taxStatus: "required" },
    },
    {
      id: "held",
      label: "Suspended affiliate held",
      input: { ...base, membershipState: "suspended" },
    },
  ];

  return cases.map((c) => ({
    ...c,
    expected: resolvePayoutStatus(c.input),
  }));
}

export interface DemoAffiliate {
  code: string;
  membershipState: string;
  fraudState: string;
  holdingCents: number;
  payableCents: number;
  paidCents: number;
  eligibleClicks: number;
  conversions: number;
}

/** Synthetic directory rows for lab storytelling. Never written to the DB. */
export const DEMO_AFFILIATES: readonly DemoAffiliate[] = [
  {
    code: "northstar",
    membershipState: "active",
    fraudState: "clear",
    holdingCents: 4200,
    payableCents: 8600,
    paidCents: 24_000,
    eligibleClicks: 312,
    conversions: 4,
  },
  {
    code: "emberlabs",
    membershipState: "active",
    fraudState: "review",
    holdingCents: 1800,
    payableCents: 0,
    paidCents: 5000,
    eligibleClicks: 90,
    conversions: 1,
  },
  {
    code: "coolstack",
    membershipState: "paused",
    fraudState: "clear",
    holdingCents: 0,
    payableCents: 12_500,
    paidCents: 0,
    eligibleClicks: 44,
    conversions: 2,
  },
];

export function programLabSummary() {
  const terms = activeTerms();
  return {
    version: terms.version,
    label: terms.label,
    commissionRate: commissionRatePercentLabel(),
    attributionWindowDays: terms.attributionWindowDays,
    recurringMonths: terms.recurringEligibilityMonths,
    holdingDays: terms.commissionHoldingDays,
    thresholdCents: terms.minimumPayoutThresholdCents,
    currency: terms.currency,
    eligiblePlans: [...terms.eligiblePlanKeys],
    programPublished,
  };
}
