/**
 * Billing enforcement is separate from billing UI availability.
 *
 * Feature stage `billing` controls whether checkout and billing settings are
 * customer-visible. This flag controls whether organizations without a
 * subscription are locked out of product entitlements.
 *
 * Default is off. Enable in the deployment environment only after:
 * 1. Stripe Prices exist for every catalog lookup key
 * 2. `npm run stripe:verify-prices` passes against that Stripe account
 * 3. Controlled payment test (docs/operations/real-payment-test.md) passes
 *
 * While off, unbilled orgs receive BETA_ENTITLEMENTS (see catalog.ts).
 */

function envFlagEnabled(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export const BILLING_ENFORCEMENT_ENABLED = envFlagEnabled(
  "BILLING_ENFORCEMENT_ENABLED",
);
