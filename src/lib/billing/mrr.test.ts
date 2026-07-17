import { describe, expect, it } from "vitest";

import {
  computeRevenueTotals,
  formatUsdCents,
  subscriptionMrrCents,
  type RevenueRow,
} from "@/lib/billing/mrr";

describe("subscriptionMrrCents", () => {
  it("counts a monthly plan at its monthly amount", () => {
    expect(
      subscriptionMrrCents({
        status: "active",
        interval: "month",
        recurringAmountCents: 1900,
      }),
    ).toBe(1900);
  });

  it("normalizes an annual plan to a monthly value", () => {
    expect(
      subscriptionMrrCents({
        status: "active",
        interval: "year",
        recurringAmountCents: 19000,
      }),
    ).toBe(Math.round(19000 / 12));
  });

  it("keeps cancellation-scheduled and grace as MRR", () => {
    expect(
      subscriptionMrrCents({
        status: "cancellation_scheduled",
        interval: "month",
        recurringAmountCents: 900,
      }),
    ).toBe(900);
    expect(
      subscriptionMrrCents({
        status: "grace_period",
        interval: "month",
        recurringAmountCents: 900,
      }),
    ).toBe(900);
  });

  it("excludes trialing, incomplete, canceled, and non-positive amounts", () => {
    expect(
      subscriptionMrrCents({
        status: "trialing",
        interval: "month",
        recurringAmountCents: 1900,
      }),
    ).toBe(0);
    expect(
      subscriptionMrrCents({
        status: "canceled",
        interval: "month",
        recurringAmountCents: 1900,
      }),
    ).toBe(0);
    expect(
      subscriptionMrrCents({
        status: "active",
        interval: "month",
        recurringAmountCents: 0,
      }),
    ).toBe(0);
  });
});

describe("computeRevenueTotals", () => {
  it("aggregates MRR, ARR, paying orgs, mix, and ARPA", () => {
    const rows: RevenueRow[] = [
      { planKey: "pro", status: "active", interval: "month", recurringAmountCents: 1900 },
      { planKey: "starter", status: "active", interval: "year", recurringAmountCents: 9000 },
      { planKey: "pro", status: "cancellation_scheduled", interval: "month", recurringAmountCents: 1900 },
      // Excluded: trialing contributes nothing and is not a paying org.
      { planKey: "business", status: "trialing", interval: "month", recurringAmountCents: 3900 },
    ];

    const totals = computeRevenueTotals(rows);
    const annualMonthly = Math.round(9000 / 12); // 750
    const expectedMrr = 1900 + annualMonthly + 1900;

    expect(totals.mrrCents).toBe(expectedMrr);
    expect(totals.arrCents).toBe(expectedMrr * 12);
    expect(totals.payingOrganizations).toBe(3);
    expect(totals.monthlyCount).toBe(2);
    expect(totals.annualCount).toBe(1);
    expect(totals.planMix).toEqual({ pro: 2, starter: 1 });
    expect(totals.arpaCents).toBe(Math.round(expectedMrr / 3));
  });

  it("returns zeroes for no paying subscriptions", () => {
    const totals = computeRevenueTotals([
      { planKey: "pro", status: "trialing", interval: "month", recurringAmountCents: 1900 },
    ]);
    expect(totals.mrrCents).toBe(0);
    expect(totals.payingOrganizations).toBe(0);
    expect(totals.arpaCents).toBe(0);
  });
});

describe("formatUsdCents", () => {
  it("formats cents as a plain USD string", () => {
    expect(formatUsdCents(1900)).toBe("$19.00");
    expect(formatUsdCents(0)).toBe("$0.00");
    expect(formatUsdCents(123456)).toBe("$1,234.56");
  });
});
