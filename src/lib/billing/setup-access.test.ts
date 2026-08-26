import { describe, expect, it } from "vitest";

import type { OrgBillingState } from "@/lib/billing/engine";
import { BETA_ENTITLEMENTS, LOCKED_ENTITLEMENTS } from "@/lib/billing/catalog";
import {
  canEnterProductSetup,
  hasPaidProductAccess,
  isAppPathExemptFromPaymentGate,
  isOnboardingSetupPath,
  shouldSkipPaymentStep,
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
    isPromoGrant: false,
    promoCode: null,
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
    expect(isAppPathExemptFromPaymentGate("/app/onboarding")).toBe(true);
    expect(isAppPathExemptFromPaymentGate("/app")).toBe(false);
  });

  it("recognizes standalone signup setup paths", () => {
    expect(isOnboardingSetupPath("/app/new-organization")).toBe(true);
    expect(isOnboardingSetupPath("/app/start/payment")).toBe(true);
    expect(isOnboardingSetupPath("/app/invite/abc")).toBe(true);
    expect(isOnboardingSetupPath("/app/onboarding")).toBe(false);
  });

  it("skips payment and allows setup during beta grant", () => {
    const beta = billingState({
      accessState: "active",
      entitlements: BETA_ENTITLEMENTS,
      isBetaGrant: true,
    });
    expect(shouldSkipPaymentStep(beta)).toBe(true);
    expect(canEnterProductSetup(beta)).toBe(true);
  });

  it("allows product setup only with a real subscription", () => {
    const paid = billingState({
      status: "active",
      accessState: "active",
      isBetaGrant: false,
      subscriptionId: "sub-1",
    });
    expect(shouldSkipPaymentStep(paid)).toBe(true);
    expect(canEnterProductSetup(paid)).toBe(true);
  });

  it("treats promo grants as paid access", () => {
    const promo = billingState({
      accessState: "active",
      isBetaGrant: false,
      isPromoGrant: true,
      promoCode: "FAJITA-E2E-K7M2",
    });
    expect(hasPaidProductAccess(promo)).toBe(true);
    expect(shouldSkipPaymentStep(promo)).toBe(true);
    expect(canEnterProductSetup(promo)).toBe(true);
  });
});
