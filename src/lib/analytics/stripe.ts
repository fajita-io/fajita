import "server-only";

import { getDataFastAttributionCookies } from "@/lib/analytics/server";

type StripeMetadata = Record<string, string>;

/**
 * Merge DataFast attribution cookies into Stripe Checkout session metadata.
 * Connect Stripe in DataFast dashboard, then pass this metadata when creating sessions.
 *
 * @see https://datafa.st/docs/stripe-checkout-api
 */
export async function getStripeDataFastMetadata(
  extra: StripeMetadata = {},
): Promise<StripeMetadata> {
  const attribution = await getDataFastAttributionCookies();

  return {
    ...extra,
    ...(attribution.datafast_visitor_id
      ? { datafast_visitor_id: attribution.datafast_visitor_id }
      : {}),
    ...(attribution.datafast_session_id
      ? { datafast_session_id: attribution.datafast_session_id }
      : {}),
  };
}

/**
 * Example usage when creating a Stripe Checkout session:
 *
 * ```ts
 * const session = await stripe.checkout.sessions.create({
 *   line_items: [...],
 *   mode: "subscription",
 *   metadata: await getStripeDataFastMetadata({ plan: "pro" }),
 * });
 * ```
 */
