import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { AlertProvider } from "@/lib/alerts/constants";

/**
 * Read layer for the alert UI. All reads are scoped by organization_id and run
 * through the service role after the page/action guard has verified membership.
 * Secrets are never selected here: only masked labels and non-secret metadata.
 */

export interface ChannelSummary {
  id: string;
  name: string;
  provider: AlertProvider;
  status: string;
  verificationStatus: string;
  healthStatus: string;
  description: string | null;
  defaultForOrganization: boolean;
  summary: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastTestedAt: string | null;
  consecutiveFailures: number;
  createdAt: string;
}

function channelSummarySelect() {
  return "id, name, provider, status, verification_status, health_status, description, default_for_organization, provider_metadata, last_success_at, last_failure_at, last_tested_at, consecutive_failures, created_at";
}

function toChannelSummary(row: Record<string, unknown>): ChannelSummary {
  const meta = (row.provider_metadata as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    name: row.name as string,
    provider: row.provider as AlertProvider,
    status: row.status as string,
    verificationStatus: row.verification_status as string,
    healthStatus: row.health_status as string,
    description: (row.description as string | null) ?? null,
    defaultForOrganization: Boolean(row.default_for_organization),
    summary: (meta.summary as string | undefined) ?? (meta.host as string | undefined) ?? null,
    lastSuccessAt: (row.last_success_at as string | null) ?? null,
    lastFailureAt: (row.last_failure_at as string | null) ?? null,
    lastTestedAt: (row.last_tested_at as string | null) ?? null,
    consecutiveFailures: (row.consecutive_failures as number) ?? 0,
    createdAt: row.created_at as string,
  };
}

export async function listChannels(organizationId: string): Promise<ChannelSummary[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_channels")
    .select(channelSummarySelect())
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => toChannelSummary(r as unknown as Record<string, unknown>));
}

export interface ChannelDetail extends ChannelSummary {
  providerMetadata: Record<string, unknown>;
  currentVersion: number;
  versions: Array<{ version: number; changeReason: string | null; createdAt: string }>;
  secrets: Array<{ id: string; secretType: string; headerName: string | null; maskedLabel: string; status: string; createdAt: string }>;
  signingKeys: Array<{ keyId: string; status: string; createdAt: string; expiresAt: string | null }>;
  recipients: Array<{ id: string; email: string; label: string | null; verificationStatus: string; isMember: boolean }>;
  recentTests: Array<{ id: string; status: string; result: string | null; errorCategory: string | null; safeSummary: string | null; createdAt: string }>;
}

export async function getChannelDetail(
  organizationId: string,
  channelId: string,
): Promise<ChannelDetail | null> {
  const db = serviceClient();
  const { data: channel, error } = await db
    .from("alert_channels")
    .select(
      "id, name, provider, status, verification_status, health_status, description, default_for_organization, provider_metadata, last_success_at, last_failure_at, last_tested_at, consecutive_failures, created_at, current_version",
    )
    .eq("organization_id", organizationId)
    .eq("id", channelId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!channel) return null;
  const channelRow = channel as unknown as Record<string, unknown>;

  const [versions, secrets, keys, recipients, tests] = await Promise.all([
    db.from("alert_channel_versions").select("version, change_reason, created_at").eq("channel_id", channelId).order("version", { ascending: false }).limit(20),
    db.from("alert_channel_secrets").select("id, secret_type, header_name, masked_label, status, created_at").eq("channel_id", channelId).neq("status", "revoked"),
    db.from("alert_webhook_signing_keys").select("key_id, status, created_at, expires_at").eq("channel_id", channelId).neq("status", "revoked"),
    db.from("alert_email_recipients").select("id, email, label, verification_status, is_organization_member").eq("channel_id", channelId).is("removed_at", null),
    db.from("alert_test_deliveries").select("id, status, result, error_category, safe_summary, created_at").eq("channel_id", channelId).order("created_at", { ascending: false }).limit(5),
  ]);

  const base = toChannelSummary(channelRow);
  return {
    ...base,
    providerMetadata: (channelRow.provider_metadata as Record<string, unknown>) ?? {},
    currentVersion: channelRow.current_version as number,
    versions: (versions.data ?? []).map((v) => ({ version: v.version, changeReason: v.change_reason, createdAt: v.created_at })),
    secrets: (secrets.data ?? []).map((s) => ({ id: s.id, secretType: s.secret_type, headerName: s.header_name, maskedLabel: s.masked_label, status: s.status, createdAt: s.created_at })),
    signingKeys: (keys.data ?? []).map((k) => ({ keyId: k.key_id, status: k.status, createdAt: k.created_at, expiresAt: k.expires_at })),
    recipients: (recipients.data ?? []).map((r) => ({ id: r.id, email: r.email, label: r.label, verificationStatus: r.verification_status, isMember: r.is_organization_member })),
    recentTests: (tests.data ?? []).map((t) => ({ id: t.id, status: t.status, result: t.result, errorCategory: t.error_category, safeSummary: t.safe_summary, createdAt: t.created_at })),
  };
}

