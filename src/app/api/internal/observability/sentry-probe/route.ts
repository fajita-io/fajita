import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { captureException, isSentryConfigured } from "@/lib/observability/sentry";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = serverEnv().CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/**
 * Controlled Sentry capture for production verification (LB-001).
 * Requires CRON_SECRET. Does not expose secrets in the response.
 */
export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  if (!isSentryConfigured()) {
    return NextResponse.json(
      { ok: false, error: "sentry_not_configured" },
      { status: 503 },
    );
  }

  const probeId = `sentry-probe-${Date.now()}`;
  const error = new Error("Fajita controlled Sentry probe");
  captureException(error, { probeId, source: "sentry-probe" });

  const eventId = Sentry.lastEventId();

  return NextResponse.json({
    ok: true,
    probeId,
    eventId: eventId ?? null,
  });
}
