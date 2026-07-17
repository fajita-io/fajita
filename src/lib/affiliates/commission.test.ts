import { describe, expect, it } from "vitest";

import { computeCommission, computeReversal } from "./commission";

describe("computeCommission", () => {
  it("applies the rate to the full paid amount when tax is not excluded", () => {
    const r = computeCommission({
      amountPaidCents: 10000,
      taxCents: 800,
      rateBps: 2000,
      excludeTax: false,
    });
    expect(r.grossEligibleCents).toBe(10000);
    expect(r.excludedCents).toBe(0);
    expect(r.commissionCents).toBe(2000);
  });

  it("removes tax from the base when the program excludes it", () => {
    const r = computeCommission({
      amountPaidCents: 10800,
      taxCents: 800,
      rateBps: 2000,
      excludeTax: true,
    });
    expect(r.grossEligibleCents).toBe(10000);
    expect(r.excludedCents).toBe(800);
    expect(r.commissionCents).toBe(2000);
  });

  it("floors fractional commission cents", () => {
    const r = computeCommission({
      amountPaidCents: 999,
      taxCents: 0,
      rateBps: 2000,
      excludeTax: true,
    });
    // 999 * 0.20 = 199.8 -> 199
    expect(r.commissionCents).toBe(199);
  });

  it("never produces negative values", () => {
    const r = computeCommission({
      amountPaidCents: -50,
      taxCents: 100,
      rateBps: 2000,
      excludeTax: true,
    });
    expect(r.grossEligibleCents).toBe(0);
    expect(r.commissionCents).toBe(0);
  });

  it("caps excluded tax at the amount paid", () => {
    const r = computeCommission({
      amountPaidCents: 500,
      taxCents: 900,
      rateBps: 2000,
      excludeTax: true,
    });
    expect(r.grossEligibleCents).toBe(0);
    expect(r.excludedCents).toBe(500);
    expect(r.commissionCents).toBe(0);
  });
});

describe("computeReversal", () => {
  it("reverses proportionally to the refunded share", () => {
    // Half the base refunded -> half the commission reversed.
    const reversal = computeReversal({
      grossEligibleCents: 10000,
      commissionCents: 2000,
      alreadyReversedCents: 0,
      refundedCents: 5000,
    });
    expect(reversal).toBe(1000);
  });

  it("full reversal returns the standing commission", () => {
    const reversal = computeReversal({
      grossEligibleCents: 10000,
      commissionCents: 2000,
      alreadyReversedCents: 500,
      refundedCents: 0,
      full: true,
    });
    expect(reversal).toBe(1500);
  });

  it("never reverses more than what still stands", () => {
    const reversal = computeReversal({
      grossEligibleCents: 10000,
      commissionCents: 2000,
      alreadyReversedCents: 1800,
      refundedCents: 10000,
    });
    expect(reversal).toBe(200);
  });

  it("treats an over-refund as capped at the base", () => {
    const reversal = computeReversal({
      grossEligibleCents: 10000,
      commissionCents: 2000,
      alreadyReversedCents: 0,
      refundedCents: 999999,
    });
    expect(reversal).toBe(2000);
  });
});
