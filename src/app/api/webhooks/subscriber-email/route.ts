import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/service";
import {
  mapResendPayload,
  verifyResendSignature,
} from "@/lib/subscribers/delivery/callbacks";

/**
 * Verified subscriber-email provider callbacks (Resend / Svix).
 *
 *   POST /api/webhooks/subscriber-email
 *
 * Fails closed: without SUBSCRIBER_EMAIL_WEBHOOK_SECRET, or on an invalid
 * signature, we reject. Delivered/bounced/complained events are mapped to a
 * safe classification and applied idempotently (unique provider event id).
 * Hard bounces and complaints suppress immediately and cancel pending
 * deliveries inside the RPC. Full provider payloads are never persisted.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOFT_BOUNCE_THRESHOLD = 3;

export async function POST(request: Request) {
  const secret = serverEnv().SUBSCRIBER_EMAIL_WEBHOOK_SECRET;
  if (!secret) {
    // Not configured: reject rather than silently accept unsigned traffic.
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const rawBody = await request.text();
  const headers = {
    id: request.headers.get("svix-id"),
    timestamp: request.headers.get("svix-timestamp"),
    signature: request.headers.get("svix-signature"),
  };

  if (!verifyResendSignature(secret, headers, rawBody)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const mapped = mapResendPayload(headers.id as string, parsed);
  if (!mapped) {
    // Valid signature, unrecognized event: acknowledge so the provider stops
    // retrying, but take no action.
    return NextResponse.json({ ok: true, action: "ignored" });
  }

  if (mapped.eventType === "other" || !mapped.providerMessageId) {
    return NextResponse.json({ ok: true, action: "ignored" });
  }

  try {
    const db = serviceClient();
    const { data, error } = await db.rpc("apply_subscriber_provider_event", {
      p_provider: "resend",
      p_provider_event_id: mapped.eventId,
      p_provider_message_id: mapped.providerMessageId,
      p_event_type: mapped.eventType,
      p_bounce_class: mapped.bounceClass,
      p_safe_summary: mapped.safeSummary,
      p_soft_bounce_threshold: SOFT_BOUNCE_THRESHOLD,
    } as never);
    if (error) throw error;
    return NextResponse.json({ ok: true, action: (data as string) ?? "applied" });
  } catch (error) {
    console.error("[subscribers] callback apply failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
