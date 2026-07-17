import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { incidentPublicSlug } from "./slug";
import { componentSlug } from "./slug";
import { sanitizePlainText } from "./sanitize";
import { emitSubscriberEvent } from "@/lib/subscribers/events";
import {
  incidentAffectedComponents,
  maintenanceAffectedComponents,
  componentNames,
} from "@/lib/subscribers/affected-components";
import { severityLabel, eventStatusLabel } from "@/lib/subscribers/labels";

/**
 * Attaching and publishing incidents, maintenance, and manual notices to a
 * status page. Publishing writes only allowlisted public fields; internal
 * notes, evidence, monitor names, and assignees never cross this boundary. Each
 * publish/unpublish is followed by a snapshot rebuild in the calling action.
 */

export interface PublishableIncident {
  incidentId: string;
  referenceCode: string | null;
  internalTitle: string;
  publicTitle: string | null;
  severity: string;
  lifecycleStatus: string;
  openedAt: string;
  attached: boolean;
  publicationState: "draft" | "published" | "hidden" | null;
}

/** Recent incidents in the org, annotated with their status-page attachment. */
export async function listPublishableIncidents(
  organizationId: string,
  statusPageId: string,
  limit = 50,
): Promise<PublishableIncident[]> {
  const db = serviceClient();
  const { data: incidents } = await db
    .from("incidents")
    .select("id, reference_code, title, public_title, severity, lifecycle_status, opened_at")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("opened_at", { ascending: false })
    .limit(limit);
  const rows = incidents ?? [];

  const { data: links } = await db
    .from("status_page_incidents")
    .select("incident_id, publication_state")
    .eq("status_page_id", statusPageId);
  const linkMap = new Map((links ?? []).map((l) => [l.incident_id, l.publication_state]));

  return rows.map((i) => ({
    incidentId: i.id,
    referenceCode: i.reference_code,
    internalTitle: i.title,
    publicTitle: i.public_title,
    severity: i.severity,
    lifecycleStatus: i.lifecycle_status,
    openedAt: i.opened_at,
    attached: linkMap.has(i.id),
    publicationState: (linkMap.get(i.id) as PublishableIncident["publicationState"]) ?? null,
  }));
}

export interface PublishableMaintenance {
  maintenanceWindowId: string;
  name: string;
  status: string;
  timezone: string;
  startsAt: string;
  endsAt: string | null;
  attached: boolean;
  publicationState: "draft" | "published" | "hidden" | null;
}

/** Maintenance windows in the org, annotated with status-page attachment. */
export async function listPublishableMaintenance(
  organizationId: string,
  statusPageId: string,
  limit = 50,
): Promise<PublishableMaintenance[]> {
  const db = serviceClient();
  const { data: windows } = await db
    .from("maintenance_windows")
    .select("id, name, status, timezone, starts_at, ends_at")
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: false })
    .limit(limit);
  const rows = windows ?? [];

  const { data: links } = await db
    .from("status_page_maintenance")
    .select("maintenance_window_id, publication_state")
    .eq("status_page_id", statusPageId);
  const linkMap = new Map((links ?? []).map((l) => [l.maintenance_window_id, l.publication_state]));

  return rows.map((w) => ({
    maintenanceWindowId: w.id,
    name: w.name,
    status: w.status,
    timezone: w.timezone,
    startsAt: w.starts_at,
    endsAt: w.ends_at,
    attached: linkMap.has(w.id),
    publicationState: (linkMap.get(w.id) as PublishableMaintenance["publicationState"]) ?? null,
  }));
}

export type PublishIncidentResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Publish an incident to a status page. Requires a public title so no internal
 * title is exposed. Creates the attachment with a public slug if needed.
 */
