import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { evaluateRouting } from "@/lib/alerts/routing/engine";
import { buildDeliveryContext, type OutboxRow } from "@/lib/alerts/delivery/context";
import {
  loadOpenedDeliveredChannelIds,
  loadOrgQuietWindows,
  loadRoutingRules,
} from "@/lib/alerts/delivery/rules";

/**
 * Outbox consumer. Claims incident_delivery_outbox rows, evaluates routing in
 * the pure engine, and turns decisions into deduplicated delivery intents plus
 * recorded suppressions. Never sends here: sending is the worker's job. Every
 * outbox row ends in a terminal state so it is consumed exactly once.
 */

interface ChannelRow {
  id: string;
  status: string;
  verification_status: string;
  current_version: number;
  provider: string;
}

async function loadChannels(orgId: string, channelIds: string[]): Promise<Map<string, ChannelRow>> {
  const map = new Map<string, ChannelRow>();
  if (channelIds.length === 0) return map;
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_channels")
    .select("id, status, verification_status, current_version, provider")
    .eq("organization_id", orgId)
    .in("id", channelIds)
    .is("deleted_at", null);
  if (error) throw error;
  for (const c of data ?? []) map.set(c.id, c as ChannelRow);
  return map;
}

async function recordSuppression(params: {
  organizationId: string;
  outboxId: string;
  incidentId: string | null;
  channelId: string | null;
  ruleId: string | null;
  eventType: string;
  reason: string;
  explanation: string;
}): Promise<void> {
  const db = serviceClient();
  await db.from("alert_delivery_suppressions").insert({
    organization_id: params.organizationId,
    outbox_id: params.outboxId,
    incident_id: params.incidentId,
    channel_id: params.channelId,
    rule_id: params.ruleId,
    event_type: params.eventType,
    reason: params.reason,
    explanation: params.explanation,
  });
}

async function consumeRow(row: OutboxRow): Promise<"delivered" | "suppressed"> {
  const db = serviceClient();
  const ctx = await buildDeliveryContext(row);
  if (!ctx) {
    await recordSuppression({
      organizationId: row.organization_id,
      outboxId: row.id,
      incidentId: row.incident_id,
      channelId: null,
      ruleId: null,
      eventType: row.event_type,
      reason: "incident_unavailable",
      explanation: "The incident was removed before alerts could be routed.",
    });
    return "suppressed";
  }

  const [rules, orgQuietWindows, openedDelivered] = await Promise.all([
    loadRoutingRules(row.organization_id),
    loadOrgQuietWindows(row.organization_id),
    ctx.event.incidentId && ctx.event.isRecovery
      ? loadOpenedDeliveredChannelIds(ctx.event.incidentId)
      : Promise.resolve(new Set<string>()),
  ]);

  const result = evaluateRouting({
    event: ctx.event,
    rules,
    orgQuietWindows,
    openedDeliveredChannelIds: openedDelivered,
    now: new Date(),
  });

  // Record routing suppressions (recovery disabled, quiet hours, etc.).
  for (const s of result.suppressions) {
    await recordSuppression({
      organizationId: row.organization_id,
      outboxId: row.id,
      incidentId: ctx.event.incidentId,
      channelId: s.channelId,
      ruleId: s.ruleId,
      eventType: ctx.event.eventType,
      reason: s.reason,
      explanation: s.explanation,
    });
  }

  if (result.decisions.length === 0) {
    if (result.suppressions.length === 0 && result.matchedRuleIds.length === 0) {
      await recordSuppression({
        organizationId: row.organization_id,
        outboxId: row.id,
        incidentId: ctx.event.incidentId,
        channelId: null,
        ruleId: null,
        eventType: ctx.event.eventType,
        reason: "no_matching_rule",
        explanation: "No routing rule matched this event.",
      });
    }
    return "suppressed";
  }

  const channelIds = [...new Set(result.decisions.map((d) => d.channelId))];
  const channels = await loadChannels(row.organization_id, channelIds);

  let created = 0;
  for (const decision of result.decisions) {
    const channel = channels.get(decision.channelId);
    if (!channel) {
      await recordSuppression({
        organizationId: row.organization_id,
        outboxId: row.id,
        incidentId: ctx.event.incidentId,
        channelId: decision.channelId,
        ruleId: decision.ruleId,
        eventType: ctx.event.eventType,
        reason: "channel_missing",
        explanation: "The selected channel no longer exists.",
      });
      continue;
    }
    const deliverable =
      ["active", "testing", "degraded"].includes(channel.status) &&
      channel.verification_status === "verified";
    if (!deliverable) {
      await recordSuppression({
        organizationId: row.organization_id,
        outboxId: row.id,
        incidentId: ctx.event.incidentId,
        channelId: decision.channelId,
        ruleId: decision.ruleId,
        eventType: ctx.event.eventType,
        reason: channel.status === "paused" ? "channel_paused" : "channel_not_ready",
        explanation:
          channel.status === "paused"
            ? "The channel is paused. Resume it to receive alerts."
            : "The channel is not verified and active.",
      });
      continue;
    }

    const { data: intentId, error } = await db.rpc("create_alert_intent", {
      p_organization_id: row.organization_id,
      p_outbox_id: row.id,
      p_incident_id: ctx.event.incidentId,
      p_monitor_id: ctx.event.monitorId,
      p_channel_id: decision.channelId,
      p_channel_version: channel.current_version,
      p_rule_id: decision.ruleId,
      p_provider: channel.provider,
      p_event_type: ctx.event.eventType,
      p_severity: ctx.event.severity,
      p_kind: decision.kind,
      p_event_payload: ctx.payload,
      p_dedup_key: `${row.id}:${decision.channelId}`,
      p_scheduled_at: decision.scheduledAt ? decision.scheduledAt.toISOString() : null,
      p_max_attempts: null,
      p_routing_explanation: decision.explanation,
    } as never);
    if (error) throw error;
    if (intentId) created += 1;
  }

  return created > 0 ? "delivered" : "suppressed";
}

/** Consume up to `limit` outbox rows. Returns a small summary for logging. */
export async function consumeOutbox(limit = 50): Promise<{ processed: number; delivered: number; suppressed: number }> {
  const db = serviceClient();
  const { data: rows, error } = await db.rpc("claim_alert_outbox", { p_limit: limit });
  if (error) throw error;

  let delivered = 0;
  let suppressed = 0;
  for (const row of (rows ?? []) as unknown as OutboxRow[]) {
    try {
      const outcome = await consumeRow(row);
      if (outcome === "delivered") delivered += 1;
      else suppressed += 1;
      await db.rpc("mark_alert_outbox", {
        p_outbox_id: row.id,
        p_status: outcome === "delivered" ? "delivered" : "suppressed",
        p_reason: null,
      } as never);
    } catch (err) {
      // Leave the row consumable again by a later pass; record nothing secret.
      await db.rpc("mark_alert_outbox", {
        p_outbox_id: row.id,
        p_status: "pending",
        p_reason: "consumer_error",
      } as never);
      console.error("[alerts] outbox consume failed", { outboxId: row.id, error: err instanceof Error ? err.message : "unknown" });
    }
  }

  return { processed: (rows ?? []).length, delivered, suppressed };
}
