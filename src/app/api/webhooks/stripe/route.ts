import { NextResponse } from "next/server";

import {
  constructStripeEvent,
  handleStripeWebhookEvent,
} from "@/lib/stripe/webhooks";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  try {
    const event = await constructStripeEvent(payload, signature);
    await handleStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook verification failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
