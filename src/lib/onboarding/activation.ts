import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import {
  CURRENT_ONBOARDING_VERSION,
  type OnboardingEventType,
} from "./definitions";

/**
 * Activation state: the precise, centralized definition of first value and
 * full activation (Phase 11 activation definition doc).
 *
 * - First monitor activated: an active customer monitor exists.
 * - First real result: at least one scheduled (is_test = false) check
 *   completed for this organization. Manual test-before-save never counts.
 * - Alert path ready: a verified, active channel plus an active routing rule
 *   that routes at least one incident-opening event to it.
 * - Status page ready: a published page with a visible component mapped to an
 *   active monitor.
 * - Full activation: all of the above.
 *
 * Signals are always derived from real product data. Milestone timestamps are
 * persisted once (never overwritten) so time-to-value metrics stay stable even
 * if resources are later deleted.
 */

/** Incident-opening event types that make a routing rule activation-eligible. */
export const OPENING_EVENT_TYPES = [
  "incident.opened",
  "incident.reopened",
  "monitor.ssl_critical",
  "monitor.heartbeat_missed",
] as const;

export interface ActivationSignals {
  activeMonitorCount: number;
  draftMonitorCount: number;
  totalMonitorCount: number;
  hasSslMonitor: boolean;
  hasHeartbeatMonitor: boolean;
  firstMonitorActivatedAt: string | null;
  firstRealCheckAt: string | null;
  /** Result of the first real scheduled check: success | failure-like | null. */
  firstRealCheckStatus: string | null;
  verifiedChannelCount: number;
  alertPathReadyAt: string | null;
  publishedStatusPageCount: number;
  mappedComponentCount: number;
  statusPageReadyAt: string | null;
  activatedAt: string | null;
}

function maxIso(...values: Array<string | null>): string | null {
  const present = values.filter((v): v is string => Boolean(v));
  if (present.length !== values.length) return null;
  return present.reduce((a, b) => (a > b ? a : b));
}

