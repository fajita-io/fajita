"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent } from "@/lib/app/audit";
import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import {
  isPlatformAdmin,
  requireOrganizationPermission,
} from "@/lib/auth/context";
import { Forbidden, RateLimited } from "@/lib/auth/errors";
import { rateLimit } from "@/lib/site/rate-limit";
import {
  acknowledgeIncident,
  addNote,
  addUpdate,
  assignIncident,
  attachMonitor,
  cancelIncident,
  changeSeverity,
  createManualIncident,
  removeMonitor,
  resolveIncident,
} from "@/lib/incidents/incidents";
import {
  ASSIGNABLE_SEVERITIES,
  OPERATIONAL_STATES,
  UPDATE_TYPES,
  UPDATE_VISIBILITY,
} from "@/lib/incidents/constants";

/**
 * Server actions for incident operations. These are internal foundation APIs.
 * Every action verifies the `incidents:manage` permission, confirms the feature
 * is available (platform admins during private beta; feature-enabled orgs
 * later), rate-limits by actor, and records an audit event plus (where useful)
 * an analytics goal that never carries incident content.
 *
 * Automatic state transitions and evidence are written only by the SQL engine
 * and the worker-owned drain. Nothing here can forge a system event, write
 * delivery status, or resolve a monitor's observed operational state by hand.
 */

async function requireIncidentAccess(organizationId: string) {
  const access = await requireOrganizationPermission(
    organizationId,
    "incidents:manage",
  );
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("incidents", organizationId);
  if (!admin && !enabled) {
    throw Forbidden("Incidents are not available for this organization yet.");
  }
  return access;
}

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (
    !rateLimit(`incidents:${bucket}:${profileId}`, {
      limit: perMinute,
      windowMs: 60_000,
    })
  ) {
    throw RateLimited();
  }
}

const createSchema = z.object({
  title: z.string().trim().min(3).max(160),
  severity: z.enum(ASSIGNABLE_SEVERITIES),
  operationalStatus: z.enum(OPERATIONAL_STATES),
  internalSummary: z.string().trim().max(4000).optional(),
  publicSummary: z.string().trim().max(4000).optional(),
  publicVisibility: z.enum(["internal", "status_page_ready"]).default("internal"),
  assigneeUserId: z.string().uuid().nullable().optional(),
  monitorIds: z.array(z.string().uuid()).max(50).default([]),
});

export async function createManualIncidentAction(
  organizationId: string,
  input: unknown,
): Promise<ActionResult<{ incidentId: string }>> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 20);
    const data = createSchema.parse(input);

    const incidentId = await createManualIncident({
      organizationId,
      actorProfileId: access.profile.id,
      title: data.title,
      severity: data.severity,
      operationalStatus: data.operationalStatus,
      internalSummary: data.internalSummary ?? null,
      publicSummary: data.publicSummary ?? null,
      publicVisibility: data.publicVisibility,
      assigneeUserId: data.assigneeUserId ?? null,
    });

    for (const monitorId of [...new Set(data.monitorIds)]) {
      await attachMonitor({
        organizationId,
        incidentId,
        monitorId,
        actorProfileId: access.profile.id,
      }).catch(() => {});
    }

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.created",
      targetType: "incident",
      targetId: incidentId,
      summary: "Created a manual incident",
      metadata: { severity: data.severity, origin: "manual" },
    });
    await trackGoal({
      name: DataFastGoals.manualIncidentCreated,
      metadata: { severity: data.severity },
    }).catch(() => {});

    revalidatePath("/app/incidents");
    return { ok: true, data: { incidentId } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function acknowledgeIncidentAction(
  organizationId: string,
  incidentId: string,
  acknowledge: boolean,
  note?: string,
): Promise<ActionResult> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "ack", 60);
    const safeNote = note ? z.string().trim().max(500).parse(note) : null;
    await acknowledgeIncident({
      organizationId,
      incidentId,
      actorProfileId: access.profile.id,
      acknowledge,
      note: safeNote,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: acknowledge ? "incident.acknowledged" : "incident.unacknowledged",
      targetType: "incident",
      targetId: incidentId,
      summary: acknowledge ? "Acknowledged incident" : "Removed acknowledgment",
    });
    if (acknowledge) {
      await trackGoal({ name: DataFastGoals.incidentAcknowledged }).catch(() => {});
    }
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function assignIncidentAction(
  organizationId: string,
  incidentId: string,
  assigneeUserId: string | null,
): Promise<ActionResult> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "assign", 60);
    const safeAssignee = assigneeUserId
      ? z.string().uuid().parse(assigneeUserId)
      : null;
    await assignIncident({
      organizationId,
      incidentId,
      assigneeUserId: safeAssignee,
      actorProfileId: access.profile.id,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.assigned",
      targetType: "incident",
      targetId: incidentId,
      summary: safeAssignee ? "Assigned incident" : "Cleared incident assignee",
    });
    await trackGoal({ name: DataFastGoals.incidentAssigned }).catch(() => {});
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function changeSeverityAction(
  organizationId: string,
  incidentId: string,
  severity: string,
): Promise<ActionResult> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "severity", 60);
    const parsed = z.enum(ASSIGNABLE_SEVERITIES).parse(severity);
    await changeSeverity({
      organizationId,
      incidentId,
      actorProfileId: access.profile.id,
      severity: parsed,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.severity_changed",
      targetType: "incident",
      targetId: incidentId,
      summary: `Changed severity to ${parsed}`,
      metadata: { severity: parsed },
    });
    await trackGoal({
      name: DataFastGoals.incidentSeverityChanged,
      metadata: { severity: parsed },
    }).catch(() => {});
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const updateSchema = z.object({
  updateType: z.enum(UPDATE_TYPES),
  visibility: z.enum(UPDATE_VISIBILITY),
  body: z.string().trim().min(1).max(4000),
});

