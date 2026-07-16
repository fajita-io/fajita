/**
 * Seed Stripe products and prices for Fajita uptime monitoring plans.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-seed-products.ts
 *
 * Creates products with lookup_keys matching src/lib/stripe/plans.ts.
 * Safe to re-run; skips prices that already exist.
 */

import Stripe from "stripe";

import { PLANS } from "../src/lib/stripe/plans";

const STARTER_MONTHLY_CENTS = 1900;
const PRO_MONTHLY_CENTS = 4900;
const BUSINESS_MONTHLY_CENTS = 14900;

const MONTHLY_AMOUNTS: Record<keyof typeof PLANS, number> = {
  starter: STARTER_MONTHLY_CENTS,
  pro: PRO_MONTHLY_CENTS,
  business: BUSINESS_MONTHLY_CENTS,
};

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
    console.log(`Price exists: ${lookupKey}`);
    return existing.data[0];
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

  console.log(`Created price: ${lookupKey} (${price.id})`);
  return price;
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });

  for (const plan of Object.values(PLANS)) {
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

    const monthlyAmount = MONTHLY_AMOUNTS[plan.id];
    const yearlyAmount = Math.round(monthlyAmount * 12 * 0.83);

    await ensurePrice(
      stripe,
      product.id,
      plan.lookupKeys.month,
      monthlyAmount,
      "month",
      plan.id,
    );

    await ensurePrice(
      stripe,
      product.id,
      plan.lookupKeys.year,
      yearlyAmount,
      "year",
      plan.id,
    );
  }

  console.log("Stripe catalog seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