/** Derive activation signals from real product data. Read-only. */
export async function getActivationSignals(
  organizationId: string,
): Promise<ActivationSignals> {
  const db = serviceClient();

  const [monitorsRes, firstExecRes, channelsRes, rulesRes, pagesRes, auditRes] =
    await Promise.all([
      db
        .from("monitors")
        .select("id, status, monitor_type, created_at")
        .eq("organization_id", organizationId)
        .is("deleted_at", null),
      db
        .from("check_executions")
        .select("completed_at, status")
        .eq("organization_id", organizationId)
        .eq("is_test", false)
        .in("status", ["success", "failure", "error", "timed_out"])
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: true })
        .limit(1),
      db
        .from("alert_channels")
        .select("id, verified_at")
        .eq("organization_id", organizationId)
        .eq("verification_status", "verified")
        .in("status", ["active", "degraded"])
        .is("deleted_at", null),
      db
        .from("alert_routing_rules")
        .select("id, created_at")
        .eq("organization_id", organizationId)
        .eq("status", "active"),
      db
        .from("status_pages")
        .select("id, published_at")
        .eq("organization_id", organizationId)
        .eq("status", "published")
        .is("deleted_at", null),
      db
        .from("audit_events")
        .select("created_at")
        .eq("organization_id", organizationId)
        .eq("action", "monitor.activated")
        .order("created_at", { ascending: true })
        .limit(1),
    ]);

  const monitors = monitorsRes.data ?? [];
  const activeMonitors = monitors.filter((m) => m.status === "active");
  const activeMonitorIds = new Set(activeMonitors.map((m) => m.id));

  const firstExec = firstExecRes.data?.[0] ?? null;
  const channels = channelsRes.data ?? [];
  const channelIds = new Set(channels.map((c) => c.id));
  const rules = rulesRes.data ?? [];
  const pages = pagesRes.data ?? [];
  const pageIds = pages.map((p) => p.id);

  // A rule qualifies when it routes at least one incident-opening event to a
  // verified, eligible channel as a primary destination.
  let qualifyingRuleAt: string | null = null;
  if (rules.length > 0 && channels.length > 0) {
    const ruleIds = rules.map((r) => r.id);
    const [eventsRes, ruleChannelsRes] = await Promise.all([
      db
        .from("alert_rule_event_types")
        .select("rule_id, event_type")
        .in("rule_id", ruleIds)
        .in("event_type", [...OPENING_EVENT_TYPES]),
      db
        .from("alert_rule_channels")
        .select("rule_id, channel_id, role")
        .in("rule_id", ruleIds)
        .eq("role", "primary"),
    ]);
    const rulesWithOpening = new Set(
      (eventsRes.data ?? []).map((r) => r.rule_id),
    );
    const rulesWithChannel = new Set(
      (ruleChannelsRes.data ?? [])
        .filter((rc) => channelIds.has(rc.channel_id))
        .map((rc) => rc.rule_id),
    );
    for (const rule of rules) {
      if (rulesWithOpening.has(rule.id) && rulesWithChannel.has(rule.id)) {
        if (!qualifyingRuleAt || rule.created_at < qualifyingRuleAt) {
          qualifyingRuleAt = rule.created_at;
        }
      }
    }
  }

  // Component mapping: an active monitor mapped on a published page.
  let mappedComponentCount = 0;
  let firstMappingAt: string | null = null;
  if (pageIds.length > 0 && activeMonitorIds.size > 0) {
    const { data: mappings } = await db
      .from("status_page_component_monitors")
      .select("component_id, monitor_id, created_at, status_page_id")
      .in("status_page_id", pageIds);
    const qualifying = (mappings ?? []).filter((m) =>
      activeMonitorIds.has(m.monitor_id),
    );
    mappedComponentCount = new Set(qualifying.map((m) => m.component_id)).size;
    for (const m of qualifying) {
      if (!firstMappingAt || m.created_at < firstMappingAt) {
        firstMappingAt = m.created_at;
      }
    }
  }

  const firstMonitorActivatedAt =
    activeMonitors.length > 0
      ? (auditRes.data?.[0]?.created_at ??
        activeMonitors
          .map((m) => m.created_at)
          .reduce((a, b) => (a < b ? a : b)))
      : null;

  const firstVerifiedAt =
    channels.length > 0
      ? channels
          .map((c) => c.verified_at)
          .filter((v): v is string => Boolean(v))
          .reduce((a, b) => (a < b ? a : b), new Date().toISOString())
      : null;

  const alertPathReadyAt =
    channels.length > 0 && qualifyingRuleAt
      ? maxIso(firstVerifiedAt ?? qualifyingRuleAt, qualifyingRuleAt)
      : null;

  const firstPublishedAt =
    pages.length > 0
      ? pages
          .map((p) => p.published_at)
          .filter((v): v is string => Boolean(v))
          .reduce((a, b) => (a < b ? a : b), new Date().toISOString())
      : null;

  const statusPageReadyAt =
    pages.length > 0 && mappedComponentCount > 0
      ? maxIso(firstPublishedAt ?? firstMappingAt, firstMappingAt)
      : null;

  const firstRealCheckAt = firstExec?.completed_at ?? null;
  const activatedAt = maxIso(
    firstRealCheckAt,
    alertPathReadyAt,
    statusPageReadyAt,
  );

  return {
    activeMonitorCount: activeMonitors.length,
    draftMonitorCount: monitors.filter((m) => m.status === "draft").length,
    totalMonitorCount: monitors.length,
    hasSslMonitor: monitors.some(
      (m) => m.monitor_type === "ssl" && m.status === "active",
    ),
    hasHeartbeatMonitor: monitors.some(
      (m) => m.monitor_type === "heartbeat" && m.status === "active",
    ),
    firstMonitorActivatedAt,
    firstRealCheckAt,
    firstRealCheckStatus: firstExec?.status ?? null,
    verifiedChannelCount: channels.length,
    alertPathReadyAt,
    publishedStatusPageCount: pages.length,
    mappedComponentCount,
    statusPageReadyAt,
    activatedAt,
  };
}

