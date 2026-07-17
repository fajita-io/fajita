import { describe, expect, it } from "vitest";

import {
  deriveAccessState,
  isPayingStatus,
  mapStripeSubscriptionStatus,
  shouldApplyEvent,
  subscriptionStatusLabel,
} from "@/lib/billing/subscription-state";

describe("mapStripeSubscriptionStatus", () => {
  it("maps active to active, or cancellation_scheduled when set to cancel", () => {
    expect(
      mapStripeSubscriptionStatus({ status: "active", cancelAtPeriodEnd: false }),
    ).toBe("active");
    expect(
      mapStripeSubscriptionStatus({ status: "active", cancelAtPeriodEnd: true }),
    ).toBe("cancellation_scheduled");
  });

  it("surfaces SCA on past_due and incomplete", () => {
    expect(
      mapStripeSubscriptionStatus({
        status: "past_due",
        cancelAtPeriodEnd: false,
        paymentActionRequired: true,
      }),
    ).toBe("payment_action_required");
    expect(
      mapStripeSubscriptionStatus({
        status: "past_due",
        cancelAtPeriodEnd: false,
      }),
    ).toBe("past_due");
    expect(
      mapStripeSubscriptionStatus({
        status: "incomplete",
        cancelAtPeriodEnd: false,
        paymentActionRequired: true,
      }),
    ).toBe("payment_action_required");
  });

  it("maps terminal and paused states", () => {
    expect(
      mapStripeSubscriptionStatus({ status: "canceled", cancelAtPeriodEnd: false }),
    ).toBe("canceled");
    expect(
      mapStripeSubscriptionStatus({
        status: "incomplete_expired",
        cancelAtPeriodEnd: false,
      }),
    ).toBe("incomplete_expired");
    expect(
      mapStripeSubscriptionStatus({ status: "paused", cancelAtPeriodEnd: false }),
    ).toBe("paused");
    expect(
      mapStripeSubscriptionStatus({ status: "unpaid", cancelAtPeriodEnd: false }),
    ).toBe("unpaid");
  });
});

describe("deriveAccessState", () => {
  it("keeps access for active, trialing, and scheduled cancellation", () => {
    for (const status of [
      "active",
      "trialing",
      "cancellation_scheduled",
    ] as const) {
      expect(deriveAccessState({ status, restricted: false })).toBe("active");
    }
  });

  it("grants grace before the window elapses and restricts after", () => {
    expect(
      deriveAccessState({ status: "past_due", restricted: false }),
    ).toBe("grace_period");
    expect(
      deriveAccessState({ status: "past_due", restricted: true }),
    ).toBe("restricted");
    expect(
      deriveAccessState({ status: "payment_action_required", restricted: false }),
    ).toBe("grace_period");
  });

  it("admin suspension always restricts", () => {
    expect(
      deriveAccessState({ status: "active", restricted: false, adminSuspended: true }),
    ).toBe("restricted");
  });

  it("canceled is read-only retention, unknown states lock", () => {
    expect(deriveAccessState({ status: "canceled", restricted: false })).toBe(
      "canceled",
    );
    expect(deriveAccessState({ status: "none", restricted: false })).toBe("none");
    expect(
      deriveAccessState({ status: "incomplete", restricted: false }),
    ).toBe("none");
  });
});

describe("shouldApplyEvent", () => {
  it("applies when nothing is stored", () => {
    expect(shouldApplyEvent(null, 100)).toBe(true);
  });

  it("applies newer or equal, rejects older (out-of-order guard)", () => {
    expect(shouldApplyEvent(100, 200)).toBe(true);
    expect(shouldApplyEvent(100, 100)).toBe(true);
    expect(shouldApplyEvent(200, 100)).toBe(false);
  });
});

describe("isPayingStatus / labels", () => {
  it("counts active, scheduled cancellation, grace, and past_due as paying", () => {
    expect(isPayingStatus("active")).toBe(true);
    expect(isPayingStatus("cancellation_scheduled")).toBe(true);
    expect(isPayingStatus("grace_period")).toBe(true);
    expect(isPayingStatus("past_due")).toBe(true);
    expect(isPayingStatus("canceled")).toBe(false);
    expect(isPayingStatus("none")).toBe(false);
  });

  it("never returns a raw Stripe status string", () => {
    expect(subscriptionStatusLabel("cancellation_scheduled")).toBe(
      "Cancels at period end",
    );
    expect(subscriptionStatusLabel("payment_action_required")).toBe(
      "Action needed",
    );
  });
});