export async function addUpdateAction(
  organizationId: string,
  incidentId: string,
  input: unknown,
): Promise<ActionResult<{ updateId: string }>> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "update", 40);
    const data = updateSchema.parse(input);
    const updateId = await addUpdate({
      organizationId,
      incidentId,
      actorProfileId: access.profile.id,
      updateType: data.updateType,
      visibility: data.visibility,
      body: data.body,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.public_update_added",
      targetType: "incident",
      targetId: incidentId,
      summary: `Added a ${data.visibility === "public_ready" ? "public-ready" : "internal"} update`,
      metadata: { update_type: data.updateType, visibility: data.visibility },
    });
    await trackGoal({
      name: DataFastGoals.incidentUpdateAdded,
      metadata: { visibility: data.visibility },
    }).catch(() => {});
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true, data: { updateId } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function addNoteAction(
  organizationId: string,
  incidentId: string,
  body: string,
): Promise<ActionResult<{ noteId: string }>> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "note", 60);
    const safeBody = z.string().trim().min(1).max(4000).parse(body);
    const noteId = await addNote({
      organizationId,
      incidentId,
      actorProfileId: access.profile.id,
      body: safeBody,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.note_added",
      targetType: "incident",
      targetId: incidentId,
      summary: "Added an internal note",
    });
    await trackGoal({ name: DataFastGoals.incidentNoteAdded }).catch(() => {});
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true, data: { noteId } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function attachMonitorAction(
  organizationId: string,
  incidentId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "attach", 60);
    await attachMonitor({
      organizationId,
      incidentId,
      monitorId: z.string().uuid().parse(monitorId),
      actorProfileId: access.profile.id,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.monitor_attached",
      targetType: "incident",
      targetId: incidentId,
      summary: "Attached a monitor to the incident",
    });
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeMonitorAction(
  organizationId: string,
  incidentId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "detach", 60);
    await removeMonitor({
      organizationId,
      incidentId,
      monitorId: z.string().uuid().parse(monitorId),
      actorProfileId: access.profile.id,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.monitor_removed",
      targetType: "incident",
      targetId: incidentId,
      summary: "Removed a monitor from the incident",
    });
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const resolveSchema = z.object({
  resolutionSummary: z.string().trim().max(4000).optional(),
  suppressReopenSeconds: z.number().int().min(0).max(3600).default(0),
});

export async function resolveIncidentAction(
  organizationId: string,
  incidentId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "resolve", 30);
    const data = resolveSchema.parse(input ?? {});
    await resolveIncident({
      organizationId,
      incidentId,
      actorProfileId: access.profile.id,
      resolutionSummary: data.resolutionSummary ?? null,
      suppressReopenSeconds: data.suppressReopenSeconds,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.resolved",
      targetType: "incident",
      targetId: incidentId,
      summary: "Manually resolved incident",
    });
    await trackGoal({ name: DataFastGoals.incidentResolved }).catch(() => {});
    revalidatePath(`/app/incidents/${incidentId}`);
    revalidatePath("/app/incidents");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function cancelIncidentAction(
  organizationId: string,
  incidentId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const access = await requireIncidentAccess(organizationId);
    limitOrThrow(access.profile.id, "cancel", 30);
    const safeReason = z.string().trim().min(3).max(500).parse(reason);
    await cancelIncident({
      organizationId,
      incidentId,
      actorProfileId: access.profile.id,
      reason: safeReason,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident.canceled",
      targetType: "incident",
      targetId: incidentId,
      summary: "Canceled incident",
    });
    await trackGoal({ name: DataFastGoals.incidentCanceled }).catch(() => {});
    revalidatePath(`/app/incidents/${incidentId}`);
    revalidatePath("/app/incidents");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
