import { describe, expect, it } from "vitest";

import {
  ACTIVE_PROGRAM_VERSION,
  AFFILIATE_PROGRAM_VERSIONS,
  activeTerms,
  commissionRatePercentLabel,
  isEligiblePlan,
  programPublished,
  programTerms,
} from "./config";

describe("affiliate program config", () => {
  it("publishes program terms after legal review", () => {
    expect(programPublished).toBe(true);
  });

  it("exposes the active version terms with integer-only money and rates", () => {
    const terms = activeTerms();
    expect(terms.version).toBe(ACTIVE_PROGRAM_VERSION);
    expect(terms.attributionWindowDays).toBe(30);
    expect(terms.recurringEligibilityMonths).toBe(12);
    expect(terms.commissionHoldingDays).toBe(30);
    expect(terms.minimumPayoutThresholdCents).toBe(5000);
    expect(Number.isInteger(terms.commissionRateBps)).toBe(true);
    expect(Number.isInteger(terms.minimumPayoutThresholdCents)).toBe(true);
  });

  it("excludes tax, refunds, credits, disputes, trials, internal, and test mode", () => {
    const terms = activeTerms();
    expect(terms.excludeTax).toBe(true);
    expect(terms.excludeRefundedRevenue).toBe(true);
    expect(terms.excludeCredits).toBe(true);
    expect(terms.excludeDisputedRevenue).toBe(true);
    expect(terms.excludeTrialsBeforePaid).toBe(true);
    expect(terms.excludeInternalOrganizations).toBe(true);
    expect(terms.excludeTestModeSubscriptions).toBe(true);
  });

  it("disables affiliate coupons by default", () => {
    expect(activeTerms().affiliateCouponsEnabled).toBe(false);
  });

  it("labels the commission rate from basis points", () => {
    expect(commissionRatePercentLabel()).toBe("20%");
  });

  it("treats configured plan keys as eligible", () => {
    expect(isEligiblePlan("starter")).toBe(true);
    expect(isEligiblePlan("pro")).toBe(true);
    expect(isEligiblePlan("business")).toBe(true);
  });

  it("throws on an unknown version", () => {
    expect(() => programTerms(999)).toThrow();
  });

  it("has monotonic, unique versions", () => {
    const versions = AFFILIATE_PROGRAM_VERSIONS.map((v) => v.version);
    expect(new Set(versions).size).toBe(versions.length);
    const sorted = [...versions].sort((a, b) => a - b);
    expect(versions).toEqual(sorted);
  });
});
