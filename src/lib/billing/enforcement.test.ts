import { afterEach, describe, expect, it, vi } from "vitest";

describe("BILLING_ENFORCEMENT_ENABLED", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to false when unset", async () => {
    vi.stubEnv("BILLING_ENFORCEMENT_ENABLED", "");
    const mod = await import("@/lib/billing/enforcement");
    expect(mod.BILLING_ENFORCEMENT_ENABLED).toBe(false);
  });

  it("enables for true/1/on", async () => {
    vi.stubEnv("BILLING_ENFORCEMENT_ENABLED", "true");
    const mod = await import("@/lib/billing/enforcement");
    expect(mod.BILLING_ENFORCEMENT_ENABLED).toBe(true);
  });
});
