import { beforeEach, describe, expect, it, vi } from "vitest";

const checkoutSessionsCreate = vi.fn();
const pricesList = vi.fn();
const customersCreate = vi.fn();

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({
    checkout: { sessions: { create: checkoutSessionsCreate } },
    prices: { list: pricesList },
    customers: { create: customersCreate },
  }),
}));

vi.mock("@/lib/analytics/stripe", () => ({
  getStripeDataFastMetadata: vi.fn(async (extra: Record<string, string>) => extra),
}));

vi.mock("@/lib/stripe/entitlements", () => ({
  resolvePriceId: vi.fn(async () => "price_test"),
}));

vi.mock("@/lib/billing/customers", () => ({
  getOrCreateOrgStripeCustomer: vi.fn(async () => "cus_test"),
}));

vi.mock("@/lib/billing/engine", () => ({
  loadCurrentSubscription: vi.fn(async () => null),
}));

function serviceClientMock() {
  const chain = {
    eq: vi.fn(() => chain),
    in: vi.fn(async () => ({ error: null })),
    update: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(async () => ({
      data: { id: "intent_test" },
      error: null,
    })),
    insert: vi.fn(() => chain),
  };
  return { from: vi.fn(() => chain) };
}

vi.mock("@/lib/supabase/service", () => ({
  serviceClient: vi.fn(() => serviceClientMock()),
}));

describe("startCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://fajita.io");
    checkoutSessionsCreate.mockResolvedValue({
      id: "cs_test",
      url: "https://checkout.stripe.com/c/pay/cs_test",
    });
  });

  it("creates subscription Checkout with card payment_method_types only", async () => {
    const { startCheckout } = await import("./checkout");

    const result = await startCheckout({
      organizationId: "11111111-1111-4111-8111-111111111111",
      organizationName: "Acme",
      initiatedByUserId: "22222222-2222-4222-8222-222222222222",
      billingEmail: "ops@acme.test",
      planKey: "pro",
      interval: "month",
    });

    expect(result.url).toContain("checkout.stripe.com");
    expect(checkoutSessionsCreate).toHaveBeenCalledTimes(1);
    const [params] = checkoutSessionsCreate.mock.calls[0] as [
      Record<string, unknown>,
    ];
    expect(params.payment_method_types).toEqual(["card"]);
    expect(params).not.toHaveProperty("automatic_payment_methods");
    expect(params.payment_method_collection).toBe("if_required");
    expect(params.mode).toBe("subscription");
  });
});
