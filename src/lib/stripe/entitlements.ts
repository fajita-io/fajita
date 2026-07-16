import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import {
  type BillingInterval,
  type PlanId,
  PLANS,
  getPlanLookupKey,
} from "@/lib/stripe/plans";

export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export type BillingEntitlement = {
  planId: PlanId | "free";
  status: SubscriptionStatus;
  monitorLimit: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
]);

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  if (!periodEnd) return null;
  return new Date(periodEnd * 1000).toISOString();
}

function planIdFromPriceLookupKey(lookupKey: string | null | undefined): PlanId | null {
  if (!lookupKey) return null;

  for (const plan of Object.values(PLANS)) {
    if (
      plan.lookupKeys.month === lookupKey ||
      plan.lookupKeys.year === lookupKey
    ) {
      return plan.id;
    }
  }

  return null;
}

function planIdFromSubscription(subscription: Stripe.Subscription): PlanId | null {
  const item = subscription.items.data[0];
  const price = item?.price;
  return (
    planIdFromPriceLookupKey(price?.lookup_key) ??
    (price?.metadata?.plan_id as PlanId | undefined) ??
    null
  );
}

export async function resolvePriceId(
  planId: PlanId,
  interval: BillingInterval,
): Promise<string> {
  const stripe = getStripe();
  const lookupKey = getPlanLookupKey(planId, interval);

  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
    expand: ["data.product"],
  });

  const price = prices.data[0];
  if (!price) {
    throw new Error(
      `No active Stripe price found for lookup key "${lookupKey}". Create it in the Stripe Dashboard.`,
    );
  }

  return price.id;
}

export async function getBillingEntitlementForCustomer(
  stripeCustomerId: string,
): Promise<BillingEntitlement> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 10,
    expand: ["data.items.data.price"],
  });

  const subscription =
    subscriptions.data.find((entry) => ACTIVE_STATUSES.has(entry.status)) ??
    subscriptions.data[0];

  if (!subscription || !ACTIVE_STATUSES.has(subscription.status)) {
    return {
      planId: "free",
      status: subscription?.status === "canceled" ? "canceled" : "free",
      monitorLimit: 0,
      stripeCustomerId,
      stripeSubscriptionId: subscription?.id ?? null,
      currentPeriodEnd: subscription ? getSubscriptionPeriodEnd(subscription) : null,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    };
  }

  const planId = planIdFromSubscription(subscription) ?? "starter";

  return {
    planId,
    status: subscription.status as SubscriptionStatus,
    monitorLimit: PLANS[planId].monitorLimit,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

export async function getBillingEntitlementForUserId(
  userId: string,
): Promise<BillingEntitlement> {
  const stripe = getStripe();

  const result = await stripe.customers.search({
    query: `metadata['user_id']:'${userId}'`,
    limit: 1,
  });

  const customer = result.data[0];
  if (!customer || "deleted" in customer) {
    return {
      planId: "free",
      status: "free",
      monitorLimit: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  return getBillingEntitlementForCustomer(customer.id);
}
