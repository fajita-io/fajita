import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { processStripeWebhookEvent } from "@/lib/billing/webhook-processor";

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return secret;
}

export type WebhookResult = Awaited<
  ReturnType<typeof processStripeWebhookEvent>
>;

/**
 * Process a verified Stripe event. Idempotent and safe to call more than once
 * for the same event id. Delegates to the billing webhook processor, which
 * persists subscription state, payment events, grace periods, and entitlement
 * snapshots.
 */
export async function handleStripeWebhookEvent(
  event: Stripe.Event,
): Promise<WebhookResult> {
  return processStripeWebhookEvent(event);
}

/** Verify a Stripe signature against the raw body. Throws on any mismatch. */
export async function constructStripeEvent(
  payload: string,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, getWebhookSecret());
}
