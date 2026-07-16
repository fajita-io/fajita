import { NextResponse } from "next/server";

import { getStripeDataFastMetadata, DataFastGoals, trackServerGoal } from "@/lib/analytics";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customers";
import { resolvePriceId } from "@/lib/stripe/entitlements";
import {
  isBillingInterval,
  isPlanId,
  type BillingInterval,
} from "@/lib/stripe/plans";
import { getStripe } from "@/lib/stripe/server";

type CheckoutRequestBody = {
  planId?: string;
  interval?: string;
  userId?: string;
  email?: string;
  name?: string;
};

function getAppUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_DATAFAST_DOMAIN ??
    "http://localhost:3000";

  return url.startsWith("http") ? url : `https://${url}`;
}

export async function POST(request: Request) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { planId, interval = "month", userId, email, name } = body;

  if (!planId || !isPlanId(planId)) {
    return NextResponse.json({ error: "A valid planId is required." }, { status: 400 });
  }

  if (!isBillingInterval(interval)) {
    return NextResponse.json(
      { error: "interval must be month or year." },
      { status: 400 },
    );
  }

  if (!userId || !email) {
    return NextResponse.json(
      { error: "userId and email are required until Clerk auth is wired." },
      { status: 401 },
    );
  }

  try {
    const stripe = getStripe();
    const customer = await getOrCreateStripeCustomer({
      userId,
      email,
      name,
    });
    const priceId = await resolvePriceId(planId, interval as BillingInterval);
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: {
        address: "auto",
        name: "auto",
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
          billing_interval: interval,
        },
      },
      metadata: await getStripeDataFastMetadata({
        user_id: userId,
        plan_id: planId,
        billing_interval: interval,
      }),
    });

    await trackServerGoal({
      name: DataFastGoals.initiateCheckout,
      metadata: {
        plan: planId,
        interval,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
