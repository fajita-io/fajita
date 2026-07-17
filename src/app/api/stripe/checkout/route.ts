import { NextResponse } from "next/server";

import { startCheckoutAction } from "@/lib/app/actions/billing";

type CheckoutRequestBody = {
  organizationId?: string;
  planKey?: string;
  planId?: string;
  interval?: string;
};

/**
 * Authenticated checkout endpoint. Authorization, organization scoping, plan
 * selection, and duplicate prevention happen server-side in the billing action.
 * The client never supplies a Stripe customer or price id.
 */
export async function POST(request: Request) {
  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const organizationId = body.organizationId;
  const planKey = body.planKey ?? body.planId;
  const interval = body.interval ?? "month";

  if (!organizationId || !planKey) {
    return NextResponse.json(
      { error: "organizationId and planKey are required." },
      { status: 400 },
    );
  }

  const result = await startCheckoutAction(organizationId, planKey, interval);
  if (!result.ok || !result.data) {
    const status =
      !result.ok && (result.kind === "forbidden" || result.kind === "unauthenticated")
        ? 403
        : 400;
    return NextResponse.json(
      { error: result.ok ? "Could not start checkout." : result.error },
      { status },
    );
  }

  return NextResponse.json({ url: result.data.url });
}
