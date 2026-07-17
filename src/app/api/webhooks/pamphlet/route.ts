import { NextResponse } from "next/server";

import { pamphletCapability } from "@/lib/pamphlet/capabilities";

/**
 * Pamphlet webhook ingress.
 *
 * Fails closed until a verified event schema and signature method are
 * recorded in src/lib/pamphlet/capabilities.ts. Do not invent signatures.
 */
export async function POST() {
  const cap = pamphletCapability("provider_webhooks");
  return NextResponse.json(
    {
      ok: false,
      error: "pamphlet_webhook_unavailable",
      message: cap.reason,
    },
    { status: 503 },
  );
}
