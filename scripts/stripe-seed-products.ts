/**
 * Seed Stripe products and prices for Fajita uptime monitoring plans.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-seed-products.ts
 *
 * Creates products with lookup_keys matching BILLING_CATALOG / plans.ts.
 * Safe to re-run; rotates lookup keys when catalog cents change.
 *
 * Do not run this against an unrelated Stripe account. Confirm the account with
 * Stripe Dashboard first, and set FAJITA_STRIPE_ACCOUNT_ID when using production keys.
 */

import Stripe from "stripe";

import { BILLING_CATALOG } from "../src/lib/billing/catalog";
import { PLANS } from "../src/lib/stripe/plans";

/** SaaS / website information services (business use). */
const PRODUCT_TAX_CODE = "txcd_10701400";

/** Optional guardrail when FAJITA_STRIPE_ACCOUNT_ID is set in assertFajitaStripeAccount. */
const BLOCKED_STRIPE_ACCOUNT_IDS = new Set<string>([]);

function assertFajitaStripeAccount(account: Stripe.Account) {
  if (BLOCKED_STRIPE_ACCOUNT_IDS.has(account.id)) {
    throw new Error(
      `Refusing to seed Stripe account ${account.id} (${account.settings?.dashboard?.display_name ?? "unknown"}). Use Fajita Stripe keys only.`,
    );
  }

  const expectedAccountId = process.env.FAJITA_STRIPE_ACCOUNT_ID?.trim();
  if (expectedAccountId && account.id !== expectedAccountId) {
    throw new Error(
      `STRIPE_SECRET_KEY account ${account.id} does not match FAJITA_STRIPE_ACCOUNT_ID=${expectedAccountId}.`,
    );
  }

  const displayName = account.settings?.dashboard?.display_name?.toLowerCase() ?? "";
  if (displayName.includes("learn domains")) {
    throw new Error(
      `Refusing to seed Learn Domains Stripe account (${account.id}). Use Fajita keys.`,
    );
  }
}

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
    if (
      price.unit_amount === unitAmount &&
      price.recurring?.interval === interval
    ) {
      console.log(`Price exists: ${lookupKey} (${price.unit_amount} cents)`);
      return price;
    }

    console.warn(
      `Rotating ${lookupKey}: was ${price.unit_amount} cents / ${price.recurring?.interval ?? "?"}; catalog expects ${unitAmount} / ${interval}.`,
    );

    await stripe.prices.update(price.id, {
      lookup_key: null,
      active: false,
    });
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

async function ensureProduct(
  stripe: Stripe,
  planId: keyof typeof PLANS,
) {
  const plan = PLANS[planId];
  const catalog = BILLING_CATALOG[planId];
  const productLookup = `fajita_product_${planId}`;

  const existingProducts = await stripe.products.search({
    query: `metadata['product_lookup']:'${productLookup}'`,
    limit: 1,
  });

  let product = existingProducts.data[0];

  if (!product) {
    product = await stripe.products.create({
      name: `Fajita ${plan.name}`,
      description: plan.description,
      tax_code: PRODUCT_TAX_CODE,
      metadata: {
        product_lookup: productLookup,
        plan_id: planId,
        monitor_limit: String(plan.monitorLimit),
        checks_included_monthly: String(
          catalog.entitlements.max_monthly_checks,
        ),
      },
    });
    console.log(`Created product: ${product.name} (${product.id})`);
    return product;
  }

  product = await stripe.products.update(product.id, {
    name: `Fajita ${plan.name}`,
    description: plan.description,
    tax_code: PRODUCT_TAX_CODE,
    metadata: {
      product_lookup: productLookup,
      plan_id: planId,
      monitor_limit: String(plan.monitorLimit),
      checks_included_monthly: String(
        catalog.entitlements.max_monthly_checks,
      ),
    },
  });
  console.log(`Product exists: ${product.name} (${product.id})`);
  return product;
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
  assertFajitaStripeAccount(account);
  console.log(
    `Seeding Stripe account ${account.id}${account.settings?.dashboard?.display_name ? ` (${account.settings.dashboard.display_name})` : ""}`,
  );

  for (const plan of Object.values(PLANS)) {
    const catalog = BILLING_CATALOG[plan.id];
    const product = await ensureProduct(stripe, plan.id);

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
