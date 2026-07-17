import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { createLifecycleIntent } from "@/lib/lifecycle/intents";
import { dedupKeys, LIFECYCLE_TIMING } from "@/lib/lifecycle/messages";

/**
 * Incident recap generation.
 *
 * A recap is a factual, immutable snapshot of a resolved incident for
 * organization members. It is generated after a stabilization window, only
 * for incidents with meaningful duration or severity, and never for public
 * status-page subscribers. Root cause is never invented: the field stays
 * empty until an authorized user records one (corrections are versioned in
 * incident_recap_revisions).
 */

const RECAP_SEVERITIES = new Set(["major", "critical"]);

export interface IncidentRecapSnapshot {
  title: string;
  referenceCode: string | null;
  severity: string;
  origin: string;
  firstFailureAt: string | null;
  openedAt: string;
  acknowledgedAt: string | null;
  recoveryStartedAt: string | null;
  resolvedAt: string;
  durationMinutes: number;
  resolutionSummary: string | null;
  affectedMonitors: string[];
  timeline: Array<{ eventType: string; title: string; occurredAt: string }>;
  alertDelivery: { delivered: number; failed: number; suppressed: number };
  publicUpdateCount: number;
  maintenanceRelated: boolean;
  isFlapping: boolean;
}

export type RecapResult =
  | { generated: true; recapId: string; recipients: number }
  | {
      generated: false;
      reason:
        | "incident_not_found"
        | "not_resolved"
        | "stabilization_pending"
        | "not_meaningful"
        | "already_generated";
    };