/** Append an onboarding funnel event (server timestamps, safe metadata only). */
export async function recordOnboardingEvent(input: {
  organizationId: string;
  userId?: string | null;
  eventType: OnboardingEventType;
  stepKey?: string | null;
  metadata?: Record<string, string | number | boolean>;
}): Promise<void> {
  try {
    await serviceClient().from("onboarding_events").insert({
      organization_id: input.organizationId,
      user_id: input.userId ?? null,
      version: CURRENT_ONBOARDING_VERSION,
      event_type: input.eventType,
      step_key: input.stepKey ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch (error) {
    console.error("[onboarding] failed to record event", input.eventType, error);
  }
}

interface MilestonePatch {
  column:
    | "first_monitor_activated_at"
    | "first_real_check_at"
    | "alert_path_ready_at"
    | "status_page_ready_at"
    | "activated_at";
  value: string;
  eventType: OnboardingEventType;
  stepKey: string | null;
}

/**
 * Persist newly reached milestones and step completions. Idempotent: existing
 * timestamps are never overwritten, step upserts are conflict-safe, and funnel
 * events are emitted only on the transition (guarded by the null -> value
 * update). Safe to run concurrently from the worker and page loads.
 */
export async function syncActivationMilestones(
  organizationId: string,
): Promise<ActivationSignals> {
  const db = serviceClient();
  const signals = await getActivationSignals(organizationId);

  const { data: row } = await db
    .from("organization_onboarding")
    .select(
      "organization_id, first_monitor_activated_at, first_real_check_at, alert_path_ready_at, status_page_ready_at, activated_at, use_case, steps",
    )
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!row) {
    await db
      .from("organization_onboarding")
      .upsert(
        { organization_id: organizationId },
        { onConflict: "organization_id", ignoreDuplicates: true },
      );
  }

  const patches: MilestonePatch[] = [];
  if (!row?.first_monitor_activated_at && signals.firstMonitorActivatedAt) {
    patches.push({
      column: "first_monitor_activated_at",
      value: signals.firstMonitorActivatedAt,
      eventType: "first_monitor_activated",
      stepKey: "first_monitor",
    });
  }
  if (!row?.first_real_check_at && signals.firstRealCheckAt) {
    patches.push({
      column: "first_real_check_at",
      value: signals.firstRealCheckAt,
      eventType: "first_real_check_completed",
      stepKey: "first_result",
    });
  }
  if (!row?.alert_path_ready_at && signals.alertPathReadyAt) {
    patches.push({
      column: "alert_path_ready_at",
      value: signals.alertPathReadyAt,
      eventType: "alert_path_ready",
      stepKey: "routing_rule",
    });
  }
  if (!row?.status_page_ready_at && signals.statusPageReadyAt) {
    patches.push({
      column: "status_page_ready_at",
      value: signals.statusPageReadyAt,
      eventType: "status_page_ready",
      stepKey: "component_mapped",
    });
  }
  if (!row?.activated_at && signals.activatedAt) {
    patches.push({
      column: "activated_at",
      value: signals.activatedAt,
      eventType: "activation_completed",
      stepKey: null,
    });
  }

  for (const patch of patches) {
    // Guarded update: only the writer that flips null -> value emits the
    // funnel event, so two concurrent syncs cannot double-record.
    const { data: updated } = await db
      .from("organization_onboarding")
      .update({ [patch.column]: patch.value } as never)
      .eq("organization_id", organizationId)
      .is(patch.column, null)
      .select("organization_id");
    if ((updated ?? []).length > 0) {
      await recordOnboardingEvent({
        organizationId,
        eventType: patch.eventType,
        stepKey: patch.stepKey,
      });
    }
  }

  // Step records (system-derived). Completion timestamps come from evidence.
  const stepStates: Array<{ key: string; completedAt: string | null }> = [
    // The organization exists by definition here; insert-if-missing stamps
    // the first observation and keeps it stable afterwards.
    { key: "organization", completedAt: new Date().toISOString() },
    { key: "first_monitor", completedAt: signals.firstMonitorActivatedAt },
    { key: "first_result", completedAt: signals.firstRealCheckAt },
    {
      key: "alert_channel",
      completedAt: signals.verifiedChannelCount > 0 ? (signals.alertPathReadyAt ?? new Date().toISOString()) : null,
    },
    { key: "routing_rule", completedAt: signals.alertPathReadyAt },
    {
      key: "status_page",
      completedAt: signals.publishedStatusPageCount > 0 ? (signals.statusPageReadyAt ?? new Date().toISOString()) : null,
    },
    { key: "component_mapped", completedAt: signals.statusPageReadyAt },
    { key: "ssl_monitor", completedAt: signals.hasSslMonitor ? new Date().toISOString() : null },
    { key: "heartbeat_monitor", completedAt: signals.hasHeartbeatMonitor ? new Date().toISOString() : null },
    { key: "use_case", completedAt: row?.use_case ? new Date().toISOString() : null },
  ];

  const completed = stepStates.filter((s) => s.completedAt);
  if (completed.length > 0) {
    // Insert-if-missing keeps the first recorded completion timestamp stable.
    await db.from("organization_onboarding_steps").upsert(
      completed.map((s) => ({
        organization_id: organizationId,
        version: CURRENT_ONBOARDING_VERSION,
        step_key: s.key,
        status: "completed" as const,
        completed_at: s.completedAt,
        source: "system" as const,
      })),
      { onConflict: "organization_id,version,step_key", ignoreDuplicates: true },
    );
  }

  return signals;
}
