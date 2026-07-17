import { describe, expect, it } from "vitest";

import {
  payoutStatusExplanation,
  resolvePayoutStatus,
  type PayoutEligibilityInput,
} from "./payout-eligibility";

const base: PayoutEligibilityInput = {
  membershipState: "active",
  payoutHold: false,
  grossPayableCents: 10_000,
  thresholdCents: 5_000,
  provider: "stripe_connect",
  accountEnabled: true,
  taxStatus: "not_required",
};

describe("resolvePayoutStatus", () => {
  it("returns ready when everything is satisfied", () => {
    expect(resolvePayoutStatus(base)).toBe("ready");
  });

  it("holds suspended, terminated, and closed affiliates", () => {
    for (const state of ["suspended", "terminated", "closed"] as const) {
      expect(
        resolvePayoutStatus({ ...base, membershipState: state }),
      ).toBe("held");
    }
  });

  it("holds when an admin hold is set, even if otherwise ready", () => {
    expect(resolvePayoutStatus({ ...base, payoutHold: true })).toBe("held");
  });

  it("is not eligible when nothing is owed", () => {
    expect(resolvePayoutStatus({ ...base, grossPayableCents: 0 })).toBe(
      "not_eligible",
    );
  });

  it("waits below the threshold before checking setup or tax", () => {
    expect(
      resolvePayoutStatus({
        ...base,
        grossPayableCents: 4_999,
        accountEnabled: false,
        taxStatus: "required",
      }),
    ).toBe("below_threshold");
  });

  it("requires payout setup when the connected account cannot receive payouts", () => {
    expect(
      resolvePayoutStatus({ ...base, accountEnabled: false }),
    ).toBe("payout_setup_required");
  });

  it("does not require Stripe setup for manual provider", () => {
    expect(
      resolvePayoutStatus({
        ...base,
        provider: "manual",
        accountEnabled: false,
      }),
    ).toBe("ready");
  });

  it("blocks on tax states that need attention", () => {
    for (const status of ["required", "needs_attention", "expired"] as const) {
      expect(
        resolvePayoutStatus({ ...base, taxStatus: status }),
      ).toBe("tax_information_required");
    }
  });

  it("does not block on satisfied or pending-but-not-blocking tax states", () => {
    for (const status of [
      "verified",
      "not_required",
      "submitted",
      "not_started",
      "withholding_applied",
    ] as const) {
      expect(resolvePayoutStatus({ ...base, taxStatus: status })).toBe("ready");
    }
  });
});

describe("payoutStatusExplanation", () => {
  it("returns copy for every status without an em dash", () => {
    const statuses = [
      "ready",
      "below_threshold",
      "payout_setup_required",
      "tax_information_required",
      "held",
      "not_eligible",
    ] as const;
    for (const status of statuses) {
      const copy = payoutStatusExplanation(status);
      expect(copy.length).toBeGreaterThan(0);
      expect(copy).not.toContain("\u2014");
    }
  });
});
