import { describe, expect, it } from "vitest";

import {
  estimateMonthlyChecks,
  formatChecksCompact,
  recommendPlanForChecks,
  VOLUME_TIERS,
} from "@/lib/billing/check-volume";

describe("check-volume", () => {
  it("estimates checks from monitors and interval", () => {
    expect(estimateMonthlyChecks(10, 300)).toBe(86_400);
    expect(estimateMonthlyChecks(50, 60)).toBe(2_160_000);
  });

  it("formats compact check counts", () => {
    expect(formatChecksCompact(100_000)).toBe("100K");
    expect(formatChecksCompact(2_000_000)).toBe("2M");
  });

  it("recommends plans by volume tier", () => {
    expect(recommendPlanForChecks(50_000)).toBe("starter");
    expect(recommendPlanForChecks(400_000)).toBe("pro");
    expect(recommendPlanForChecks(3_000_000)).toBe("business");
  });

  it("orders volume tiers ascending", () => {
    const checks = VOLUME_TIERS.map((t) => t.checksIncluded);
    expect(checks).toEqual([100_000, 500_000, 2_000_000, 6_000_000]);
  });
});
