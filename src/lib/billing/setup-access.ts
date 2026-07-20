import "server-only";

import {
  hasActiveSubscription,
} from "@/lib/auth/paid-signup-flow";
import type { OrgBillingState } from "@/lib/billing/engine";
import { isPayingStatus } from "@/lib/billing/subscription-state";
import { serviceClient } from "@/lib/supabase/service";

const CHECKOUT_INTENT_LOOKBACK_MS = 48 * 60 * 60 * 1000;

/**
 * Whether the org has a real subscription (or grace on an existing one).
 * Beta grants and pre-payment checkout intents do not count.
 */
export function hasPaidProductAccess(billing: OrgBillingState): boolean {
  if (billing.isBetaGrant) return false;
  if (hasActiveSubscription(billing.status)) return true;
  if (isPayingStatus(billing.status)) return true;
  if (billing.accessState === "grace_period" && billing.subscriptionId) {
    return true;
  }
  return false;
}

/** App routes reachable before the first successful subscription checkout. */
export function isAppPathExemptFromPaymentGate(pathname: string): boolean {
  return (
    pathname === "/app/settings/billing" ||
    pathname.startsWith("/app/settings/billing/")
  );
}

async function hasRecentCompletedCheckoutIntent(
  organizationId: string,
): Promise<boolean> {
  const db = serviceClient();
  const since = new Date(Date.now() - CHECKOUT_INTENT_LOOKBACK_MS).toISOString();
  const { data, error } = await db
    .from("billing_checkout_intents")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "completed")
    .gte("created_at", since)
    .limit(1);

  if (error) {
    console.error("[billing] completed checkout intent lookup failed", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/** Payment step is done; send the user into product setup instead of checkout. */
export async function shouldSkipPaymentStep(
  organizationId: string,
  billing: OrgBillingState,
): Promise<boolean> {
  if (hasPaidProductAccess(billing)) return true;
  return hasRecentCompletedCheckoutIntent(organizationId);
}

/** Whether an organization may enter paid signup setup (/app/onboarding) and the main app shell. */
export async function canEnterProductSetup(
  organizationId: string,
  billing: OrgBillingState,
): Promise<boolean> {
  if (hasPaidProductAccess(billing)) return true;
  return hasRecentCompletedCheckoutIntent(organizationId);
}
