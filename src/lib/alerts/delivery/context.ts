import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { deriveEventType, isRecoveryEvent } from "@/lib/alerts/events";
import type { EventContext } from "@/lib/alerts/routing/engine";
import type { AlertRenderContext } from "@/lib/alerts/messages";
import { emailAppLink } from "@/lib/email/links";

/**
 * Turn a claimed incident_delivery_outbox row into the routing EventContext and
 * a secret-free StoredEventPayload. The payload is persisted on each intent so
 * the delivery worker can render every provider message without re-querying and
 * without ever seeing internal notes, secrets, or raw response data.
 */

export interface StoredEventPayload {
  eventType: string;
  severity: string | null;
  isRecovery: boolean;
  organizationName: string;
  title: string;
  monitorName: string | null;
  hostSafe: string | null;
  currentState: string | null;
  openedAt: string | null;
  resolvedAt: string | null;
  latestUpdate: string | null;
  evidenceSummary: string | null;
  maintenance: { startsAt: string | null; endsAt: string | null; timezone: string | null } | null;
  incidentId: string | null;
  monitorId: string | null;
}

interface IncidentRow {
  id: string;
  severity: string;
  operational_status: string;
  opened_at: string;
  resolved_at: string | null;
  title: string;
  public_title: string | null;
  public_summary: string | null;
  primary_monitor_id: string | null;
  correlation_key: string;
}

export interface OutboxRow {
  id: string;
  organization_id: string;
  incident_id: string | null;
  monitor_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  occurred_at: string;
}

const OPERATIONAL_LABEL: Record<string, string> = {
  operational: "Operational",
  verifying_failure: "Verifying",
  degraded: "Degraded",
  down: "Down",
  recovering: "Recovering",
  maintenance: "Maintenance",
  unknown: "Unknown",
};

async function orgName(organizationId: string): Promise<string> {
  const db = serviceClient();
  const { data } = await db
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .maybeSingle();
  return data?.name ?? "Your organization";
}

export interface DeliveryContext {
  event: EventContext;
  payload: StoredEventPayload;
}

export async function buildDeliveryContext(row: OutboxRow): Promise<DeliveryContext | null> {
  const db = serviceClient();
  const organizationName = await orgName(row.organization_id);

  // Maintenance events carry a window id, not an incident.
  if (row.event_type.startsWith("maintenance.")) {
    const windowId = (row.payload["maintenance_window_id"] as string | undefined) ?? null;
    let title = "Scheduled maintenance";
    let maintenance = { startsAt: null as string | null, endsAt: null as string | null, timezone: null as string | null };
    if (windowId) {
      const { data } = await db
        .from("maintenance_windows")
        .select("name, starts_at, ends_at, timezone")
        .eq("id", windowId)
        .eq("organization_id", row.organization_id)
        .maybeSingle();
      if (data) {
        title = data.name;
        maintenance = { startsAt: data.starts_at, endsAt: data.ends_at, timezone: data.timezone };
      }
    }
    const payload: StoredEventPayload = {
      eventType: row.event_type,
      severity: null,
      isRecovery: isRecoveryEvent(row.event_type),
      organizationName,
      title,
      monitorName: null,
      hostSafe: null,
      currentState: null,
      openedAt: null,
      resolvedAt: null,
      latestUpdate: null,
      evidenceSummary: null,
      maintenance,
      incidentId: null,
      monitorId: null,
    };
    return {
      event: {
        organizationId: row.organization_id,
        outboxId: row.id,
        incidentId: null,
        monitorId: null,
        monitorGroupIds: [],
        monitorTagIds: [],
        eventType: row.event_type,
        severity: null,
        isRecovery: payload.isRecovery,
      },
      payload,
    };
  }

  // Incident-derived events.
  let incident: IncidentRow | null = null;

  if (row.incident_id) {
    const { data } = await db
      .from("incidents")
      .select("id, severity, operational_status, opened_at, resolved_at, title, public_title, public_summary, primary_monitor_id, correlation_key")
      .eq("id", row.incident_id)
      .eq("organization_id", row.organization_id)
      .maybeSingle();
    incident = (data as unknown as IncidentRow | null) ?? null;
  }
  if (!incident) return null; // Incident was deleted; nothing to route.

  const monitorId = row.monitor_id ?? incident.primary_monitor_id;
  let monitorName: string | null = null;
  let groupIds: string[] = [];
  let tagIds: string[] = [];
  if (monitorId) {
    const { data: monitor } = await db
      .from("monitors")
      .select("name, group_id")
      .eq("id", monitorId)
      .eq("organization_id", row.organization_id)
      .maybeSingle();
    monitorName = monitor?.name ?? null;
    if (monitor?.group_id) groupIds = [monitor.group_id];
    const { data: tags } = await db
      .from("monitor_tag_assignments")
      .select("tag_id")
      .eq("monitor_id", monitorId)
      .eq("organization_id", row.organization_id);
    tagIds = (tags ?? []).map((t) => t.tag_id);
  }

  const eventType = deriveEventType(row.event_type, incident.correlation_key);
  const isRecovery = isRecoveryEvent(eventType);
  const severity = incident.severity;

  const payload: StoredEventPayload = {
    eventType,
    severity,
    isRecovery,
    organizationName,
    title: incident.public_title || incident.title,
    monitorName,
    hostSafe: null,
    currentState: OPERATIONAL_LABEL[incident.operational_status] ?? null,
    openedAt: incident.opened_at,
    resolvedAt: incident.resolved_at,
    latestUpdate: row.event_type === "incident.updated" ? incident.public_summary : null,
    evidenceSummary: null,
    maintenance: null,
    incidentId: incident.id,
    monitorId,
  };

  return {
    event: {
      organizationId: row.organization_id,
      outboxId: row.id,
      incidentId: incident.id,
      monitorId,
      monitorGroupIds: groupIds,
      monitorTagIds: tagIds,
      eventType,
      severity,
      isRecovery,
    },
    payload,
  };
}

/** Rebuild a full render context from a stored payload at send time. */
export function renderContextFromPayload(
  payload: StoredEventPayload,
  opts?: { isTest?: boolean },
): AlertRenderContext {
  const link = payload.incidentId
    ? emailAppLink(`/app/incidents/${payload.incidentId}`)
    : emailAppLink("/app/alerts");
  return {
    eventType: payload.eventType,
    severity: payload.severity,
    isRecovery: payload.isRecovery,
    isTest: opts?.isTest ?? false,
    organizationName: payload.organizationName,
    title: payload.title,
    monitorName: payload.monitorName,
    hostSafe: payload.hostSafe,
    currentState: payload.currentState,
    openedAt: payload.openedAt,
    resolvedAt: payload.resolvedAt,
    latestUpdate: payload.latestUpdate,
    evidenceSummary: payload.evidenceSummary,
    maintenance: payload.maintenance,
    link,
  };
}
