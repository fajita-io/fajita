import { NextResponse } from "next/server";

import { openBillingPortalAction } from "@/lib/app/actions/billing";

type PortalRequestBody = {
  organizationId?: string;
};

/**
 * Authenticated Customer Portal endpoint. The Stripe customer is resolved from
 * the org mapping after an authorization check; the client never supplies a
 * customer id.
 */
export async function POST(request: Request) {
  let body: PortalRequestBody;
  try {
    body = (await request.json()) as PortalRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.organizationId) {
    return NextResponse.json(
      { error: "organizationId is required." },
      { status: 400 },
    );
  }

  const result = await openBillingPortalAction(body.organizationId);
  if (!result.ok || !result.data) {
    if (!result.ok) {
      const status =
        result.kind === "forbidden" || result.kind === "unauthenticated"
          ? 403
          : result.kind === "not_found"
            ? 404
            : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json(
      { error: "Could not open billing portal." },
      { status: 400 },
    );
  }

  return NextResponse.json({ url: result.data.url });
}
