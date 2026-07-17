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

  let event;
  try {
    event = await constructStripeEvent(payload, signature);
  } catch {
    // Never echo verification internals to an unauthenticated caller.
    return NextResponse.json(
      { error: "Signature verification failed." },
      { status: 400 },
    );
  }

  const result = await handleStripeWebhookEvent(event);

  // 200 for processed/duplicate/ignored so Stripe stops retrying; 500 for a
  // genuine processing failure so Stripe retries and the inbox stays consistent.
  if (result.status === "failed") {
    return NextResponse.json({ received: true, status: result.status }, { status: 500 });
  }
  return NextResponse.json({ received: true, status: result.status });
}
