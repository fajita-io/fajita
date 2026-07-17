import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { DEFAULT_RULE_EVENT_TYPES, isKnownEventType } from "@/lib/alerts/events";
import { ALERT_LIMITS, ROUTABLE_SEVERITIES, SCOPE_PRECEDENCE, type ScopeKind } from "@/lib/alerts/constants";

/**
 * Routing-rule write layer. A rule is stored as a small row plus typed selector
 * and channel junction tables (no scripting, no free-form graph). Updates
 * replace the selector/channel sets atomically enough for a low-frequency admin
 * surface: the parent row is the anchor and junctions are rewritten together.
 */

export interface RuleChannelInput {
  channelId: string;
  role: "primary" | "recovery_only" | "fallback";
  fallbackOrder?: number | null;
}

export interface RuleInput {
  name: string;
  scopeKind: ScopeKind;
  recoveryBehavior: "same_channels" | "never" | "only_if_opened_delivered" | "selected_channels";
  deduplicate: boolean;
  quietBehavior: "suppress" | "delay" | "ignore_quiet";
  eventTypes: string[];
  severities: string[];
  monitorIds: string[];
  groupIds: string[];
  tagIds: string[];
  channels: RuleChannelInput[];
}

function validate(input: RuleInput): void {
  if (input.channels.length === 0) throw new Error("Select at least one channel for this rule.");
  if (input.channels.length > ALERT_LIMITS.maxRuleChannels) {
    throw new Error(`A rule may target at most ${ALERT_LIMITS.maxRuleChannels} channels.`);
  }
  for (const e of input.eventTypes) {
    if (!isKnownEventType(e)) throw new Error(`Unknown event type: ${e}`);
  }
}

async function writeSelectors(ruleId: string, organizationId: string, input: RuleInput): Promise<void> {
  const db = serviceClient();
  if (input.eventTypes.length > 0) {
    await db.from("alert_rule_event_types").insert(
      input.eventTypes.map((event_type) => ({ rule_id: ruleId, organization_id: organizationId, event_type })),
    );
  }
  if (input.severities.length > 0) {
    await db.from("alert_rule_severities").insert(
      input.severities.map((severity) => ({ rule_id: ruleId, organization_id: organizationId, severity })),
    );
  }
  if (input.monitorIds.length > 0) {
    await db.from("alert_rule_monitors").insert(
      input.monitorIds.map((monitor_id) => ({ rule_id: ruleId, organization_id: organizationId, monitor_id })),
    );
  }
  if (input.groupIds.length > 0) {
    await db.from("alert_rule_monitor_groups").insert(
      input.groupIds.map((monitor_group_id) => ({ rule_id: ruleId, organization_id: organizationId, monitor_group_id })),
    );
  }
  if (input.tagIds.length > 0) {
    await db.from("alert_rule_tags").insert(
      input.tagIds.map((monitor_tag_id) => ({ rule_id: ruleId, organization_id: organizationId, monitor_tag_id })),
    );
  }
  await db.from("alert_rule_channels").insert(
    input.channels.map((c) => ({
      rule_id: ruleId,
      organization_id: organizationId,
      channel_id: c.channelId,
      role: c.role,
      fallback_order: c.role === "fallback" ? c.fallbackOrder ?? 0 : null,
    })),
  );
}

async function clearSelectors(ruleId: string): Promise<void> {
  const db = serviceClient();
  await Promise.all([
    db.from("alert_rule_event_types").delete().eq("rule_id", ruleId),
    db.from("alert_rule_severities").delete().eq("rule_id", ruleId),
    db.from("alert_rule_monitors").delete().eq("rule_id", ruleId),
    db.from("alert_rule_monitor_groups").delete().eq("rule_id", ruleId),
    db.from("alert_rule_tags").delete().eq("rule_id", ruleId),
    db.from("alert_rule_channels").delete().eq("rule_id", ruleId),
  ]);
}

export async function createRule(params: {
  organizationId: string;
  actorProfileId: string;
  input: RuleInput;
  isDefault?: boolean;
}): Promise<string> {
  validate(params.input);
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_routing_rules")
    .insert({
      organization_id: params.organizationId,
      name: params.input.name,
      status: "active",
      scope_kind: params.input.scopeKind,
      precedence_rank: SCOPE_PRECEDENCE[params.input.scopeKind],
      recovery_behavior: params.input.recoveryBehavior,
      deduplicate: params.input.deduplicate,
      quiet_behavior: params.input.quietBehavior,
      is_default: params.isDefault ?? false,
      created_by_user_id: params.actorProfileId,
      updated_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  await writeSelectors(data.id, params.organizationId, params.input);
  return data.id;
}

export async function updateRule(params: {
  organizationId: string;
  ruleId: string;
  actorProfileId: string;
  input: RuleInput;
}): Promise<void> {
  validate(params.input);
  const db = serviceClient();
  const { error } = await db
    .from("alert_routing_rules")
    .update({
      name: params.input.name,
      scope_kind: params.input.scopeKind,
      precedence_rank: SCOPE_PRECEDENCE[params.input.scopeKind],
      recovery_behavior: params.input.recoveryBehavior,
      deduplicate: params.input.deduplicate,
      quiet_behavior: params.input.quietBehavior,
      updated_by_user_id: params.actorProfileId,
    })
    .eq("id", params.ruleId)
    .eq("organization_id", params.organizationId);
  if (error) throw error;
  await clearSelectors(params.ruleId);
  await writeSelectors(params.ruleId, params.organizationId, params.input);
}

export async function setRuleStatus(organizationId: string, ruleId: string, status: "active" | "disabled"): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("alert_routing_rules")
    .update({ status })
    .eq("id", ruleId)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export async function deleteRule(organizationId: string, ruleId: string): Promise<void> {
  const db = serviceClient();
  const { error } = await db.from("alert_routing_rules").delete().eq("id", ruleId).eq("organization_id", organizationId);
  if (error) throw error;
}

/**
 * Recommended starter rule: route the default event set (opened, reopened,
 * resolved, ssl critical, heartbeat missed, maintenance start/complete) at
 * major and critical severity to a single channel, org-wide. Used from the
 * empty state and onboarding once a first channel is verified.
 */
export async function createRecommendedRule(params: {
  organizationId: string;
  actorProfileId: string;
  channelId: string;
}): Promise<string> {
  return createRule({
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    isDefault: true,
    input: {
      name: "Default alerts",
      scopeKind: "organization",
      recoveryBehavior: "same_channels",
      deduplicate: true,
      quietBehavior: "suppress",
      eventTypes: [...DEFAULT_RULE_EVENT_TYPES],
      severities: [...ROUTABLE_SEVERITIES],
      monitorIds: [],
      groupIds: [],
      tagIds: [],
      channels: [{ channelId: params.channelId, role: "primary" }],
    },
  });
}
