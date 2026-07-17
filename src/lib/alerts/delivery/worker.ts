import "server-only";

import { randomUUID } from "node:crypto";

import { serviceClient } from "@/lib/supabase/service";
import { ALERT_LIMITS, WEBHOOK_SIGNATURE_HEADERS } from "@/lib/alerts/constants";
import { buildWebhookEnvelope } from "@/lib/alerts/messages";
import { signatureHeader } from "@/lib/alerts/signing";
import {
  type ProviderOutcome,
  sendDiscordAlert,
  sendEmailAlert,
  sendSlackAlert,
  sendWebhookAlert,
} from "@/lib/alerts/providers";
import {
  resolveChatWebhookUrl,
  resolveVerifiedEmailRecipients,
  resolveWebhookCredentials,
} from "@/lib/alerts/delivery/secrets";
import { renderContextFromPayload, type StoredEventPayload } from "@/lib/alerts/delivery/context";

/**
 * Alert delivery worker. Leases due intents, resolves credentials in memory,
 * sends through the provider adapter, and records the attempt. Retries,
 * backoff, dead-lettering, and channel health all live in record_alert_attempt.
 * The worker is idempotent-friendly: an intent is leased by exactly one worker
 * at a time and a crash simply lets the lease expire for another pass.
 */

interface LeasedIntent {
  id: string;
  organization_id: string;
  incident_id: string | null;
  monitor_id: string | null;
  channel_id: string;
  channel_version: number;
  provider: string;
  event_type: string;
  severity: string | null;
  kind: string;
  event_payload: StoredEventPayload;
  attempt_count: number;
  max_attempts: number;
  rule_id: string | null;
}

async function deliver(intent: LeasedIntent): Promise<ProviderOutcome> {
  const ctx = renderContextFromPayload(intent.event_payload);

  switch (intent.provider) {
    case "email": {
      const recipients = await resolveVerifiedEmailRecipients(intent.channel_id);
      return sendEmailAlert(recipients, ctx);
    }
    case "slack": {
      const url = await resolveChatWebhookUrl(intent.channel_id, "slack");
      if (!url) return { result: "permanent_failure", errorCategory: "channel_missing", safeSummary: "Slack credential missing", httpStatus: null, requestId: null, durationMs: 0 };
      return sendSlackAlert(url, ctx);
    }
    case "discord": {
      const url = await resolveChatWebhookUrl(intent.channel_id, "discord");
      if (!url) return { result: "permanent_failure", errorCategory: "channel_missing", safeSummary: "Discord credential missing", httpStatus: null, requestId: null, durationMs: 0 };
      return sendDiscordAlert(url, ctx);
    }
    case "webhook": {
      const creds = await resolveWebhookCredentials(intent.channel_id);
      if (!creds) return { result: "permanent_failure", errorCategory: "destination_missing", safeSummary: "Webhook URL missing", httpStatus: null, requestId: null, durationMs: 0 };
      const createdAt = new Date().toISOString();
      const envelope = buildWebhookEnvelope({
        eventId: intent.id,
        ctx,
        organizationId: intent.organization_id,
        incidentId: intent.incident_id,
        monitorId: intent.monitor_id,
        createdAt,
      });
      const body = JSON.stringify(envelope);
      const timestamp = Math.floor(Date.now() / 1000);
      const headers: Record<string, string> = {
        ...creds.headerValues,
        [WEBHOOK_SIGNATURE_HEADERS.eventId]: intent.id,
        [WEBHOOK_SIGNATURE_HEADERS.eventType]: intent.event_type,
        [WEBHOOK_SIGNATURE_HEADERS.timestamp]: String(timestamp),
        [WEBHOOK_SIGNATURE_HEADERS.schemaVersion]: String(envelope.schema_version),
      };
      if (creds.signing) {
        headers[WEBHOOK_SIGNATURE_HEADERS.signature] = signatureHeader({
          secret: creds.signing.secret,
          keyId: creds.signing.keyId,
          timestamp,
          eventId: intent.id,
          body,
        });
      }
      return sendWebhookAlert({ url: creds.url, body, headers, timeoutMs: ALERT_LIMITS.webhookTimeoutMs });
    }
    default:
      return { result: "permanent_failure", errorCategory: "configuration_error", safeSummary: "Unknown provider", httpStatus: null, requestId: null, durationMs: 0 };
  }
}

