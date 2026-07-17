import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { RoutingRuleInput } from "@/lib/alerts/routing/engine";
import type { QuietWindow } from "@/lib/alerts/quiet-hours";

/**
 * Load an organization's active routing rules and quiet windows into the pure
 * routing engine's input shape. Reads are batched per table and joined in
 * memory to keep the query count flat regardless of rule count.
 */

function toQuietWindow(row: {
  timezone: string;
  start_minute: number;
  end_minute: number;
  days: number[] | null;
  severity_exceptions: string[] | null;
  event_type_exceptions: string[] | null;
}): QuietWindow {
  return {
    timezone: row.timezone,
    startMinute: row.start_minute,
    endMinute: row.end_minute,
    days: row.days ?? [0, 1, 2, 3, 4, 5, 6],
    severityExceptions: row.severity_exceptions ?? [],
    eventTypeExceptions: row.event_type_exceptions ?? [],
  };
}

export async function loadOrgQuietWindows(organizationId: string): Promise<QuietWindow[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_quiet_hours")
    .select("timezone, start_minute, end_minute, days, severity_exceptions, event_type_exceptions")
    .eq("organization_id", organizationId)
    .is("rule_id", null)
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []).map(toQuietWindow);
}

export async function loadRoutingRules(organizationId: string): Promise<RoutingRuleInput[]> {
  const db = serviceClient();
  const { data: rules, error } = await db
    .from("alert_routing_rules")
    .select("id, name, status, scope_kind, recovery_behavior, deduplicate, quiet_behavior")
    .eq("organization_id", organizationId)
    .eq("status", "active");
  if (error) throw error;
  if (!rules || rules.length === 0) return [];
  const ruleIds = rules.map((r) => r.id);

  const [channels, monitors, groups, tags, eventTypes, severities, quiet] = await Promise.all([
    db.from("alert_rule_channels").select("rule_id, channel_id, role, fallback_order").in("rule_id", ruleIds),
    db.from("alert_rule_monitors").select("rule_id, monitor_id").in("rule_id", ruleIds),
    db.from("alert_rule_monitor_groups").select("rule_id, monitor_group_id").in("rule_id", ruleIds),
    db.from("alert_rule_tags").select("rule_id, monitor_tag_id").in("rule_id", ruleIds),
    db.from("alert_rule_event_types").select("rule_id, event_type").in("rule_id", ruleIds),
    db.from("alert_rule_severities").select("rule_id, severity").in("rule_id", ruleIds),
    db
      .from("alert_quiet_hours")
      .select("rule_id, timezone, start_minute, end_minute, days, severity_exceptions, event_type_exceptions")
      .in("rule_id", ruleIds)
      .eq("status", "active"),
  ]);

  const byRule = <T extends { rule_id: string }>(rows: T[] | null): Map<string, T[]> => {
    const m = new Map<string, T[]>();
    for (const row of rows ?? []) {
      const arr = m.get(row.rule_id) ?? [];
      arr.push(row);
      m.set(row.rule_id, arr);
    }
    return m;
  };

  const chMap = byRule(channels.data);
  const monMap = byRule(monitors.data);
  const grpMap = byRule(groups.data);
  const tagMap = byRule(tags.data);
  const evMap = byRule(eventTypes.data);
  const sevMap = byRule(severities.data);

  // Rule-scoped quiet windows (rule_id is non-null here since we filtered by
  // rule ids, but the column is nullable, so group manually).
  const quietMap = new Map<string, QuietWindow[]>();
  for (const row of quiet.data ?? []) {
    if (!row.rule_id) continue;
    const arr = quietMap.get(row.rule_id) ?? [];
    arr.push(toQuietWindow(row));
    quietMap.set(row.rule_id, arr);
  }

  return rules.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status as "active" | "disabled",
    scopeKind: r.scope_kind as RoutingRuleInput["scopeKind"],
    recoveryBehavior: r.recovery_behavior as RoutingRuleInput["recoveryBehavior"],
    deduplicate: r.deduplicate,
    quietBehavior: r.quiet_behavior as RoutingRuleInput["quietBehavior"],
    eventTypes: (evMap.get(r.id) ?? []).map((x) => x.event_type),
    severities: (sevMap.get(r.id) ?? []).map((x) => x.severity),
    monitorIds: (monMap.get(r.id) ?? []).map((x) => x.monitor_id),
    groupIds: (grpMap.get(r.id) ?? []).map((x) => x.monitor_group_id),
    tagIds: (tagMap.get(r.id) ?? []).map((x) => x.monitor_tag_id),
    channels: (chMap.get(r.id) ?? []).map((x) => ({
      channelId: x.channel_id,
      role: x.role as "primary" | "recovery_only" | "fallback",
      fallbackOrder: x.fallback_order,
    })),
    quietWindows: quietMap.get(r.id) ?? [],
  }));
}

/** Channels that received a delivered opening alert for this incident. */
export async function loadOpenedDeliveredChannelIds(incidentId: string): Promise<Set<string>> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_delivery_intents")
    .select("channel_id")
    .eq("incident_id", incidentId)
    .eq("kind", "event")
    .eq("status", "delivered");
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.channel_id));
}
