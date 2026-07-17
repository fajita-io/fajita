import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { consumeOutbox } from "@/lib/alerts/delivery/consumer";
import { runDeliveryPass } from "@/lib/alerts/delivery/worker";

/**
 * Internal alert delivery trigger.
 *
 *   POST /api/internal/alerts/run
 *   Authorization: Bearer <ALERT_WORKER_TOKEN>
 *
 * Drives one consume pass (outbox -> intents) and one delivery pass (intents ->
 * providers). Intended for a scheduled trigger or the standalone worker loop.
 * Disabled when ALERT_WORKER_TOKEN is unset. No customer data in the response.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = serverEnv().ALERT_WORKER_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  try {
    const consumed = await consumeOutbox(100);
    const delivered = await runDeliveryPass({ max: 40, leaseSeconds: 90 });
    return NextResponse.json({ ok: true, consumed, delivered });
  } catch (error) {
    console.error("[alerts] run failed", error);
    return NextResponse.json({ ok: false, error: "Alert run failed." }, { status: 500 });
  }
}
