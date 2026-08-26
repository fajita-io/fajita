/**
 * Billing enforcement is separate from billing UI availability.
 *
 * Unbilled organizations are locked out of product entitlements once billing
 * is GA unless BILLING_BETA_GRANT_ENABLED opts them back into BETA_ENTITLEMENTS
 * for staging or local development.
 *
 * BILLING_ENFORCEMENT_ENABLED gates paid lockout in computeOrgBillingState
 * (with billingLaunched and stripeLivePaymentsReady). Health and readiness
 * checks also read this flag.
 *
 * Self-hosted deployments never enforce Stripe billing (see deployment config).
 */

import { deploymentConfig } from "@/lib/deployment/config";

function envFlagEnabled(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export const BILLING_ENFORCEMENT_ENABLED =
  deploymentConfig().isCloud && envFlagEnabled("BILLING_ENFORCEMENT_ENABLED");

/** When true, unbilled orgs keep BETA_ENTITLEMENTS even though billing is GA. */
export const BILLING_BETA_GRANT_ENABLED = envFlagEnabled(
  "BILLING_BETA_GRANT_ENABLED",
);
