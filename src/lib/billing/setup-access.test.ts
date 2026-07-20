import { describe, expect, it } from "vitest";

import type { OrgBillingState } from "@/lib/billing/engine";
import { BETA_ENTITLEMENTS, LOCKED_ENTITLEMENTS } from "@/lib/billing/catalog";
import {
  hasPaidProductAccess,
  isAppPathExemptFromPaymentGate,
} from "@/lib/billing/setup-access";

function billingState(
  overrides: Partial<OrgBillingState> = {},
): OrgBillingState {
  return {
    organizationId: "org-1",
    planKey: null,
    interval: null,
    status: "none",
    accessState: "none",
    entitlements: LOCKED_ENTITLEMENTS,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    cancellationEffectiveAt: null,
    recurringAmountCents: 0,
    currency: "usd",
    grace: null,
    isBetaGrant: true,
    ...overrides,
  };
}

describe("setup access", () => {
  it("does not treat beta grants as paid access", () => {
    expect(
      hasPaidProductAccess(
        billingState({
          accessState: "active",
          entitlements: BETA_ENTITLEMENTS,
          isBetaGrant: true,
        }),
      ),
    ).toBe(false);
  });

  it("allows active subscriptions", () => {
    expect(
      hasPaidProductAccess(
        billingState({
          status: "active",
          accessState: "active",
          isBetaGrant: false,
          subscriptionId: "sub-1",
        }),
      ),
    ).toBe(true);
  });

  it("allows grace on an existing subscription", () => {
    expect(
      hasPaidProductAccess(
        billingState({
          status: "past_due",
          accessState: "grace_period",
          isBetaGrant: false,
          subscriptionId: "sub-1",
        }),
      ),
    ).toBe(true);
  });

  it("exempts billing settings from the app payment gate", () => {
    expect(isAppPathExemptFromPaymentGate("/app/settings/billing")).toBe(true);
    expect(isAppPathExemptFromPaymentGate("/app/settings/billing/plans")).toBe(
      true,
    );
    expect(isAppPathExemptFromPaymentGate("/app")).toBe(false);
  });
});
