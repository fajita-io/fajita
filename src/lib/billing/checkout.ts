import "server-only";

import { getStripe } from "@/lib/stripe/server";
import { serviceClient } from "@/lib/supabase/service";
import { Conflict } from "@/lib/auth/errors";
import { resolvePriceId } from "@/lib/stripe/entitlements";
import type { BillingInterval, PlanId } from "@/lib/stripe/plans";
import { getOrCreateOrgStripeCustomer } from "@/lib/billing/customers";
import { loadCurrentSubscription } from "@/lib/billing/engine";
import { stripeLivePaymentsReady } from "@/lib/billing/stripe-account";

const INTENT_TTL_MINUTES = 60;

export function appUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_DATAFAST_DOMAIN ??
    "http://localhost:3000";
  return url.startsWith("http") ? url : `https://${url}`;
}

interface StartCheckoutInput {
  organizationId: string;
  organizationName: string;
  initiatedByUserId: string;
  billingEmail: string | null;
  planKey: PlanId;
  interval: BillingInterval;
}

/**
 * Start a Stripe Checkout session for a new subscription. Refuses when the org
 * already has a live subscription (existing subscribers change plan through the
 * portal / change-plan flow, never a second base-plan checkout). Records a
 * checkout intent and prevents duplicate concurrent intents.
 */
export async function startCheckout(
  input: StartCheckoutInput,
): Promise<{ url: string; intentId: string }> {
  const db = serviceClient();

  // Duplicate subscription prevention: never open a base-plan checkout for an
  // org that already has a live subscription.
  const existing = await loadCurrentSubscription(input.organizationId);
  if (
    existing &&
    existing.status !== "canceled" &&
    existing.status !== "incomplete_expired" &&
    existing.status !== "none"
  ) {
    throw Conflict(
      "This organization already has a subscription. Change the plan from billing settings.",
    );
  }

  // Expire any stale pending intents for this org before creating a new one.
  await db
    .from("billing_checkout_intents")
    .update({ status: "replaced" } as never)
    .eq("organization_id", input.organizationId)
    .in("status", ["pending", "checkout_created"]);

  const { data: intent, error: intentError } = await db
    .from("billing_checkout_intents")
    .insert({
      organization_id: input.organizationId,
      initiated_by_user_id: input.initiatedByUserId,
      plan_key: input.planKey,
      billing_interval: input.interval,
      status: "pending",
      expires_at: new Date(
        Date.now() + INTENT_TTL_MINUTES * 60 * 1000,
      ).toISOString(),
    } as never)
    .select("id")
    .single();
  if (intentError || !intent) throw intentError ?? new Error("intent");

  const customerId = await getOrCreateOrgStripeCustomer({
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    billingEmail: input.billingEmail,
  });

  const priceId = await resolvePriceId(input.planKey, input.interval);
  const stripe = getStripe();
  const base = appUrl();
  const paymentsReady = await stripeLivePaymentsReady();

  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // When a promo zeroes the total, do not collect a card. Required for $0
      // subscriptions while Stripe account review is still pending.
      payment_method_collection: "if_required",
      ...(paymentsReady
        ? { automatic_payment_methods: { enabled: true } }
        : {
            // Session can still open while card_payments is pending; card is only
            // collected when the total due is greater than zero.
            payment_method_types: ["card"],
          }),
      success_url: `${base}/billing/checkout/success?intent=${intent.id}`,
      cancel_url: `${base}/billing/checkout/canceled?intent=${intent.id}`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      client_reference_id: input.organizationId,
      subscription_data: {
        metadata: {
          organization_id: input.organizationId,
          checkout_intent_id: intent.id,
          plan_key: input.planKey,
          billing_interval: input.interval,
        },
      },
      metadata: {
        organization_id: input.organizationId,
        checkout_intent_id: intent.id,
        plan_key: input.planKey,
        billing_interval: input.interval,
        environment: process.env.NODE_ENV ?? "development",
      },
    },
    { idempotencyKey: `checkout-${intent.id}` },
  );

  await db
    .from("billing_checkout_intents")
    .update({
      status: "checkout_created",
      stripe_checkout_session_id: session.id,
    } as never)
    .eq("id", intent.id);

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return { url: session.url, intentId: intent.id };
}
