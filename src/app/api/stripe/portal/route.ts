import { NextResponse } from "next/server";

import { findStripeCustomerByUserId } from "@/lib/stripe/customers";
import { getStripe } from "@/lib/stripe/server";

type PortalRequestBody = {
  userId?: string;
};

function getAppUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_DATAFAST_DOMAIN ??
    "http://localhost:3000";

  return url.startsWith("http") ? url : `https://${url}`;
}

export async function POST(request: Request) {
  let body: PortalRequestBody;

  try {
    body = (await request.json()) as PortalRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { userId } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required until Clerk auth is wired." },
      { status: 401 },
    );
  }

  try {
    const customer = await findStripeCustomerByUserId(userId);

    if (!customer) {
      return NextResponse.json(
        { error: "No billing account found for this user." },
        { status: 404 },
      );
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${appUrl}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not open billing portal.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
