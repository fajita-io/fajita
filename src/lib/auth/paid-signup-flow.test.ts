import { describe, expect, it } from "vitest";

import {
  buildNewOrganizationUrl,
  buildPaymentSetupUrl,
  buildSignupUrl,
  hasActiveSubscription,
  parseSignupPlanParams,
} from "@/lib/auth/paid-signup-flow";

describe("paid signup flow", () => {
  it("parses plan params with defaults", () => {
    expect(parseSignupPlanParams({})).toEqual({
      plan: "pro",
      interval: "month",
    });
    expect(parseSignupPlanParams({ plan: "starter", interval: "year" })).toEqual({
      plan: "starter",
      interval: "year",
    });
  });

  it("builds signup and onboarding URLs", () => {
    expect(buildSignupUrl("starter", "year")).toBe(
      "/signup?plan=starter&interval=year",
    );
    expect(buildNewOrganizationUrl("pro", "month")).toBe(
      "/app/new-organization?plan=pro&interval=month",
    );
    expect(buildPaymentSetupUrl("business", "year")).toBe(
      "/app/start/payment?plan=business&interval=year",
    );
  });

  it("detects active subscriptions", () => {
    expect(hasActiveSubscription("active")).toBe(true);
    expect(hasActiveSubscription("trialing")).toBe(true);
    expect(hasActiveSubscription("none")).toBe(false);
  });
});
