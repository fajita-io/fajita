import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Dead-letter operations. A dead letter is never silently dropped. An operator
 * can retry it (creating a fresh manual_retry intent, off the automatic backoff
 * schedule) or dismiss it. Retry requires the channel to be deliverable again,
 * so a fix-then-retry flow is enforced rather than retrying into a broken
 * destination.
 */

export async function retryDeadLetter(params: {
  organizationId: string;
  deadLetterId: string;
  actorProfileId: string;
}): Promise<{ intentId: string }> {
  const db = serviceClient();
  const { data: dl, error } = await db
    .from("alert_delivery_dead_letters")
    .select("id, intent_id, status")
    .eq("id", params.deadLetterId)
    .eq("organization_id", params.organizationId)
    .maybeSingle();
  if (error) throw error;
  if (!dl) throw new Error("Dead letter not found.");
  if (dl.status !== "open") throw new Error("This item has already been handled.");

  const { data: intent, error: intentErr } = await db
    .from("alert_delivery_intents")
    .select("outbox_id, incident_id, monitor_id, channel_id, provider, event_type, severity, event_payload, rule_id")
    .eq("id", dl.intent_id)
    .eq("organization_id", params.organizationId)
    .maybeSingle();
  if (intentErr) throw intentErr;
  if (!intent) throw new Error("The original delivery no longer exists.");

  const { data: channel, error: chanErr } = await db
    .from("alert_channels")
    .select("current_version, status, verification_status")
    .eq("id", intent.channel_id)
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (chanErr) throw chanErr;
  if (!channel) throw new Error("The channel no longer exists.");
  if (!["active", "testing", "degraded"].includes(channel.status) || channel.verification_status !== "verified") {
    throw new Error("Resume and verify the channel before retrying.");
  }

  const { data: intentId, error: createErr } = await db.rpc("create_alert_intent", {
    p_organization_id: params.organizationId,
    p_outbox_id: intent.outbox_id,
    p_incident_id: intent.incident_id,
    p_monitor_id: intent.monitor_id,
    p_channel_id: intent.channel_id,
    p_channel_version: channel.current_version,
    p_rule_id: intent.rule_id,
    p_provider: intent.provider,
    p_event_type: intent.event_type,
    p_severity: intent.severity,
    p_kind: "manual_retry",
    p_event_payload: intent.event_payload,
    p_dedup_key: null,
    p_scheduled_at: null,
    p_max_attempts: null,
    p_routing_explanation: "Manual retry from the dead-letter queue.",
  } as never);
  if (createErr) throw createErr;

  await db
    .from("alert_delivery_dead_letters")
    .update({ status: "retried", resolved_by_user_id: params.actorProfileId, resolved_at: new Date().toISOString() })
    .eq("id", params.deadLetterId)
    .eq("organization_id", params.organizationId);

  return { intentId: intentId as string };
}

export async function dismissDeadLetter(params: {
  organizationId: string;
  deadLetterId: string;
  actorProfileId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("alert_delivery_dead_letters")
    .update({ status: "dismissed", resolved_by_user_id: params.actorProfileId, resolved_at: new Date().toISOString() })
    .eq("id", params.deadLetterId)
    .eq("organization_id", params.organizationId)
    .eq("status", "open");
  if (error) throw error;
}
