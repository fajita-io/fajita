import { describe, expect, it } from "vitest";

import { isValidPromoCode, normalizePromoCode } from "./codes";

describe("promo codes", () => {
  it("normalizes case and spaces", () => {
    expect(normalizePromoCode(" fajita-e2e-k7m2 ")).toBe("FAJITA-E2E-K7M2");
  });

  it("accepts the built-in no-card code", () => {
    expect(isValidPromoCode("fajita-e2e-k7m2")).toBe(true);
  });

  it("rejects empty and unknown codes", () => {
    expect(isValidPromoCode("")).toBe(false);
    expect(isValidPromoCode("NOT-A-CODE")).toBe(false);
  });
});
