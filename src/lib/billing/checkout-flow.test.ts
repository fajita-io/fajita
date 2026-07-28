import { describe, expect, it, vi } from "vitest";

import { getStripeDataFastMetadata } from "@/lib/analytics/stripe";
import { buildPaymentSetupUrl, buildSignupUrl } from "@/lib/auth/paid-signup-flow";

vi.mock("@/lib/analytics/server", () => ({
  getDataFastAttributionCookies: vi.fn(async () => ({
    datafast_visitor_id: "visitor_test",
    datafast_session_id: "session_test",
  })),
}));

describe("conversion checkout wiring", () => {
  it("builds signup URLs with plan and interval for marketing CTAs", () => {
    expect(buildSignupUrl("pro", "year")).toBe("/signup?plan=pro&interval=year");
    expect(buildPaymentSetupUrl("starter", "month")).toBe(
      "/app/start/payment?plan=starter&interval=month",
    );
  });

  it("merges DataFast attribution into Stripe checkout metadata", async () => {
    const metadata = await getStripeDataFastMetadata({
      organization_id: "org_123",
      plan_key: "pro",
      billing_interval: "month",
    });
    expect(metadata.organization_id).toBe("org_123");
    expect(metadata.plan_key).toBe("pro");
    expect(metadata.datafast_visitor_id).toBe("visitor_test");
    expect(metadata.datafast_session_id).toBe("session_test");
  });
});
