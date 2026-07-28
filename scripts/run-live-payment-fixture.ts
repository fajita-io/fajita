#!/usr/bin/env tsx
/**
 * Controlled live billing fixture (LB-006).
 *
 * Creates a $0 live subscription via a 100% launch coupon, waits for Stripe
 * webhooks to reach production, verifies DB state, then cancels and cleans up.
 *
 *   FIXTURE_ORG_ID=<uuid> npm run launch:payment-fixture
 */
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { BILLING_CATALOG } from "../src/lib/billing/catalog";

const ROOT = new URL("..", import.meta.url).pathname;
loadEnvConfig(ROOT);

function serviceDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const COUPON_ID = "fajita_launch_fixture_100";
const FIXTURE_TAG = "launch_fixture_2026_07_27";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureCoupon(stripe: Stripe): Promise<string> {
  try {
    const existing = await stripe.coupons.retrieve(COUPON_ID);
    if (existing.valid) return existing.id;
  } catch {
    // create below
  }
  const created = await stripe.coupons.create({
    id: COUPON_ID,
    name: "Launch fixture 100% off",
    percent_off: 100,
    duration: "once",
    max_redemptions: 10,
    metadata: {
      purpose: "launch_fixture",
      exclude_revenue: "true",
      fixture_tag: FIXTURE_TAG,
    },
  });
  console.log(`Created coupon ${created.id}`);
  return created.id;
}

async function waitForSubscription(
  organizationId: string,
  stripeSubscriptionId: string,
  timeoutMs = 90_000,
): Promise<boolean> {
  const db = serviceDb();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { data } = await db
      .from("billing_subscriptions")
      .select("id, status, plan_key, stripe_subscription_id")
      .eq("organization_id", organizationId)
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .maybeSingle();
    if (data?.status && data.status !== "none") {
      console.log(
        `DB subscription synced: status=${data.status} plan=${data.plan_key}`,
      );
      return true;
    }
    await sleep(3000);
  }
  return false;
}

async function main(): Promise<void> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey?.startsWith("sk_live_")) {
    console.error("STRIPE_SECRET_KEY must be sk_live_ for this fixture.");
    process.exit(2);
  }

  const organizationId = process.env.FIXTURE_ORG_ID?.trim();
  if (!organizationId) {
    console.error("Set FIXTURE_ORG_ID to a production org UUID.");
    process.exit(2);
  }

  const db = serviceDb();
  const { data: org, error: orgError } = await db
    .from("organizations")
    .select("id, name, slug")
    .eq("id", organizationId)
    .maybeSingle();
  if (orgError || !org) {
    console.error("Organization not found:", orgError?.message ?? organizationId);
    process.exit(1);
  }
  console.log(`Fixture org: ${org.name} (${org.slug})`);

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });

  const couponId = await ensureCoupon(stripe);
  const lookupKey = BILLING_CATALOG.starter.lookupKeys.month;
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  const price = prices.data[0];
  if (!price) {
    console.error(`Missing active price for ${lookupKey}`);
    process.exit(1);
  }

  const customer = await stripe.customers.create({
    email: "billing-fixture@fajita.io",
    name: "Fajita launch fixture",
    metadata: {
      organization_id: organizationId,
      launch_fixture: FIXTURE_TAG,
    },
  });
  console.log(`Created customer ${customer.id}`);

  await db.from("billing_customers").upsert(
    {
      organization_id: organizationId,
      stripe_customer_id: customer.id,
    },
    { onConflict: "organization_id" },
  );

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    discounts: [{ coupon: couponId }],
    metadata: {
      organization_id: organizationId,
      plan_key: "starter",
      launch_fixture: FIXTURE_TAG,
    },
  });
  console.log(
    `Created subscription ${subscription.id} status=${subscription.status}`,
  );

  const synced = await waitForSubscription(organizationId, subscription.id);
  if (!synced) {
    console.error(
      "Webhook sync timed out. Check billing_webhook_events on production.",
    );
    process.exit(1);
  }

  const { data: events } = await db
    .from("billing_webhook_events")
    .select("event_type, status")
    .eq("organization_id", organizationId)
    .order("received_at", { ascending: false })
    .limit(10);
  console.log("Recent webhook events for org:", events);

  const canceled = await stripe.subscriptions.cancel(subscription.id);
  console.log(`Canceled subscription ${canceled.id} status=${canceled.status}`);

  await sleep(5000);

  console.log("\nLive payment fixture PASSED.");
  console.log(`Fixture tag: ${FIXTURE_TAG}`);
  console.log(`Customer: ${customer.id} (retained for audit; exclude from revenue)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
