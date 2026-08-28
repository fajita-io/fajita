#!/usr/bin/env tsx
/**
 * Verify every BILLING_CATALOG lookup key resolves to an active Stripe Price
 * with matching unit_amount. Exit 1 on any mismatch.
 *
 *   STRIPE_SECRET_KEY=sk_test_... npm run stripe:verify-prices
 */
import Stripe from "stripe";

import { BILLING_CATALOG } from "../src/lib/billing/catalog";

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is required.");
    process.exit(2);
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });

  const account = await stripe.accounts.retrieve();
  const displayName = account.settings?.dashboard?.display_name ?? account.id;
  console.log(`Verifying prices on ${account.id} (${displayName})`);

  const failures: string[] = [];

  for (const plan of Object.values(BILLING_CATALOG)) {
    for (const interval of ["month", "year"] as const) {
      const lookupKey = plan.lookupKeys[interval];
      const expected =
        interval === "month"
          ? plan.pricing.monthlyCents
          : plan.pricing.yearlyCents;

      const listed = await stripe.prices.list({
        lookup_keys: [lookupKey],
        active: true,
        limit: 1,
      });
      const price = listed.data[0];
      if (!price) {
        failures.push(`missing active price for ${lookupKey}`);
        continue;
      }
      if (price.unit_amount !== expected) {
        failures.push(
          `${lookupKey} amount ${price.unit_amount} != catalog ${expected}`,
        );
        continue;
      }
      if (price.recurring?.interval !== interval) {
        failures.push(
          `${lookupKey} interval ${price.recurring?.interval} != ${interval}`,
        );
        continue;
      }
      console.log(`OK ${lookupKey} = ${expected} cents / ${interval}`);
    }
  }

  if (failures.length > 0) {
    console.error("Price verification FAILED:");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log("All catalog lookup keys match Stripe.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
