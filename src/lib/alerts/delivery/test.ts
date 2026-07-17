import "server-only";

import { randomUUID } from "node:crypto";

import { serviceClient } from "@/lib/supabase/service";
import { ALERT_LIMITS, WEBHOOK_SIGNATURE_HEADERS } from "@/lib/alerts/constants";
import { type AlertRenderContext, buildWebhookEnvelope } from "@/lib/alerts/messages";
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
import { appUrl } from "@/lib/env";

/**
 * Dedicated channel test. Runs inline so the operator sees the result
 * immediately, writes to alert_test_deliveries (never real intents), and can
 * never mutate incident state or routing. A success verifies the channel;
 * activation remains an explicit operator step.
 */

function testContext(organizationName: string): AlertRenderContext {
  return {
    eventType: "incident.opened",
    severity: "major",
    isRecovery: false,
    isTest: true,
    organizationName,
    title: "Fajita alert channel test",
    monitorName: "Test monitor",
    hostSafe: null,
    currentState: "Test",
    openedAt: new Date().toISOString(),
    resolvedAt: null,
    latestUpdate: "If you can read this, this channel is wired correctly.",
    evidenceSummary: null,
    maintenance: null,
    link: `${appUrl}/app/alerts`,
  };
}

async function dispatchTest(
  channelId: string,
  provider: string,
  ctx: AlertRenderContext,
): Promise<ProviderOutcome> {
  switch (provider) {
    case "email": {
      const recipients = await resolveVerifiedEmailRecipients(channelId);
      return sendEmailAlert(recipients, ctx);
    }
    case "slack": {
      const url = await resolveChatWebhookUrl(channelId, "slack");
      if (!url) return { result: "permanent_failure", errorCategory: "channel_missing", safeSummary: "Slack credential missing", httpStatus: null, requestId: null, durationMs: 0 };
      return sendSlackAlert(url, ctx);
    }
    case "discord": {
      const url = await resolveChatWebhookUrl(channelId, "discord");
      if (!url) return { result: "permanent_failure", errorCategory: "channel_missing", safeSummary: "Discord credential missing", httpStatus: null, requestId: null, durationMs: 0 };
      return sendDiscordAlert(url, ctx);
    }
    case "webhook": {
      const creds = await resolveWebhookCredentials(channelId);
      if (!creds) return { result: "permanent_failure", errorCategory: "destination_missing", safeSummary: "Webhook URL missing", httpStatus: null, requestId: null, durationMs: 0 };
      const eventId = randomUUID();
      const createdAt = new Date().toISOString();
      const envelope = buildWebhookEnvelope({ eventId, ctx, organizationId: "test", incidentId: null, monitorId: null, createdAt });
      const body = JSON.stringify(envelope);
      const timestamp = Math.floor(Date.now() / 1000);
      const headers: Record<string, string> = {
        ...creds.headerValues,
        [WEBHOOK_SIGNATURE_HEADERS.eventId]: eventId,
        [WEBHOOK_SIGNATURE_HEADERS.eventType]: "test",
        [WEBHOOK_SIGNATURE_HEADERS.timestamp]: String(timestamp),
        [WEBHOOK_SIGNATURE_HEADERS.schemaVersion]: String(envelope.schema_version),
      };
      if (creds.signing) {
        headers[WEBHOOK_SIGNATURE_HEADERS.signature] = signatureHeader({ secret: creds.signing.secret, keyId: creds.signing.keyId, timestamp, eventId, body });
      }
      return sendWebhookAlert({ url: creds.url, body, headers, timeoutMs: ALERT_LIMITS.webhookTimeoutMs });
    }
    default:
      return { result: "permanent_failure", errorCategory: "configuration_error", safeSummary: "Unknown provider", httpStatus: null, requestId: null, durationMs: 0 };
  }
}

export interface TestResult {
  testId: string;
  ok: boolean;
  errorCategory: string | null;
  safeSummary: string;
}

export async function sendChannelTest(params: {
  organizationId: string;
  channelId: string;
  actorProfileId: string;
}): Promise<TestResult> {
  const db = serviceClient();
  const { data: channel, error } = await db
    .from("alert_channels")
    .select("id, provider, current_version, status")
    .eq("id", params.channelId)
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!channel) throw new Error("Channel not found.");

  const { data: org } = await db
    .from("organizations")
    .select("name")
    .eq("id", params.organizationId)
    .maybeSingle();

  const { data: testRow, error: insErr } = await db
    .from("alert_test_deliveries")
    .insert({
      channel_id: channel.id,
      organization_id: params.organizationId,
      channel_version: channel.current_version,
      status: "processing",
      requested_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (insErr) throw insErr;

  const ctx = testContext(org?.name ?? "Your organization");
  const outcome = await dispatchTest(channel.id, channel.provider, ctx);
  const ok = outcome.result === "delivered";

  await db.rpc("record_alert_test_result", {
    p_test_id: testRow.id,
    p_result: ok ? "delivered" : "failed",
    p_error_category: outcome.errorCategory,
    p_safe_summary: outcome.safeSummary,
    p_http_status: outcome.httpStatus,
    p_duration_ms: outcome.durationMs,
  } as never);

  return { testId: testRow.id, ok, errorCategory: outcome.errorCategory, safeSummary: outcome.safeSummary };
}
