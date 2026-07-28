import "server-only";

import {
  hasActiveSubscription,
} from "@/lib/auth/paid-signup-flow";
import type { OrgBillingState } from "@/lib/billing/engine";
import { isPayingStatus } from "@/lib/billing/subscription-state";

/** Whether the org has AppSumo lifetime access. */
export function hasAppsumoAccess(billing: OrgBillingState): boolean {
  return billing.isAppsumoGrant;
}

/**
 * Whether the org has a real subscription (or grace on an existing one).
 * Beta grants, checkout intents, and entitlement snapshots do not count.
 */
export function hasPaidProductAccess(billing: OrgBillingState): boolean {
  if (hasAppsumoAccess(billing)) return true;
  if (billing.isBetaGrant) return false;
  if (hasActiveSubscription(billing.status)) return true;
  if (isPayingStatus(billing.status)) return true;
  if (billing.accessState === "grace_period" && billing.subscriptionId) {
    return true;
  }
  return false;
}

/** Standalone signup setup routes (use the minimal onboarding layout, not the app shell). */
export function isOnboardingSetupPath(pathname: string): boolean {
  return (
    pathname === "/app/new-organization" ||
    pathname.startsWith("/app/start/") ||
    pathname.startsWith("/app/invite/")
  );
}

/** App routes reachable before the first successful subscription checkout. */
export function isAppPathExemptFromPaymentGate(pathname: string): boolean {
  return (
    pathname === "/app/onboarding" ||
    pathname.startsWith("/app/onboarding/") ||
    pathname === "/app/settings/billing" ||
    pathname.startsWith("/app/settings/billing/")
  );
}

/** Payment step is done; send the user into product setup instead of checkout. */
export function shouldSkipPaymentStep(billing: OrgBillingState): boolean {
  if (hasPaidProductAccess(billing)) return true;
  // Included access while billing is pre-launch or live Stripe cannot charge yet.
  if (billing.isBetaGrant) return true;
  return false;
}

/** Whether an organization may enter paid signup setup (/app/onboarding) and the main app shell. */
export function canEnterProductSetup(billing: OrgBillingState): boolean {
  if (hasPaidProductAccess(billing)) return true;
  if (billing.isBetaGrant) return true;
  return false;
}
