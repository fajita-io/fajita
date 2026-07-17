import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { runFanoutPass } from "@/lib/subscribers/delivery/fanout";
import { runSubscriberDeliveryPass } from "@/lib/subscribers/delivery/worker";

/**
 * Internal status-page subscriber delivery trigger.
 *
 *   POST /api/internal/subscribers/run
 *   Authorization: Bearer <SUBSCRIBER_WORKER_TOKEN>
 *
 * Drives one fan-out pass (subscriber events -> delivery intents) and one
 * delivery pass (intents -> Resend). Intended for a scheduled trigger or the
 * standalone worker loop. Disabled when SUBSCRIBER_WORKER_TOKEN is unset.
 * Response carries only bounded counts, never subscriber data.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = serverEnv().SUBSCRIBER_WORKER_TOKEN;
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
    const fanout = await runFanoutPass({ max: 20 });
    const delivered = await runSubscriberDeliveryPass({ max: 40, leaseSeconds: 90 });
    return NextResponse.json({ ok: true, fanout, delivered });
  } catch (error) {
    console.error("[subscribers] run failed", error);
    return NextResponse.json(
      { ok: false, error: "Subscriber run failed." },
      { status: 500 },
    );
  }
}
