import { describe, expect, it } from "vitest";

import { computeCommission, computeReversal } from "./commission";
import { activeTerms } from "./config";
import {
  commissionFixtures,
  payoutEligibilityFixtures,
  programLabSummary,
  reversalFixtures,
} from "./fixtures";
import { resolvePayoutStatus } from "./payout-eligibility";

describe("affiliate fixtures", () => {
  it("commission fixtures match the calculator", () => {
    const terms = activeTerms();
    for (const fixture of commissionFixtures()) {
      const result = computeCommission({
        amountPaidCents: fixture.amountPaidCents,
        taxCents: fixture.taxCents,
        rateBps: terms.commissionRateBps,
        excludeTax: terms.excludeTax,
      });
      expect(result.grossEligibleCents).toBe(fixture.expectedGrossEligibleCents);
      expect(result.commissionCents).toBe(fixture.expectedCommissionCents);
    }
  });

  it("reversal fixtures match the calculator", () => {
    for (const fixture of reversalFixtures()) {
      const delta = computeReversal({
        grossEligibleCents: fixture.grossEligibleCents,
        commissionCents: fixture.commissionCents,
        alreadyReversedCents: fixture.alreadyReversedCents,
        refundedCents: fixture.refundedCents,
        full: fixture.full,
      });
      expect(delta).toBe(fixture.expectedDeltaCents);
    }
  });

  it("payout eligibility fixtures match the resolver", () => {
    for (const fixture of payoutEligibilityFixtures()) {
      expect(resolvePayoutStatus(fixture.input)).toBe(fixture.expected);
    }
  });

  it("program summary mirrors live publication state", () => {
    const summary = programLabSummary();
    expect(summary.programPublished).toBe(true);
    expect(summary.thresholdCents).toBe(activeTerms().minimumPayoutThresholdCents);
  });
});
