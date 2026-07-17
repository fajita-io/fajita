/**
 * Centralized, versioned affiliate-program configuration.
 *
 * This module is the single source of truth for every commercial term in the
 * affiliate program: commission rate, attribution window, recurring eligibility
 * period, holding period, payout threshold, payout cadence, eligible plans, and
 * exclusions. Nothing else in the codebase may hardcode these values. The
 * conversion engine, commission calculator, payout operations, dashboards, and
 * public copy all read from here (or from the persisted version row seeded from
 * here).
 *
 * Values are the live Program Terms once `programPublished` is true. Publication
 * is gated by `programPublished` and by the site claims registry. Never hardcode
 * rates elsewhere.
 *
 * Versioning: each material change to commercial terms creates a NEW version
 * entry in AFFILIATE_PROGRAM_VERSIONS with a bumped `version`. Existing
 * commissions preserve the version they were calculated under; historical
 * commission is never recalculated when terms change (see the commission
 * calculator and ledger). The `affiliate_program_versions` table persists these
 * for auditability and is seeded from this module.
 *
 * This file has no server-only import so pure calculation code, the public
 * program page, and the affiliate dashboard can all read the shape directly. It
 * contains no secrets.
 */

import type { PlanId } from "@/lib/stripe/plans";

/** Attribution models the program can run under. Documented and versioned. */
export type AttributionModel = "last_touch";

/** Commission model. Only recurring percentage is supported this phase. */
export type CommissionType = "recurring_percentage";

export type PayoutFrequency = "monthly";

/** ISO 4217, lowercase to match Stripe + the billing catalog convention. */
export type ProgramCurrency = "usd";

/**
 * One immutable, versioned snapshot of the program's commercial terms. Money is
 * always integer minor units (cents). Rates are basis points (1% = 100 bps) so
 * commission math stays in integers and never touches floating point.
 */
export interface AffiliateProgramTerms {
  /** Monotonic version. Bump on any material commercial change. */
  version: number;
  /** Human label for the version, for admin/handoff readability. */
  label: string;
  /** ISO date the version became effective (informational). */
  effectiveFrom: string;

  attributionModel: AttributionModel;
  /** Attribution cookie / server-side window, in days. */
  attributionWindowDays: number;

  commissionType: CommissionType;
  /** Commission rate in basis points. 2000 = 20%. */
  commissionRateBps: number;

  /** How long recurring commissions remain eligible, in months. */
  recurringEligibilityMonths: number;

  /** Days a paid invoice's commission is held before it can be approved. */
  commissionHoldingDays: number;

  /** Minimum approved payable balance before a payout is issued, in cents. */
  minimumPayoutThresholdCents: number;

  payoutFrequency: PayoutFrequency;
  currency: ProgramCurrency;

  /** Plan keys that generate commission. Reads plan identity, never prices. */
  eligiblePlanKeys: readonly PlanId[];

  /**
   * How long after a rejection an applicant may reapply, in days. Prevents
   * immediate resubmission churn without permanently blocking.
   */
  reapplyCooldownDays: number;

  /**
   * Cooldown before a terminated affiliate's code may be reissued, in days.
   */
  codeReuseCooldownDays: number;

  /** Exclusions. These are policy switches the calculator enforces. */
  excludeTax: boolean;
  excludeRefundedRevenue: boolean;
  excludeCredits: boolean;
  excludeDisputedRevenue: boolean;
  excludeTrialsBeforePaid: boolean;
  excludeInternalOrganizations: boolean;
  excludeTestModeSubscriptions: boolean;

  /** Affiliate coupons are off unless explicitly approved. */
  affiliateCouponsEnabled: boolean;
  /** Whether reactivation inside the window resumes commissions. */
  reactivationResumesCommission: boolean;
}

/**
 * All published + historical program versions, newest last. The persisted
 * `affiliate_program_versions` table is seeded from this array. Never edit a
 * prior entry's commercial terms after commissions exist under it; add a new
 * version instead.
 */
export const AFFILIATE_PROGRAM_VERSIONS: readonly AffiliateProgramTerms[] = [
  {
    version: 1,
    label: "Launch",
    effectiveFrom: "2026-07-17",
    attributionModel: "last_touch",
    attributionWindowDays: 30,
    commissionType: "recurring_percentage",
    commissionRateBps: 2000, // 20%
    recurringEligibilityMonths: 12,
    commissionHoldingDays: 30,
    minimumPayoutThresholdCents: 5000, // $50.00
    payoutFrequency: "monthly",
    currency: "usd",
    eligiblePlanKeys: ["starter", "pro", "business"],
    reapplyCooldownDays: 90,
    codeReuseCooldownDays: 180,
    excludeTax: true,
    excludeRefundedRevenue: true,
    excludeCredits: true,
    excludeDisputedRevenue: true,
    excludeTrialsBeforePaid: true,
    excludeInternalOrganizations: true,
    excludeTestModeSubscriptions: true,
    affiliateCouponsEnabled: false,
    reactivationResumesCommission: true,
  },
];

/** The version the program currently operates under. */
export const ACTIVE_PROGRAM_VERSION = 1;

/**
 * Whether program terms may appear on customer-facing surfaces. Set true after
 * founder/product legal review of the Affiliate Agreement and Privacy Notice
 * (see docs/legal/affiliate-counsel-review.md). Public access also requires the
 * affiliates feature stage to be public_beta or ga.
 */
export const programPublished = true;

/**
 * Legal document versions captured at terms acceptance. Distinct from the
 * commercial program version: the agreement text and privacy notice version
 * independently. Bump when the affiliate agreement or privacy notice changes.
 * The concrete legal drafts land in Phase 12H; these track which version an
 * affiliate accepted.
 */
export const AFFILIATE_TERMS_VERSION = 1;
export const AFFILIATE_PRIVACY_VERSION = 1;

/** Stable slug for the program (used in config rows, not user-facing). */
export const AFFILIATE_PROGRAM_SLUG = "fajita-affiliate";

/** Resolve the terms for a given version, defaulting to the active version. */
export function programTerms(
  version: number = ACTIVE_PROGRAM_VERSION,
): AffiliateProgramTerms {
  const found = AFFILIATE_PROGRAM_VERSIONS.find((v) => v.version === version);
  if (!found) {
    throw new Error(`Unknown affiliate program version: ${version}`);
  }
  return found;
}

/** The currently active terms. */
export function activeTerms(): AffiliateProgramTerms {
  return programTerms(ACTIVE_PROGRAM_VERSION);
}

/** Is a plan key eligible for commission under the given (or active) version? */
export function isEligiblePlan(
  planKey: PlanId,
  version: number = ACTIVE_PROGRAM_VERSION,
): boolean {
  return programTerms(version).eligiblePlanKeys.includes(planKey);
}

/** Commission rate as a human percent string, e.g. "20%". Display only. */
export function commissionRatePercentLabel(
  version: number = ACTIVE_PROGRAM_VERSION,
): string {
  const bps = programTerms(version).commissionRateBps;
  const pct = bps / 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2)}%`;
}
