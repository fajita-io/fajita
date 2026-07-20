import "server-only";

import {
  hasActiveSubscription,
  hasBillingAccess,
} from "@/lib/auth/paid-signup-flow";
import type { OrgBillingState } from "@/lib/billing/engine";
import { serviceClient } from "@/lib/supabase/service";

/** Payment step is done; send the user into product setup instead of checkout. */
export async function shouldSkipPaymentStep(
  organizationId: string,
  billing: OrgBillingState,
): Promise<boolean> {
  if (hasBillingAccess(billing) || hasActiveSubscription(billing.status)) {
    return true;
  }
  return hasRecentCheckoutIntent(organizationId);
}

async function hasRecentCheckoutIntent(organizationId: string): Promise<boolean> {
  const db = serviceClient();
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("billing_checkout_intents")
    .select("id")
    .eq("organization_id", organizationId)
    .in("status", ["checkout_created", "completed"])
    .gte("created_at", since)
    .limit(1);

  if (error) {
    console.error("[billing] recent checkout intent lookup failed", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/** Whether an organization may enter paid signup setup (/app/onboarding) and the main app shell. */
export async function canEnterProductSetup(
  organizationId: string,
  billing: OrgBillingState,
): Promise<boolean> {
  if (hasBillingAccess(billing) || hasActiveSubscription(billing.status)) {
    return true;
  }
  return hasRecentCheckoutIntent(organizationId);
}