export interface RuleSummary {
  id: string;
  name: string;
  status: string;
  scopeKind: string;
  recoveryBehavior: string;
  quietBehavior: string;
  channelCount: number;
  eventTypeCount: number;
  isDefault: boolean;
}

export async function listRules(organizationId: string): Promise<RuleSummary[]> {
  const db = serviceClient();
  const { data: rules, error } = await db
    .from("alert_routing_rules")
    .select("id, name, status, scope_kind, recovery_behavior, quiet_behavior, is_default")
    .eq("organization_id", organizationId)
    .order("precedence_rank", { ascending: true });
  if (error) throw error;
  if (!rules || rules.length === 0) return [];
  const ids = rules.map((r) => r.id);

  const [channels, events] = await Promise.all([
    db.from("alert_rule_channels").select("rule_id").in("rule_id", ids),
    db.from("alert_rule_event_types").select("rule_id").in("rule_id", ids),
  ]);
  const count = (rows: Array<{ rule_id: string }> | null, id: string) => (rows ?? []).filter((r) => r.rule_id === id).length;

  return rules.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    scopeKind: r.scope_kind,
    recoveryBehavior: r.recovery_behavior,
    quietBehavior: r.quiet_behavior,
    channelCount: count(channels.data, r.id),
    eventTypeCount: count(events.data, r.id),
    isDefault: r.is_default,
  }));
}

export interface RuleDetail extends RuleSummary {
  precedenceRank: number;
  deduplicate: boolean;
  eventTypes: string[];
  severities: string[];
  monitorIds: string[];
  groupIds: string[];
  tagIds: string[];
  channels: Array<{ channelId: string; role: string; fallbackOrder: number | null }>;
}

export async function getRuleDetail(organizationId: string, ruleId: string): Promise<RuleDetail | null> {
  const db = serviceClient();
  const { data: rule, error } = await db
    .from("alert_routing_rules")
    .select("id, name, status, scope_kind, recovery_behavior, quiet_behavior, is_default, precedence_rank, deduplicate")
    .eq("organization_id", organizationId)
    .eq("id", ruleId)
    .maybeSingle();
  if (error) throw error;
  if (!rule) return null;

  const [channels, events, severities, monitors, groups, tags] = await Promise.all([
    db.from("alert_rule_channels").select("channel_id, role, fallback_order").eq("rule_id", ruleId),
    db.from("alert_rule_event_types").select("event_type").eq("rule_id", ruleId),
    db.from("alert_rule_severities").select("severity").eq("rule_id", ruleId),
    db.from("alert_rule_monitors").select("monitor_id").eq("rule_id", ruleId),
    db.from("alert_rule_monitor_groups").select("monitor_group_id").eq("rule_id", ruleId),
    db.from("alert_rule_tags").select("monitor_tag_id").eq("rule_id", ruleId),
  ]);

  return {
    id: rule.id,
    name: rule.name,
    status: rule.status,
    scopeKind: rule.scope_kind,
    recoveryBehavior: rule.recovery_behavior,
    quietBehavior: rule.quiet_behavior,
    isDefault: rule.is_default,
    precedenceRank: rule.precedence_rank,
    deduplicate: rule.deduplicate,
    channelCount: (channels.data ?? []).length,
    eventTypeCount: (events.data ?? []).length,
    eventTypes: (events.data ?? []).map((e) => e.event_type),
    severities: (severities.data ?? []).map((s) => s.severity),
    monitorIds: (monitors.data ?? []).map((m) => m.monitor_id),
    groupIds: (groups.data ?? []).map((g) => g.monitor_group_id),
    tagIds: (tags.data ?? []).map((t) => t.monitor_tag_id),
    channels: (channels.data ?? []).map((c) => ({ channelId: c.channel_id, role: c.role, fallbackOrder: c.fallback_order })),
  };
}

