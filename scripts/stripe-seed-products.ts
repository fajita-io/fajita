/**
 * Seed Stripe products and prices for Fajita uptime monitoring plans.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-seed-products.ts
 *
 * Creates products with lookup_keys matching BILLING_CATALOG / plans.ts.
 * Safe to re-run; skips prices that already exist.
 *
 * Do not run this against an unrelated Stripe account (for example another
 * Accomplish product). Confirm the account with Stripe Dashboard first.
 */

import Stripe from "stripe";

import { BILLING_CATALOG } from "../src/lib/billing/catalog";
import { PLANS } from "../src/lib/stripe/plans";

async function ensurePrice(
  stripe: Stripe,
  productId: string,
  lookupKey: string,
  unitAmount: number,
  interval: "month" | "year",
  planId: string,
) {
  const existing = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });

  if (existing.data[0]) {
    const price = existing.data[0];
    if (price.unit_amount !== unitAmount) {
      console.warn(
        `WARNING: ${lookupKey} exists at ${price.unit_amount} cents; catalog expects ${unitAmount}. Create a new price and retire the old lookup key.`,
      );
    } else {
      console.log(`Price exists: ${lookupKey} (${price.unit_amount} cents)`);
    }
    return price;
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: unitAmount,
    recurring: { interval },
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    metadata: {
      plan_id: planId,
    },
  });

  console.log(`Created price: ${lookupKey} (${price.id}, ${unitAmount} cents)`);
  return price;
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }
  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY looks invalid.");
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });

  const account = await stripe.accounts.retrieve();
  console.log(
    `Seeding Stripe account ${account.id}${account.settings?.dashboard?.display_name ? ` (${account.settings.dashboard.display_name})` : ""}`,
  );

  for (const plan of Object.values(PLANS)) {
    const catalog = BILLING_CATALOG[plan.id];
    const productLookup = `fajita_product_${plan.id}`;

    const existingProducts = await stripe.products.search({
      query: `metadata['product_lookup']:'${productLookup}'`,
      limit: 1,
    });

    let product = existingProducts.data[0];

    if (!product) {
      product = await stripe.products.create({
        name: `Fajita ${plan.name}`,
        description: plan.description,
        metadata: {
          product_lookup: productLookup,
          plan_id: plan.id,
          monitor_limit:
            plan.monitorLimit === null ? "unlimited" : String(plan.monitorLimit),
        },
      });
      console.log(`Created product: ${product.name} (${product.id})`);
    } else {
      console.log(`Product exists: ${product.name} (${product.id})`);
    }

    await ensurePrice(
      stripe,
      product.id,
      catalog.lookupKeys.month,
      catalog.pricing.monthlyCents,
      "month",
      plan.id,
    );
    await ensurePrice(
      stripe,
      product.id,
      catalog.lookupKeys.year,
      catalog.pricing.yearlyCents,
      "year",
      plan.id,
    );
  }

  console.log("Done. Run: npm run stripe:verify-prices");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
