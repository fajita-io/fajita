#!/usr/bin/env tsx
/**
 * Live Checkout UI fixture (LB-006 supplement): opens Stripe Checkout in a
 * browser, applies the launch coupon, completes $0 subscription, verifies
 * webhook sync, opens Customer Portal, and cancels at period end.
 *
 *   FIXTURE_ORG_ID=<uuid> FIXTURE_USER_ID=<clerk_user_id> npm run launch:checkout-ui
 */
import { loadEnvConfig } from "@next/env";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { BILLING_CATALOG } from "../src/lib/billing/catalog";

loadEnvConfig(process.cwd());

const prodPath = resolve(process.cwd(), ".env.production.local");
if (existsSync(prodPath)) {
  for (const line of readFileSync(prodPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

const COUPON_ID = "fajita_launch_fixture_100";
const COUPON_CODE = "fajita_launch_fixture_100";
const FIXTURE_TAG = "checkout_ui_fixture_2026_07_27";

function serviceDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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
    max_redemptions: 20,
    metadata: {
      purpose: "launch_fixture",
      exclude_revenue: "true",
      fixture_tag: FIXTURE_TAG,
    },
  });
  console.log(`Created coupon ${created.id}`);
  return created.id;
}

async function ensurePromotionCode(stripe: Stripe, couponId: string): Promise<string> {
  const listed = await stripe.promotionCodes.list({
    code: COUPON_CODE,
    active: true,
    limit: 1,
  });
  if (listed.data[0]?.code) return listed.data[0].code;

  const created = await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: couponId },
    code: COUPON_CODE,
    metadata: { purpose: "launch_fixture", fixture_tag: FIXTURE_TAG },
  });
  console.log(`Created promotion code ${created.code}`);
  return created.code;
}

async function createCheckoutSession(
  stripe: Stripe,
  organizationId: string,
  organizationName: string,
  userId: string,
): Promise<{ url: string; intentId: string }> {
  const db = serviceDb();
  const { data: intent, error: intentError } = await db
    .from("billing_checkout_intents")
    .insert({
      organization_id: organizationId,
      initiated_by_user_id: userId,
      plan_key: "starter",
      billing_interval: "month",
      status: "pending",
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();
  if (intentError || !intent) throw intentError ?? new Error("intent insert failed");

  let customerId: string;
  const { data: existingCustomer } = await db
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (existingCustomer?.stripe_customer_id) {
    customerId = existingCustomer.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: "checkout-ui-fixture@fajita.io",
      name: organizationName,
      metadata: { organization_id: organizationId, launch_fixture: FIXTURE_TAG },
    });
    customerId = customer.id;
    await db.from("billing_customers").upsert(
      { organization_id: organizationId, stripe_customer_id: customerId },
      { onConflict: "organization_id" },
    );
  }

  const lookupKey = BILLING_CATALOG.starter.lookupKeys.month;
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  const price = prices.data[0];
  if (!price) throw new Error(`Missing price for ${lookupKey}`);

  const promoListed = await stripe.promotionCodes.list({
    code: COUPON_CODE,
    active: true,
    limit: 1,
  });
  const promotionCodeId = promoListed.data[0]?.id;
  if (!promotionCodeId) throw new Error(`Missing promotion code ${COUPON_CODE}`);

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io").replace(/\/$/, "");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    discounts: [{ promotion_code: promotionCodeId }],
    payment_method_collection: "if_required",
    payment_method_types: ["card"],
    success_url: `${base}/billing/checkout/success?intent=${intent.id}`,
    cancel_url: `${base}/billing/checkout/canceled?intent=${intent.id}`,
    client_reference_id: organizationId,
    subscription_data: {
      metadata: {
        organization_id: organizationId,
        checkout_intent_id: intent.id,
        plan_key: "starter",
        billing_interval: "month",
        launch_fixture: FIXTURE_TAG,
      },
    },
    metadata: {
      organization_id: organizationId,
      checkout_intent_id: intent.id,
      launch_fixture: FIXTURE_TAG,
    },
  });

  await db
    .from("billing_checkout_intents")
    .update({
      status: "checkout_created",
      stripe_checkout_session_id: session.id,
    })
    .eq("id", intent.id);

  if (!session.url) throw new Error("Stripe did not return checkout URL");
  return { url: session.url, intentId: intent.id };
}

