import { describe, expect, it } from "vitest";

import {
  buildNewOrganizationUrl,
  buildPaymentSetupUrl,
  buildSignupUrl,
  hasActiveSubscription,
  hasBillingAccess,
  parseSignupPlanParams,
} from "@/lib/auth/paid-signup-flow";

describe("paid signup flow", () => {
  it("parses explicit plan params and leaves plan null otherwise", () => {
    expect(parseSignupPlanParams({})).toEqual({
      plan: null,
      interval: "month",
    });
    expect(parseSignupPlanParams({ plan: "starter", interval: "year" })).toEqual({
      plan: "starter",
      interval: "year",
    });
  });

  it("builds signup and onboarding URLs", () => {
    expect(buildSignupUrl()).toBe("/signup");
    expect(buildSignupUrl("starter", "year")).toBe(
      "/signup?plan=starter&interval=year",
    );
    expect(buildNewOrganizationUrl()).toBe("/app/new-organization");
    expect(buildNewOrganizationUrl("pro", "month")).toBe(
      "/app/new-organization?plan=pro&interval=month",
    );
    expect(buildPaymentSetupUrl()).toBe("/app/start/payment");
    expect(buildPaymentSetupUrl("business", "year")).toBe(
      "/app/start/payment?plan=business&interval=year",
    );
  });

  it("detects active subscriptions", () => {
    expect(hasActiveSubscription("active")).toBe(true);
    expect(hasActiveSubscription("trialing")).toBe(true);
    expect(hasActiveSubscription("none")).toBe(false);
  });

  it("allows setup during beta grant or grace", () => {
    expect(
      hasBillingAccess({ status: "none", accessState: "active" }),
    ).toBe(true);
    expect(
      hasBillingAccess({ status: "past_due", accessState: "grace_period" }),
    ).toBe(true);
    expect(
      hasBillingAccess({ status: "none", accessState: "none" }),
    ).toBe(false);
  });
});
