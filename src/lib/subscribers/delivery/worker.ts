import "server-only";

import { randomUUID } from "node:crypto";

import { serviceClient } from "@/lib/supabase/service";
import {
  loadStatusPageEmailContext,
  preferenceUrl,
  unsubscribeUrl,
  oneClickUnsubscribeUrl,
  type StatusPageEmailContext,
} from "../context";
import { decryptEmail } from "../email-crypto";
import { signPreferenceToken } from "../signing";
import { renderEventEmail, type RenderPayload, type EmailLinks } from "../templates";
import { sendSubscriberEmail, senderFrom, type SendOutcome } from "./sender";

/**
 * Subscriber delivery worker. Leases due intents (confirmed, non-suppressed
 * subscribers only), renders the branded template with per-subscriber
 * preference/unsubscribe links, sends through the provider, and records the
 * attempt. Retries, backoff, and dead-lettering live in record_subscriber_
 * attempt. Idempotent-friendly: an intent is leased by one worker; a crash
 * lets the lease expire for another pass.
 */

interface LeasedIntent {
  id: string;
  organization_id: string;
  status_page_id: string;
  subscriber_id: string;
  event_id: string | null;
  event_type: string;
  message_kind: string;
  render_payload: Record<string, unknown>;
  attempt_count: number;
  max_attempts: number;
}

function permanentFailure(summary: string): SendOutcome {
  return { result: "permanent_failure", errorCategory: "recipient_invalid", safeSummary: summary, httpStatus: null, providerMessageId: null, durationMs: 0 };
}

async function deliver(
  intent: LeasedIntent,
  ctxCache: Map<string, StatusPageEmailContext | null>,
): Promise<SendOutcome> {
  const db = serviceClient();

  const { data: sub } = await db
    .from("status_page_subscribers")
    .select("id, status, encrypted_email, link_token_version")
    .eq("id", intent.subscriber_id)
    .maybeSingle();
  if (!sub || sub.status !== "confirmed") {
    return permanentFailure("Subscriber is no longer eligible");
  }
  if (!sub.encrypted_email) return permanentFailure("No stored address");

  let to: string;
  try {
    to = decryptEmail(sub.encrypted_email);
  } catch {
    return permanentFailure("Address could not be decrypted");
  }

  let ctx = ctxCache.get(intent.status_page_id);
  if (ctx === undefined) {
    ctx = await loadStatusPageEmailContext(intent.status_page_id);
    ctxCache.set(intent.status_page_id, ctx);
  }
  if (!ctx) return permanentFailure("Status page unavailable");

  const token = signPreferenceToken(sub.id, sub.link_token_version ?? 1);
  const links: EmailLinks = {
    statusPageUrl: ctx.statusPageUrl,
    preferenceUrl: preferenceUrl(token),
    unsubscribeUrl: unsubscribeUrl(token),
  };

  const payload = intent.render_payload as unknown as RenderPayload;
  payload.eventType = intent.event_type as RenderPayload["eventType"];
  const email = renderEventEmail(ctx, payload, links);

  return sendSubscriberEmail(senderFrom(ctx.name), {
    to,
    email,
    replyTo: ctx.replyTo,
    oneClickUnsubscribeUrl: oneClickUnsubscribeUrl(token),
  });
}

export async function runSubscriberDeliveryPass(
  opts: { workerId?: string; max?: number; leaseSeconds?: number } = {},
): Promise<{ leased: number; delivered: number; failed: number; deadLettered: number }> {
  const db = serviceClient();
  const workerId = opts.workerId ?? `subscriber-worker-${randomUUID().slice(0, 8)}`;

  await db.rpc("expire_stale_subscriber_leases");

  const { data: leased, error } = await db.rpc("lease_subscriber_deliveries", {
    p_worker: workerId,
    p_max: opts.max ?? 40,
    p_lease_seconds: opts.leaseSeconds ?? 90,
  });
  if (error) throw error;
  const intents = (leased ?? []) as unknown as LeasedIntent[];

  const ctxCache = new Map<string, StatusPageEmailContext | null>();
  let delivered = 0;
  let failed = 0;
  let deadLettered = 0;

  for (const intent of intents) {
    let outcome: SendOutcome;
    try {
      outcome = await deliver(intent, ctxCache);
    } catch (err) {
      outcome = { result: "error", errorCategory: "unknown_provider_error", safeSummary: "Unexpected delivery error", httpStatus: null, providerMessageId: null, durationMs: 0 };
      console.error("[subscribers] delivery threw", { intentId: intent.id, error: err instanceof Error ? err.message : "unknown" });
    }

    const { data: finalState, error: recErr } = await db.rpc("record_subscriber_attempt", {
      p_intent_id: intent.id,
      p_result: outcome.result,
      p_error_category: outcome.errorCategory,
      p_safe_summary: outcome.safeSummary,
      p_http_status: outcome.httpStatus,
      p_provider_request_id: outcome.providerMessageId,
      p_duration_ms: outcome.durationMs,
      p_is_manual: false,
    } as never);
    if (recErr) throw recErr;

    if (finalState === "delivered") delivered += 1;
    else if (finalState === "dead_letter") deadLettered += 1;
    else failed += 1;
  }

  return { leased: intents.length, delivered, failed, deadLettered };
}
