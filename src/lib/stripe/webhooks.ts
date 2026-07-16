import "server-only";

import type Stripe from "stripe";

import { DataFastGoals, trackServerGoal } from "@/lib/analytics";
import { getStripe } from "@/lib/stripe/server";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.finalized",
]);

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return secret;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId) return;

  await trackServerGoal({
    name: DataFastGoals.onboardingComplete,
    metadata: {
      step: "checkout_completed",
      ...(planId ? { plan: planId } : {}),
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  const planId = subscription.metadata?.plan_id;

  if (!userId) return;

  await trackServerGoal({
    name: DataFastGoals.onboardingComplete,
    metadata: {
      step: "subscription_updated",
      status: subscription.status,
      ...(planId ? { plan: planId } : {}),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const planId = invoice.parent?.subscription_details?.metadata?.plan_id;

  if (planId) {
    await trackServerGoal({
      name: DataFastGoals.onboardingComplete,
      metadata: {
        step: "invoice_paid",
        plan: planId,
      },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const planId = invoice.parent?.subscription_details?.metadata?.plan_id;

  await trackServerGoal({
    name: DataFastGoals.onboardingComplete,
    metadata: {
      step: "invoice_payment_failed",
      ...(planId ? { plan: planId } : {}),
    },
  });
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  if (!HANDLED_EVENTS.has(event.type)) {
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case "invoice.finalized":
      break;
    default:
      break;
  }
}

export async function constructStripeEvent(
  payload: string,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, getWebhookSecret());
}
