import { describe, expect, it, vi } from "vitest";

import {
  clerkPublishableKeyMode,
  clerkSecretKeyMode,
} from "@/lib/auth/clerk-config";
import {
  authProductionReady,
  evaluateAuthProductionReadiness,
} from "@/lib/auth/production-readiness";

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

  it("allows Stage 0 production builds without Stripe when billing is off", () => {
    vi.stubEnv("BILLING_ENFORCEMENT_ENABLED", "");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_live_abc");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_live_abc");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://fajita.io");

    expect(
      authProductionReady({ production: true, forBuild: true }),
    ).toBe(true);
    expect(authProductionReady({ production: true })).toBe(false);
  });
});