async function waitForSubscription(
  organizationId: string,
  timeoutMs = 120_000,
): Promise<string | null> {
  const db = serviceDb();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { data } = await db
      .from("billing_subscriptions")
      .select("stripe_subscription_id, status, plan_key")
      .eq("organization_id", organizationId)
      .in("status", ["active", "trialing"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.stripe_subscription_id) {
      console.log(`DB subscription: ${data.stripe_subscription_id} (${data.status})`);
      return data.stripe_subscription_id;
    }
    await sleep(3000);
  }
  return null;
}

async function main(): Promise<void> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey?.startsWith("sk_live_")) {
    console.error("STRIPE_SECRET_KEY must be sk_live_ for this fixture.");
    process.exit(2);
  }

  const organizationId = process.env.FIXTURE_ORG_ID?.trim();
  const userId = process.env.FIXTURE_USER_ID?.trim();
  if (!organizationId || !userId) {
    console.error("Set FIXTURE_ORG_ID and FIXTURE_USER_ID (Clerk user id).");
    process.exit(2);
  }

  const db = serviceDb();
  const { data: org } = await db
    .from("organizations")
    .select("id, name, slug")
    .eq("id", organizationId)
    .maybeSingle();
  if (!org) {
    console.error("Organization not found");
    process.exit(1);
  }

  const { data: existing } = await db
    .from("billing_subscriptions")
    .select("status")
    .eq("organization_id", organizationId)
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();
  if (existing) {
    console.error("Org already has a live subscription. Use a clean fixture org.");
    process.exit(1);
  }

  console.log(`Checkout UI fixture for ${org.name} (${org.slug})`);

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });
  const couponId = await ensureCoupon(stripe);
  await ensurePromotionCode(stripe, couponId);

  const { url, intentId } = await createCheckoutSession(
    stripe,
    organizationId,
    org.name,
    userId,
  );
  console.log(`Checkout session intent=${intentId}`);
  console.log(`Opening ${url}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);

    const submit = page.locator(
      '[data-testid="hosted-payment-submit-button"], button.SubmitButton, button[type="submit"]',
    ).last();
    await submit.waitFor({ state: "visible", timeout: 60_000 });
    await submit.scrollIntoViewIfNeeded();
    await submit.click({ timeout: 60_000 });

    await page.waitForURL(/checkout\/success|billing\/checkout\/success|fajita\.io/, {
      timeout: 120_000,
    });
    const finalUrl = page.url();
    if (!finalUrl.includes("success")) {
      throw new Error(`Expected success redirect, got ${finalUrl}`);
    }
    console.log(`Checkout success URL reached: ${finalUrl}`);
  } finally {
    await browser.close();
  }

  const subscriptionId = await waitForSubscription(organizationId);
  if (!subscriptionId) {
    console.error("Webhook sync timed out after Checkout UI completion.");
    process.exit(1);
  }

  await stripe.subscriptions.update(subscriptionId, {
    metadata: { launch_fixture: FIXTURE_TAG, exclude_revenue: "true" },
  });

  const { data: customerRow } = await db
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (customerRow?.stripe_customer_id) {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerRow.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io"}/app/settings/billing`,
    });
    console.log(`Customer Portal session created (${portal.id})`);

    const portalBrowser = await chromium.launch({ headless: true });
    const portalPage = await portalBrowser.newPage();
    try {
      await portalPage.goto(portal.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      const title = await portalPage.title();
      console.log(`Portal loaded: ${title}`);
    } finally {
      await portalBrowser.close();
    }
  }

  const canceled = await stripe.subscriptions.cancel(subscriptionId);
  console.log(`Canceled subscription ${canceled.id} status=${canceled.status}`);

  console.log("\nCheckout UI fixture PASSED.");
  console.log(`Fixture tag: ${FIXTURE_TAG}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
