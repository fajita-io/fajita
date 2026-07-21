import { afterEach, describe, expect, it, vi } from "vitest";

describe("stripeLivePaymentsReady", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns true for test secret keys without calling Stripe", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_example");
    vi.stubEnv("STRIPE_LIVE_PAYMENTS_READY", "");
    const { stripeLivePaymentsReady } = await import("./stripe-account");
    await expect(stripeLivePaymentsReady()).resolves.toBe(true);
  });

  it("honors STRIPE_LIVE_PAYMENTS_READY override", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_example");
    vi.stubEnv("STRIPE_LIVE_PAYMENTS_READY", "false");
    const { stripeLivePaymentsReady } = await import("./stripe-account");
    await expect(stripeLivePaymentsReady()).resolves.toBe(false);
  });
});
