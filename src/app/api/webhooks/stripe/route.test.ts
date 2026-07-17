import { beforeEach, describe, expect, it, vi } from "vitest";

const constructStripeEvent = vi.fn();
const handleStripeWebhookEvent = vi.fn();

vi.mock("@/lib/stripe/webhooks", () => ({
  constructStripeEvent,
  handleStripeWebhookEvent,
}));

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.resetModules();
    constructStripeEvent.mockReset();
    handleStripeWebhookEvent.mockReset();
  });

  it("returns 400 when stripe-signature is missing", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: "Missing stripe-signature header.",
    });
    expect(constructStripeEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    constructStripeEvent.mockRejectedValue(new Error("bad sig"));
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=abc" },
        body: '{"id":"evt_1"}',
      }),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: "Signature verification failed.",
    });
    expect(handleStripeWebhookEvent).not.toHaveBeenCalled();
  });

  it("returns 200 for processed and duplicate results", async () => {
    constructStripeEvent.mockResolvedValue({ id: "evt_ok", type: "invoice.paid" });
    handleStripeWebhookEvent.mockResolvedValue({ status: "processed" });
    const { POST } = await import("@/app/api/webhooks/stripe/route");

    const processed = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=abc" },
        body: "{}",
      }),
    );
    expect(processed.status).toBe(200);
    await expect(processed.json()).resolves.toMatchObject({
      status: "processed",
    });

    handleStripeWebhookEvent.mockResolvedValue({ status: "duplicate" });
    const dup = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=abc" },
        body: "{}",
      }),
    );
    expect(dup.status).toBe(200);
    await expect(dup.json()).resolves.toMatchObject({ status: "duplicate" });
  });

  it("returns 500 when processing fails so Stripe retries", async () => {
    constructStripeEvent.mockResolvedValue({ id: "evt_fail", type: "invoice.paid" });
    handleStripeWebhookEvent.mockResolvedValue({ status: "failed" });
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=abc" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(500);
  });
});
