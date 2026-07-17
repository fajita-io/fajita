import { describe, expect, it } from "vitest";

import {
  isHandledStripeEvent,
  resolveWebhookInboxAction,
  STRIPE_HANDLED_EVENTS,
} from "@/lib/billing/webhook-inbox";

describe("resolveWebhookInboxAction", () => {
  it("processes newly inserted events", () => {
    expect(
      resolveWebhookInboxAction({ inserted: true, priorStatus: null }),
    ).toBe("process_new");
  });

  it("returns duplicate when prior status is processed", () => {
    expect(
      resolveWebhookInboxAction({
        inserted: false,
        priorStatus: "processed",
      }),
    ).toBe("duplicate");
  });

  it("retries failed or processing priors", () => {
    expect(
      resolveWebhookInboxAction({ inserted: false, priorStatus: "failed" }),
    ).toBe("retry");
    expect(
      resolveWebhookInboxAction({
        inserted: false,
        priorStatus: "processing",
      }),
    ).toBe("retry");
  });
});

describe("isHandledStripeEvent", () => {
  it("includes subscription and invoice lifecycle events", () => {
    expect(isHandledStripeEvent("customer.subscription.updated")).toBe(true);
    expect(isHandledStripeEvent("invoice.paid")).toBe(true);
    expect(isHandledStripeEvent("charge.dispute.created")).toBe(true);
  });

  it("ignores unrelated Stripe event types", () => {
    expect(isHandledStripeEvent("ping")).toBe(false);
    expect(isHandledStripeEvent("product.created")).toBe(false);
  });

  it("keeps a stable handled set size for launch freeze awareness", () => {
    expect(STRIPE_HANDLED_EVENTS.size).toBe(11);
  });
});
