"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent } from "@/lib/app/audit";
import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { requireOrganizationPermission } from "@/lib/auth/context";
import { Forbidden, RateLimited } from "@/lib/auth/errors";
import { rateLimit } from "@/lib/site/rate-limit";
import { serviceClient } from "@/lib/supabase/service";

/**
 * Server actions for incident recap corrections and follow-up actions.
 *
 * Snapshots are immutable; the only mutable recap fields are the
 * human-entered root cause (versioned in incident_recap_revisions, never
 * silently rewritten) and the reviewed marker. Follow-up actions are a
 * lightweight incident list, not a project-management system.
 */

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (
    !rateLimit(`recaps:${bucket}:${profileId}`, {
      limit: perMinute,
      windowMs: 60_000,
    })
  ) {
    throw RateLimited();
  }
}

async function requireRecap(organizationId: string, recapId: string) {
  const db = serviceClient();
  const { data: recap } = await db
    .from("incident_recaps")
    .select("id, organization_id, incident_id, root_cause, revision")
    .eq("id", recapId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!recap) throw Forbidden("Recap not found.");
  return recap;
}

const rootCauseSchema = z.object({
  rootCause: z.string().trim().min(3).max(2000),
});

export async function updateRecapRootCauseAction(
  organizationId: string,
  recapId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "incidents:manage",
    );
    limitOrThrow(access.profile.id, "root-cause", 10);
    const data = rootCauseSchema.parse(input);
    const recap = await requireRecap(organizationId, recapId);

    const db = serviceClient();
    // Version the correction before applying it.
    const { error: revisionError } = await db
      .from("incident_recap_revisions")
      .insert({
        recap_id: recap.id,
        organization_id: organizationId,
        field: "root_cause",
        previous_value: recap.root_cause,
        new_value: data.rootCause,
        changed_by_user_id: access.profile.id,
      });
    if (revisionError) throw revisionError;

    const { error } = await db
      .from("incident_recaps")
      .update({
        root_cause: data.rootCause,
        root_cause_updated_by: access.profile.id,
        root_cause_updated_at: new Date().toISOString(),
        revision: recap.revision + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recap.id);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident_recap.root_cause_updated",
      targetType: "incident_recap",
      targetId: recap.id,
      metadata: { revision: recap.revision + 1 },
    });
    revalidatePath(`/app/incidents/${recap.incident_id}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function markRecapReviewedAction(
  organizationId: string,
  recapId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "incidents:manage",
    );
    limitOrThrow(access.profile.id, "review", 20);
    const recap = await requireRecap(organizationId, recapId);

    const db = serviceClient();
    const { error } = await db
      .from("incident_recaps")
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by_user_id: access.profile.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recap.id);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident_recap.reviewed",
      targetType: "incident_recap",
      targetId: recap.id,
    });
    revalidatePath(`/app/incidents/${recap.incident_id}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Follow-up actions                                                   */
/* ------------------------------------------------------------------ */

const followUpSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

export async function createFollowUpActionAction(
  organizationId: string,
  incidentId: string,
  input: unknown,
): Promise<ActionResult<{ actionId: string }>> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "incidents:manage",
    );
    limitOrThrow(access.profile.id, "follow-up", 20);
    const data = followUpSchema.parse(input);

    const db = serviceClient();
    const { data: incident } = await db
      .from("incidents")
      .select("id")
      .eq("id", incidentId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!incident) throw Forbidden("Incident not found.");

    const { data: inserted, error } = await db
      .from("incident_follow_up_actions")
      .insert({
        organization_id: organizationId,
        incident_id: incidentId,
        title: data.title,
        description: data.description ?? null,
        owner_user_id: data.ownerUserId ?? null,
        due_date: data.dueDate ?? null,
        created_by_user_id: access.profile.id,
      })
      .select("id")
      .single();
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident_recap.follow_up_created",
      targetType: "incident_follow_up_action",
      targetId: inserted.id,
    });
    await trackGoal({ name: DataFastGoals.followUpActionCreated });
    revalidatePath(`/app/incidents/${incidentId}`);
    return { ok: true, data: { actionId: inserted.id } };
  } catch (error) {
    return toActionError(error);
  }
}

const followUpUpdateSchema = followUpSchema.partial().extend({
  status: z.enum(["open", "completed", "dropped"]).optional(),
});

export async function updateFollowUpActionAction(
  organizationId: string,
  actionId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "incidents:manage",
    );
    limitOrThrow(access.profile.id, "follow-up", 30);
    const data = followUpUpdateSchema.parse(input);

    const db = serviceClient();
    const { data: existing } = await db
      .from("incident_follow_up_actions")
      .select("id, incident_id, status")
      .eq("id", actionId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!existing) throw Forbidden("Follow-up action not found.");

    const patch: {
      updated_at: string;
      title?: string;
      description?: string | null;
      owner_user_id?: string | null;
      due_date?: string | null;
      status?: string;
      completed_at?: string | null;
    } = {
      updated_at: new Date().toISOString(),
    };
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.ownerUserId !== undefined) patch.owner_user_id = data.ownerUserId;
    if (data.dueDate !== undefined) patch.due_date = data.dueDate;
    if (data.status !== undefined) {
      patch.status = data.status;
      patch.completed_at =
        data.status === "completed" ? new Date().toISOString() : null;
    }

    const { error } = await db
      .from("incident_follow_up_actions")
      .update(patch)
      .eq("id", actionId);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident_recap.follow_up_updated",
      targetType: "incident_follow_up_action",
      targetId: actionId,
      metadata: data.status ? { status: data.status } : undefined,
    });
    revalidatePath(`/app/incidents/${existing.incident_id}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteFollowUpActionAction(
  organizationId: string,
  actionId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "incidents:manage",
    );
    limitOrThrow(access.profile.id, "follow-up", 30);

    const db = serviceClient();
    const { data: existing } = await db
      .from("incident_follow_up_actions")
      .select("id, incident_id")
      .eq("id", actionId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!existing) throw Forbidden("Follow-up action not found.");

    const { error } = await db
      .from("incident_follow_up_actions")
      .delete()
      .eq("id", actionId);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "incident_recap.follow_up_deleted",
      targetType: "incident_follow_up_action",
      targetId: actionId,
    });
    revalidatePath(`/app/incidents/${existing.incident_id}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
