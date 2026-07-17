import { NextResponse } from "next/server";

import { ingestHeartbeat } from "@/lib/monitoring/heartbeat";
import { recordSecurityEvent } from "@/lib/monitoring/security-events";
import { clientKey, rateLimit } from "@/lib/site/rate-limit";

/**
 * Heartbeat and cron ingestion endpoint.
 *
 *   GET|POST /api/heartbeat/{token}
 *
 * The token is high-entropy and matched by hash; the raw token is never stored.
 * Responses are intentionally uniform (200 on accept, 404 on unknown/revoked,
 * 429 on rate limit) with generic bodies so the endpoint cannot be used to
 * enumerate valid tokens. Bounded optional metadata: an idempotency id via
 * `?id=` for retried pings. No arbitrary payload is stored.
 */

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;
const TOKEN_MIN = 16;
const TOKEN_MAX = 200;
const EXTERNAL_ID_MAX = 200;

async function handle(
  request: Request,
  token: string,
  source: "get" | "post",
): Promise<NextResponse> {
  // Per-IP rate limit to blunt token guessing and ping floods.
  const ip = clientKey(request);
  if (!rateLimit(`heartbeat:${ip}`, { limit: 120, windowMs: 60_000 })) {
    await recordSecurityEvent({
      organizationId: null,
      eventType: "rate_limit_enforced",
      severity: "warning",
      safeSummary: "Heartbeat ingestion rate limit enforced.",
    }).catch(() => {});
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      { status: 429 },
    );
  }

  if (token.length < TOKEN_MIN || token.length > TOKEN_MAX) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const url = new URL(request.url);
  let externalEventId = url.searchParams.get("id");
  if (externalEventId && externalEventId.length > EXTERNAL_ID_MAX) {
    externalEventId = externalEventId.slice(0, EXTERNAL_ID_MAX);
  }

  // Reject oversized bodies without reading them into memory beyond the limit.
  if (source === "post") {
    const len = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(len) && len > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Payload too large." },
        { status: 413 },
      );
    }
  }

  try {
    const result = await ingestHeartbeat({
      rawToken: token,
      source,
      externalEventId,
    });
    if (!result.ok) {
      // Uniform 404 for unknown/revoked/suspended: no enumeration oracle.
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deduped: result.deduped });
  } catch (error) {
    console.error("[heartbeat] ingestion error", error);
    return NextResponse.json(
      { ok: false, error: "Could not record heartbeat." },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  return handle(request, token, "get");
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  return handle(request, token, "post");
}
