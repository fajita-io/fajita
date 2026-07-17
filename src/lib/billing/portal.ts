import "server-only";

import { getStripe } from "@/lib/stripe/server";
import { NotFound } from "@/lib/auth/errors";
import { getOrgStripeCustomerId } from "@/lib/billing/customers";
import { appUrl } from "@/lib/billing/checkout";

/**
 * Create a Stripe Customer Portal session for an organization. The Stripe
 * customer is resolved from the org mapping (never an arbitrary id from the
 * client). The caller must already be authorized (billing permission) upstream.
 */
export async function createOrgPortalSession(
  organizationId: string,
): Promise<string> {
  const customerId = await getOrgStripeCustomerId(organizationId);
  if (!customerId) {
    throw NotFound("No billing account exists for this organization yet.");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/app/settings/billing`,
  });

  return session.url;
}