export async function publishIncidentToStatusPage(input: {
  organizationId: string;
  statusPageId: string;
  incidentId: string;
  actorProfileId: string;
  publicTitle?: string;
  publicSummary?: string;
}): Promise<PublishIncidentResult> {
  const db = serviceClient();
  const { data: incident } = await db
    .from("incidents")
    .select(
      "id, reference_code, public_title, public_summary, severity, lifecycle_status, opened_at, primary_monitor_id",
    )
    .eq("organization_id", input.organizationId)
    .eq("id", input.incidentId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!incident) return { ok: false, reason: "Incident not found." };

  // Set/refresh the incident's public content when provided.
  const patch: Record<string, unknown> = { public_visibility: "published" };
  if (input.publicTitle) patch.public_title = sanitizePlainText(input.publicTitle, 200);
  if (input.publicSummary !== undefined) {
    patch.public_summary = sanitizePlainText(input.publicSummary, 2000);
  }
  const finalTitle = (input.publicTitle ?? incident.public_title)?.trim();
  if (!finalTitle) {
    return { ok: false, reason: "Add a public title before publishing this incident." };
  }
  await db.from("incidents").update(patch as never).eq("id", input.incidentId).eq("organization_id", input.organizationId);

  // Detect first publish vs. re-publish so we emit the right subscriber event.
  const { data: existingLink } = await db
    .from("status_page_incidents")
    .select("publication_state")
    .eq("status_page_id", input.statusPageId)
    .eq("incident_id", input.incidentId)
    .maybeSingle();
  const wasPublished = existingLink?.publication_state === "published";
  const publicSlug = incidentPublicSlug(incident.reference_code ?? "inc", finalTitle);
  await db
    .from("status_page_incidents")
    .upsert(
      {
        status_page_id: input.statusPageId,
        organization_id: input.organizationId,
        incident_id: input.incidentId,
        public_slug: publicSlug,
        publication_state: "published",
        published_at: new Date().toISOString(),
        published_by_user_id: input.actorProfileId,
      },
      { onConflict: "status_page_id,incident_id" },
    );

  // Subscriber emission is best-effort and must never fail publication.
  const eventType = wasPublished ? "incident_update" : "incident_opened";
  await emitIncidentEvent({
    organizationId: input.organizationId,
    statusPageId: input.statusPageId,
    incidentId: input.incidentId,
    eventType,
    title: finalTitle,
    summary:
      (input.publicSummary ?? incident.public_summary ?? null) as string | null,
    severity: incident.severity,
    lifecycleStatus: incident.lifecycle_status,
    openedAt: incident.opened_at,
    primaryMonitorId: incident.primary_monitor_id as string | null,
    publicSlug,
  }).catch((error) => {
    console.error("[subscribers] incident emit failed", error);
  });

  return { ok: true };
}

/** Best-effort subscriber event emission for an incident publish. */
async function emitIncidentEvent(input: {
  organizationId: string;
  statusPageId: string;
  incidentId: string;
  eventType: "incident_opened" | "incident_update";
  title: string;
  summary: string | null;
  severity: string;
  lifecycleStatus: string;
  openedAt: string;
  primaryMonitorId: string | null;
  publicSlug: string;
}): Promise<void> {
  const affected = await incidentAffectedComponents(
    input.statusPageId,
    input.incidentId,
    input.primaryMonitorId,
  );
  const names = await componentNames(input.statusPageId, affected);
  await emitSubscriberEvent({
    organizationId: input.organizationId,
    statusPageId: input.statusPageId,
    eventType: input.eventType,
    incidentId: input.incidentId,
    affectedComponentIds: affected,
    payload: {
      eventType: input.eventType,
      title: input.title,
      statusLabel: eventStatusLabel(input.eventType, input.lifecycleStatus),
      severityLabel:
        input.eventType === "incident_opened"
          ? severityLabel(input.severity)
          : null,
      affectedComponents: names,
      summary: input.summary,
      startedAt: input.openedAt,
      incidentUrl: null,
    },
  });
}

