import { describe, expect, it } from "vitest";

import {
  clerkPublishableKeyMode,
  clerkSecretKeyMode,
} from "@/lib/auth/clerk-config";
import { evaluateAuthProductionReadiness } from "@/lib/auth/production-readiness";

describe("auth production readiness", () => {
  it("detects matching test Clerk key pair", () => {
    const checks = evaluateAuthProductionReadiness({ production: false });
    const pair = checks.find((c) => c.id === "clerk_key_pair_match");
    expect(pair).toBeDefined();
    // Local dev should have keys from .env.local when present.
    if (
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
    ) {
      expect(pair!.ok).toBe(true);
    }
  });

  it("classifies key modes", () => {
    expect(clerkPublishableKeyMode("pk_test_abc")).toBe("test");
    expect(clerkSecretKeyMode("sk_live_abc")).toBe("live");
  });
});
