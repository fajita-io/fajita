import { NextResponse } from "next/server";

import { handleAppsumoWebhook } from "@/lib/appsumo/webhook-processor";
import type { AppsumoWebhookPayload } from "@/lib/appsumo/types";
import { verifyAppsumoWebhookSignature } from "@/lib/appsumo/verify";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-appsumo-signature");
  const timestamp = request.headers.get("x-appsumo-timestamp");
  const verified = verifyAppsumoWebhookSignature({
    rawBody,
    signature,
    timestamp,
  });

  if (verified === false) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: AppsumoWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as AppsumoWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.event || !payload.license_key) {
    return NextResponse.json(
      { error: "Missing required webhook fields." },
      { status: 400 },
    );
  }

  const result = await handleAppsumoWebhook(payload);

  const body = { event: payload.event, success: true as const };

  if (result === "failed") {
    return NextResponse.json(body, { status: 500 });
  }

  return NextResponse.json(body);
}

/** Partner Portal validates the redirect URL with a bare GET. */
export async function GET() {
  return new NextResponse(null, { status: 200 });
}
