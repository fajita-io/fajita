import { describe, expect, it } from "vitest";

import { planKeyFromAppsumoTier } from "@/lib/appsumo/tiers";

describe("planKeyFromAppsumoTier", () => {
  it("maps tier 1 to starter", () => {
    expect(planKeyFromAppsumoTier(1)).toBe("starter");
  });

  it("maps tier 2 to pro", () => {
    expect(planKeyFromAppsumoTier(2)).toBe("pro");
  });

  it("maps tier 3 and above to business", () => {
    expect(planKeyFromAppsumoTier(3)).toBe("business");
    expect(planKeyFromAppsumoTier(5)).toBe("business");
  });

  it("defaults missing tier to starter", () => {
    expect(planKeyFromAppsumoTier(undefined)).toBe("starter");
    expect(planKeyFromAppsumoTier(null)).toBe("starter");
  });
});
