import "server-only";

import { getStripe } from "@/lib/stripe/server";
import { serviceClient } from "@/lib/supabase/service";

interface OrgCustomerInput {
  organizationId: string;
  organizationName: string;
  billingEmail: string | null;
  ownerProfileId?: string;
  ownerClerkUserId?: string;
}

/**
 * One Stripe customer per organization, created server-side and idempotently.
 * The organization row is the mapping authority; the browser never supplies a
 * Stripe customer id. Metadata carries only the internal organization id and a
 * safe display name, never monitoring data or secrets.
 */
export async function getOrCreateOrgStripeCustomer(
  input: OrgCustomerInput,
): Promise<string> {
  const db = serviceClient();

  const { data: existing } = await db
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", input.organizationId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create(
    {
      ...(input.billingEmail ? { email: input.billingEmail } : {}),
      name: input.organizationName,
      metadata: {
        organization_id: input.organizationId,
        environment: process.env.NODE_ENV ?? "development",
        ...(input.ownerProfileId
          ? { owner_profile_id: input.ownerProfileId }
          : {}),
        ...(input.ownerClerkUserId
          ? { owner_clerk_user_id: input.ownerClerkUserId }
          : {}),
      },
    },
    // Idempotent per organization so racing checkouts never create duplicates.
    { idempotencyKey: `org-customer-${input.organizationId}` },
  );

  await db.from("billing_customers").insert({
    organization_id: input.organizationId,
    stripe_customer_id: customer.id,
    billing_email: input.billingEmail,
    billing_name: input.organizationName,
  } as never);

  return customer.id;
}

/** Read the org's Stripe customer id from the mapping, if any. */
export async function getOrgStripeCustomerId(
  organizationId: string,
): Promise<string | null> {
  const db = serviceClient();
  const { data } = await db
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return data?.stripe_customer_id ?? null;
}