/** Enqueue the next configured fallback channel after a dead-letter. */
async function enqueueFallback(intent: LeasedIntent): Promise<void> {
  if (!intent.rule_id || intent.kind === "fallback") return;
  const db = serviceClient();

  const { data: intentRow } = await db
    .from("alert_delivery_intents")
    .select("outbox_id")
    .eq("id", intent.id)
    .maybeSingle();
  const outboxId = intentRow?.outbox_id ?? null;

  const { data: fallbacks } = await db
    .from("alert_rule_channels")
    .select("channel_id, fallback_order")
    .eq("rule_id", intent.rule_id)
    .eq("role", "fallback")
    .order("fallback_order", { ascending: true });
  if (!fallbacks || fallbacks.length === 0) return;

  for (const fb of fallbacks) {
    const { data: channel } = await db
      .from("alert_channels")
      .select("id, status, verification_status, current_version, provider")
      .eq("id", fb.channel_id)
      .eq("organization_id", intent.organization_id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!channel) continue;
    if (!["active", "testing", "degraded"].includes(channel.status) || channel.verification_status !== "verified") continue;

    const { data: fbIntentId } = await db.rpc("create_alert_intent", {
      p_organization_id: intent.organization_id,
      p_outbox_id: outboxId,
      p_incident_id: intent.incident_id,
      p_monitor_id: intent.monitor_id,
      p_channel_id: channel.id,
      p_channel_version: channel.current_version,
      p_rule_id: intent.rule_id,
      p_provider: channel.provider,
      p_event_type: intent.event_type,
      p_severity: intent.severity,
      p_kind: "fallback",
      p_event_payload: intent.event_payload,
      p_dedup_key: outboxId ? `${outboxId}:${channel.id}` : `fallback:${intent.id}:${channel.id}`,
      p_scheduled_at: null,
      p_max_attempts: null,
      p_routing_explanation: "Fallback after the primary channel failed to deliver.",
    } as never);
    if (fbIntentId) return; // One fallback per dead-letter.
  }
}

export async function runDeliveryPass(
  opts: { workerId?: string; max?: number; leaseSeconds?: number } = {},
): Promise<{ leased: number; delivered: number; failed: number; deadLettered: number }> {
  const db = serviceClient();
  const workerId = opts.workerId ?? `alert-worker-${randomUUID().slice(0, 8)}`;

  // Reclaim any leases abandoned by a crashed worker before leasing new work.
  await db.rpc("expire_stale_alert_leases");

  const { data: leased, error } = await db.rpc("lease_alert_deliveries", {
    p_worker: workerId,
    p_max: opts.max ?? 20,
    p_lease_seconds: opts.leaseSeconds ?? 60,
  });
  if (error) throw error;
  const leasedIntents = (leased ?? []) as unknown as LeasedIntent[];

  let delivered = 0;
  let failed = 0;
  let deadLettered = 0;

  for (const raw of leasedIntents) {
    let outcome: ProviderOutcome;
    try {
      outcome = await deliver(raw);
    } catch (err) {
      outcome = {
        result: "error",
        errorCategory: "unknown_provider_error",
        safeSummary: "Unexpected delivery error",
        httpStatus: null,
        requestId: null,
        durationMs: 0,
      };
      console.error("[alerts] delivery threw", { intentId: raw.id, error: err instanceof Error ? err.message : "unknown" });
    }

    const { data: finalState, error: recErr } = await db.rpc("record_alert_attempt", {
      p_intent_id: raw.id,
      p_result: outcome.result,
      p_error_category: outcome.errorCategory,
      p_safe_summary: outcome.safeSummary,
      p_http_status: outcome.httpStatus,
      p_provider_request_id: outcome.requestId,
      p_duration_ms: outcome.durationMs,
      p_is_manual: false,
    } as never);
    if (recErr) throw recErr;

    if (finalState === "delivered") delivered += 1;
    else if (finalState === "dead_letter") {
      deadLettered += 1;
      try {
        await enqueueFallback(raw);
      } catch (err) {
        console.error("[alerts] fallback enqueue failed", { intentId: raw.id, error: err instanceof Error ? err.message : "unknown" });
      }
    } else failed += 1;
  }

  return { leased: leasedIntents.length, delivered, failed, deadLettered };
}