export async function unpublishIncidentFromStatusPage(input: {
  organizationId: string;
  statusPageId: string;
  incidentId: string;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("status_page_incidents")
    .update({ publication_state: "hidden" })
    .eq("status_page_id", input.statusPageId)
    .eq("incident_id", input.incidentId)
    .eq("organization_id", input.organizationId);
}

/** Publish a maintenance window to a status page. */
export async function publishMaintenanceToStatusPage(input: {
  organizationId: string;
  statusPageId: string;
  maintenanceWindowId: string;
  actorProfileId: string;
}): Promise<PublishIncidentResult> {
  const db = serviceClient();
  const { data: win } = await db
    .from("maintenance_windows")
    .select("id, name, description, timezone, starts_at, ends_at")
    .eq("organization_id", input.organizationId)
    .eq("id", input.maintenanceWindowId)
    .maybeSingle();
  if (!win) return { ok: false, reason: "Maintenance window not found." };

  await db
    .from("maintenance_windows")
    .update({ public_visibility: "published" })
    .eq("id", input.maintenanceWindowId)
    .eq("organization_id", input.organizationId);

  const { data: existingLink } = await db
    .from("status_page_maintenance")
    .select("publication_state")
    .eq("status_page_id", input.statusPageId)
    .eq("maintenance_window_id", input.maintenanceWindowId)
    .maybeSingle();
  const wasPublished = existingLink?.publication_state === "published";

  await db.from("status_page_maintenance").upsert(
    {
      status_page_id: input.statusPageId,
      organization_id: input.organizationId,
      maintenance_window_id: input.maintenanceWindowId,
      public_slug: componentSlug(`${win.name}-${win.id.slice(0, 6)}`),
      publication_state: "published",
      published_at: new Date().toISOString(),
      published_by_user_id: input.actorProfileId,
    },
    { onConflict: "status_page_id,maintenance_window_id" },
  );

  // Only the first publish emits the scheduled-maintenance email. Later
  // publishes are treated as updates so a re-save does not re-announce.
  if (!wasPublished) {
    void (async () => {
      const affected = await maintenanceAffectedComponents(
        input.statusPageId,
        input.maintenanceWindowId,
      );
      const names = await componentNames(input.statusPageId, affected);
      await emitSubscriberEvent({
        organizationId: input.organizationId,
        statusPageId: input.statusPageId,
        eventType: "maintenance_scheduled",
        maintenanceWindowId: input.maintenanceWindowId,
        affectedComponentIds: affected,
        payload: {
          eventType: "maintenance_scheduled",
          title: win.name,
          statusLabel: eventStatusLabel("maintenance_scheduled", null),
          affectedComponents: names,
          summary: (win.description ?? null) as string | null,
          scheduledStart: win.starts_at,
          scheduledEnd: win.ends_at,
        },
      });
    })().catch((error) => {
      console.error("[subscribers] maintenance emit failed", error);
    });
  }
  return { ok: true };
}

export async function unpublishMaintenanceFromStatusPage(input: {
  organizationId: string;
  statusPageId: string;
  maintenanceWindowId: string;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("status_page_maintenance")
    .update({ publication_state: "hidden" })
    .eq("status_page_id", input.statusPageId)
    .eq("maintenance_window_id", input.maintenanceWindowId)
    .eq("organization_id", input.organizationId);
}

/** Create and publish a general notice unrelated to a monitored incident. */
export async function createManualMessage(input: {
  organizationId: string;
  statusPageId: string;
  actorProfileId: string;
  title: string;
  body: string;
  noticeType: "notice" | "investigating" | "identified" | "monitoring" | "resolved";
  startsAt?: string;
  endsAt?: string | null;
  publish: boolean;
}): Promise<string> {
  const db = serviceClient();
  const title = sanitizePlainText(input.title, 160);
  const body = sanitizePlainText(input.body, 4000);
  const { data, error } = await db
    .from("status_page_manual_messages")
    .insert({
      organization_id: input.organizationId,
      status_page_id: input.statusPageId,
      public_slug: componentSlug(`${title}-${Date.now().toString(36)}`),
      title,
      body,
      notice_type: input.noticeType,
      starts_at: input.startsAt ?? new Date().toISOString(),
      ends_at: input.endsAt ?? null,
      publication_state: input.publish ? "published" : "draft",
      published_at: input.publish ? new Date().toISOString() : null,
      created_by_user_id: input.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