export async function generateIncidentRecap(
  incidentId: string,
): Promise<RecapResult> {
  const db = serviceClient();

  const { data: incident } = await db
    .from("incidents")
    .select(
      "id, organization_id, title, reference_code, severity, origin, lifecycle_status, first_failure_at, opened_at, acknowledged_at, recovery_started_at, resolved_at, resolution_summary, active_maintenance_occurrence_id, is_flapping, deleted_at",
    )
    .eq("id", incidentId)
    .maybeSingle();

  if (!incident || incident.deleted_at) {
    return { generated: false, reason: "incident_not_found" };
  }
  if (incident.lifecycle_status !== "resolved" || !incident.resolved_at) {
    return { generated: false, reason: "not_resolved" };
  }

  const resolvedAtMs = new Date(incident.resolved_at).getTime();
  if (Date.now() - resolvedAtMs < LIFECYCLE_TIMING.incidentRecapStabilizationMs) {
    return { generated: false, reason: "stabilization_pending" };
  }

  const durationMs = resolvedAtMs - new Date(incident.opened_at).getTime();
  const meaningful =
    durationMs >= LIFECYCLE_TIMING.incidentRecapMinDurationMs ||
    RECAP_SEVERITIES.has(incident.severity);
  if (!meaningful) {
    return { generated: false, reason: "not_meaningful" };
  }

  const { data: existing } = await db
    .from("incident_recaps")
    .select("id")
    .eq("incident_id", incidentId)
    .maybeSingle();
  if (existing) return { generated: false, reason: "already_generated" };

  const [monitorsRes, eventsRes, alertsRes, updatesRes] = await Promise.all([
    db
      .from("incident_monitors")
      .select("monitor_name_snapshot, removed_at")
      .eq("incident_id", incidentId)
      .limit(20),
    db
      .from("incident_events")
      .select("event_type, title, occurred_at")
      .eq("incident_id", incidentId)
      .order("sequence", { ascending: true })
      .limit(30),
    db
      .from("alert_delivery_intents")
      .select("status")
      .eq("incident_id", incidentId)
      .limit(500),
    db
      .from("incident_updates")
      .select("id")
      .eq("incident_id", incidentId)
      .eq("visibility", "public")
      .is("superseded_at", null)
      .limit(100),
  ]);

  const alertRows = alertsRes.data ?? [];
  const snapshot: IncidentRecapSnapshot = {
    title: incident.title,
    referenceCode: incident.reference_code,
    severity: incident.severity,
    origin: incident.origin,
    firstFailureAt: incident.first_failure_at,
    openedAt: incident.opened_at,
    acknowledgedAt: incident.acknowledged_at,
    recoveryStartedAt: incident.recovery_started_at,
    resolvedAt: incident.resolved_at,
    durationMinutes: Math.max(1, Math.round(durationMs / 60_000)),
    resolutionSummary: incident.resolution_summary,
    affectedMonitors: (monitorsRes.data ?? [])
      .filter((m) => !m.removed_at && m.monitor_name_snapshot)
      .map((m) => m.monitor_name_snapshot as string),
    timeline: (eventsRes.data ?? []).map((e) => ({
      eventType: e.event_type,
      title: e.title,
      occurredAt: e.occurred_at,
    })),
    alertDelivery: {
      delivered: alertRows.filter((a) => a.status === "delivered").length,
      failed: alertRows.filter(
        (a) => a.status === "failed" || a.status === "dead_letter",
      ).length,
      suppressed: alertRows.filter((a) => a.status === "suppressed").length,
    },
    publicUpdateCount: (updatesRes.data ?? []).length,
    maintenanceRelated: incident.active_maintenance_occurrence_id != null,
    isFlapping: incident.is_flapping,
  };

  // The unique incident_id constraint is the duplicate-generation guard.
  const { data: inserted, error } = await db
    .from("incident_recaps")
    .insert({
      organization_id: incident.organization_id,
      incident_id: incidentId,
      snapshot: snapshot as never,
    })
    .select("id")
    .maybeSingle();
  if (error) {
    if (error.code === "23505") {
      return { generated: false, reason: "already_generated" };
    }
    throw error;
  }
  if (!inserted) return { generated: false, reason: "already_generated" };

  // Queue recap emails to active members. Preference and suppression checks
  // happen inside createLifecycleIntent; ineligible members are recorded as
  // suppressed intents, never silently dropped.
  const { data: members } = await db
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", incident.organization_id)
    .eq("status", "active")
    .limit(25);

  let queued = 0;
  for (const member of members ?? []) {
    const result = await createLifecycleIntent({
      organizationId: incident.organization_id,
      userId: member.user_id,
      messageKey: "incident_recap",
      dedupKey: dedupKeys.incidentRecap(incidentId, member.user_id),
      payload: {
        incident_title: incident.title,
        reference_code: incident.reference_code ?? "",
        severity: incident.severity,
        duration_minutes: snapshot.durationMinutes,
        opened_at: incident.opened_at,
        resolved_at: incident.resolved_at,
        affected_monitors: snapshot.affectedMonitors.slice(0, 5),
        alerts_delivered: snapshot.alertDelivery.delivered,
        public_updates: snapshot.publicUpdateCount,
        incident_id: incidentId,
      },
      relatedType: "incident_recap",
      relatedId: inserted.id,
    });
    if (result.created) queued += 1;
  }

  return { generated: true, recapId: inserted.id, recipients: queued };
}

/**
 * Batch generation for the worker: recently resolved incidents past the
 * stabilization window without a recap. Bounded per pass.
 */
export async function generateIncidentRecapsBatch(max = 20): Promise<{
  considered: number;
  generated: number;
  skipped: number;
}> {
  const db = serviceClient();
  const cutoff = new Date(
    Date.now() - LIFECYCLE_TIMING.incidentRecapStabilizationMs,
  ).toISOString();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: incidents } = await db
    .from("incidents")
    .select("id")
    .eq("lifecycle_status", "resolved")
    .is("deleted_at", null)
    .gte("resolved_at", since)
    .lte("resolved_at", cutoff)
    .order("resolved_at", { ascending: true })
    .limit(200);

  const { data: recapped } = await db
    .from("incident_recaps")
    .select("incident_id")
    .in(
      "incident_id",
      (incidents ?? []).map((i) => i.id).concat("00000000-0000-0000-0000-000000000000"),
    );
  const done = new Set((recapped ?? []).map((r) => r.incident_id));

  let considered = 0;
  let generated = 0;
  let skipped = 0;
  for (const incident of incidents ?? []) {
    if (done.has(incident.id)) continue;
    if (generated >= max) break;
    considered += 1;
    try {
      const result = await generateIncidentRecap(incident.id);
      if (result.generated) generated += 1;
      else skipped += 1;
    } catch (error) {
      console.error("[recaps] generation failed", incident.id, error);
      skipped += 1;
    }
  }
  return { considered, generated, skipped };
}