export interface DeliveryRow {
  id: string;
  eventType: string;
  severity: string | null;
  provider: string;
  channelId: string;
  channelName: string | null;
  status: string;
  kind: string;
  attemptCount: number;
  incidentId: string | null;
  routingExplanation: string | null;
  lastErrorCategory: string | null;
  scheduledAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface DeliveryFilter {
  status?: string;
  channelId?: string;
  provider?: string;
  incidentId?: string;
  limit?: number;
  before?: string;
}

export async function listDeliveries(organizationId: string, filter: DeliveryFilter = {}): Promise<DeliveryRow[]> {
  const db = serviceClient();
  let query = db
    .from("alert_delivery_intents")
    .select("id, event_type, severity, provider, channel_id, status, kind, attempt_count, incident_id, routing_explanation, last_error_category, scheduled_at, completed_at, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(Math.min(filter.limit ?? 50, 200));
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.channelId) query = query.eq("channel_id", filter.channelId);
  if (filter.provider) query = query.eq("provider", filter.provider);
  if (filter.incidentId) query = query.eq("incident_id", filter.incidentId);
  if (filter.before) query = query.lt("created_at", filter.before);
  const { data, error } = await query;
  if (error) throw error;
  const rows = data ?? [];

  const channelIds = [...new Set(rows.map((r) => r.channel_id))];
  const names = new Map<string, string>();
  if (channelIds.length > 0) {
    const { data: chans } = await db.from("alert_channels").select("id, name").in("id", channelIds);
    for (const c of chans ?? []) names.set(c.id, c.name);
  }

  return rows.map((r) => ({
    id: r.id,
    eventType: r.event_type,
    severity: r.severity,
    provider: r.provider,
    channelId: r.channel_id,
    channelName: names.get(r.channel_id) ?? null,
    status: r.status,
    kind: r.kind,
    attemptCount: r.attempt_count,
    incidentId: r.incident_id,
    routingExplanation: r.routing_explanation,
    lastErrorCategory: r.last_error_category,
    scheduledAt: r.scheduled_at,
    completedAt: r.completed_at,
    createdAt: r.created_at,
  }));
}

export interface DeliveryDetail extends DeliveryRow {
  attempts: Array<{ attemptNumber: number; result: string; errorCategory: string | null; safeSummary: string | null; httpStatus: number | null; durationMs: number | null; isManual: boolean; startedAt: string; nextRetryAt: string | null }>;
}

export async function getDeliveryDetail(organizationId: string, intentId: string): Promise<DeliveryDetail | null> {
  const rows = await listDeliveries(organizationId, {});
  const found = rows.find((r) => r.id === intentId);
  const db = serviceClient();
  if (!found) {
    // Fall back to a direct fetch (row may be older than the page window).
    const { data } = await db
      .from("alert_delivery_intents")
      .select("id, event_type, severity, provider, channel_id, status, kind, attempt_count, incident_id, routing_explanation, last_error_category, scheduled_at, completed_at, created_at")
      .eq("organization_id", organizationId)
      .eq("id", intentId)
      .maybeSingle();
    if (!data) return null;
    const { data: chan } = await db.from("alert_channels").select("name").eq("id", data.channel_id).maybeSingle();
    const base: DeliveryRow = {
      id: data.id,
      eventType: data.event_type,
      severity: data.severity,
      provider: data.provider,
      channelId: data.channel_id,
      channelName: chan?.name ?? null,
      status: data.status,
      kind: data.kind,
      attemptCount: data.attempt_count,
      incidentId: data.incident_id,
      routingExplanation: data.routing_explanation,
      lastErrorCategory: data.last_error_category,
      scheduledAt: data.scheduled_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
    };
    return { ...base, attempts: await loadAttempts(intentId) };
  }
  return { ...found, attempts: await loadAttempts(intentId) };
}

async function loadAttempts(intentId: string) {
  const db = serviceClient();
  const { data } = await db
    .from("alert_delivery_attempts")
    .select("attempt_number, result, error_category, safe_summary, http_status, duration_ms, is_manual, started_at, next_retry_at")
    .eq("intent_id", intentId)
    .order("attempt_number", { ascending: true });
  return (data ?? []).map((a) => ({
    attemptNumber: a.attempt_number,
    result: a.result,
    errorCategory: a.error_category,
    safeSummary: a.safe_summary,
    httpStatus: a.http_status,
    durationMs: a.duration_ms,
    isManual: a.is_manual,
    startedAt: a.started_at,
    nextRetryAt: a.next_retry_at,
  }));
}

export interface DeadLetterRow {
  id: string;
  intentId: string;
  channelId: string | null;
  channelName: string | null;
  eventType: string;
  errorCategory: string | null;
  safeSummary: string | null;
  suggestedAction: string | null;
  status: string;
  firstAttemptAt: string | null;
  finalAttemptAt: string | null;
  createdAt: string;
}

export async function listDeadLetters(organizationId: string, status = "open"): Promise<DeadLetterRow[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_delivery_dead_letters")
    .select("id, intent_id, channel_id, event_type, error_category, safe_summary, suggested_action, status, first_attempt_at, final_attempt_at, created_at")
    .eq("organization_id", organizationId)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const rows = data ?? [];
  const channelIds = [...new Set(rows.map((r) => r.channel_id).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (channelIds.length > 0) {
    const { data: chans } = await db.from("alert_channels").select("id, name").in("id", channelIds);
    for (const c of chans ?? []) names.set(c.id, c.name);
  }
  return rows.map((r) => ({
    id: r.id,
    intentId: r.intent_id,
    channelId: r.channel_id,
    channelName: r.channel_id ? names.get(r.channel_id) ?? null : null,
    eventType: r.event_type,
    errorCategory: r.error_category,
    safeSummary: r.safe_summary,
    suggestedAction: r.suggested_action,
    status: r.status,
    firstAttemptAt: r.first_attempt_at,
    finalAttemptAt: r.final_attempt_at,
    createdAt: r.created_at,
  }));
}

export interface AlertsOverview {
  channelCount: number;
  activeChannelCount: number;
  unhealthyChannelCount: number;
  ruleCount: number;
  activeRuleCount: number;
  openDeadLetters: number;
  deliveredLast24h: number;
  failedLast24h: number;
}

export async function getAlertsOverview(organizationId: string): Promise<AlertsOverview> {
  const db = serviceClient();
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const [channels, rules, deadLetters, delivered, failed] = await Promise.all([
    db.from("alert_channels").select("status, health_status").eq("organization_id", organizationId).is("deleted_at", null),
    db.from("alert_routing_rules").select("status").eq("organization_id", organizationId),
    db.from("alert_delivery_dead_letters").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "open"),
    db.from("alert_delivery_intents").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "delivered").gte("created_at", since),
    db.from("alert_delivery_intents").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["dead_letter", "failed"]).gte("created_at", since),
  ]);
  const chans = channels.data ?? [];
  const ruleRows = rules.data ?? [];
  return {
    channelCount: chans.length,
    activeChannelCount: chans.filter((c) => c.status === "active").length,
    unhealthyChannelCount: chans.filter((c) => c.health_status === "failing" || c.health_status === "degraded").length,
    ruleCount: ruleRows.length,
    activeRuleCount: ruleRows.filter((r) => r.status === "active").length,
    openDeadLetters: deadLetters.count ?? 0,
    deliveredLast24h: delivered.count ?? 0,
    failedLast24h: failed.count ?? 0,
  };
}

/** Deterministic CSV export of the delivery log. No secrets, no bodies. */
export async function exportDeliveriesCsv(organizationId: string, filter: DeliveryFilter = {}): Promise<string> {
  const rows = await listDeliveries(organizationId, { ...filter, limit: 200 });
  const header = ["created_at", "event_type", "severity", "provider", "channel", "status", "kind", "attempts", "error_category", "completed_at"];
  const escape = (v: string | number | null) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([
      escape(r.createdAt),
      escape(r.eventType),
      escape(r.severity),
      escape(r.provider),
      escape(r.channelName),
      escape(r.status),
      escape(r.kind),
      escape(r.attemptCount),
      escape(r.lastErrorCategory),
      escape(r.completedAt),
    ].join(","));
  }
  return lines.join("\n");
}

/** Active, deliverable channels for the rule builder select. */
export async function listChannelOptions(organizationId: string): Promise<Array<{ id: string; name: string; provider: string; status: string }>> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_channels")
    .select("id, name, provider, status")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
