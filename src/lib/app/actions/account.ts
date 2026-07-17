"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requireAuthenticatedUser,
  requireOrganizationPermission,
  requireStepUpAuthentication,
} from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import { recordAuditEvent } from "@/lib/app/audit";
import { getUserDeletionReadiness } from "@/lib/app/account-data";
import { Conflict } from "@/lib/auth/errors";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { toActionError, type ActionResult } from "./shared";

const COOLING_OFF_DAYS = 7;

const scopeSchema = z.enum(["user", "organization"]);

export async function requestExportAction(
  scope: "user" | "organization",
  organizationId?: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const parsedScope = scopeSchema.parse(scope);
    const db = serviceClient();

    let orgId: string | null = null;
    if (parsedScope === "organization") {
      if (!organizationId) throw Conflict("Choose an organization to export.");
      await requireOrganizationPermission(organizationId, "export:request");
      orgId = organizationId;
    }

    const { data: existing } = await db
      .from("export_requests")
      .select("id")
      .eq("requested_by_user_id", profile.id)
      .eq("scope", parsedScope)
      .in("status", ["pending", "processing"])
      .maybeSingle();
    if (existing) {
      throw Conflict("You already have an export in progress. Hang tight.");
    }

    const { error } = await db.from("export_requests").insert({
      organization_id: orgId,
      requested_by_user_id: profile.id,
      scope: parsedScope,
      status: "pending",
    });
    if (error) throw error;

    await recordAuditEvent({
      organizationId: orgId,
      actorUserId: profile.id,
      action: "export.requested",
      targetType: parsedScope,
      summary: `Requested ${parsedScope} data export`,
    });
    await trackGoal({ name: DataFastGoals.exportRequested, metadata: { scope: parsedScope } }).catch(() => {});

    revalidatePath("/app/settings/data");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function requestAccountDeletionAction(): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    await requireStepUpAuthentication();

    const readiness = await getUserDeletionReadiness(profile.id);
    if (!readiness.canDelete) {
      throw Conflict(
        "Transfer or delete the organizations you own before deleting your account.",
      );
    }

    const db = serviceClient();
    const { data: existing } = await db
      .from("deletion_requests")
      .select("id")
      .eq("subject_type", "user")
      .eq("subject_user_id", profile.id)
      .in("status", ["pending", "scheduled"])
      .maybeSingle();
    if (existing) return { ok: true };

    const scheduledFor = new Date(
      Date.now() + COOLING_OFF_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { error } = await db.from("deletion_requests").insert({
      subject_type: "user",
      subject_user_id: profile.id,
      requested_by_user_id: profile.id,
      status: "scheduled",
      scheduled_for: scheduledFor,
    });
    if (error) throw error;

    await recordAuditEvent({
      organizationId: null,
      actorUserId: profile.id,
      action: "deletion.requested",
      targetType: "user",
      targetId: profile.id,
      metadata: { scheduled_for: scheduledFor },
    });
    await trackGoal({ name: DataFastGoals.deletionFlowStarted, metadata: { scope: "user" } }).catch(() => {});

    revalidatePath("/app/settings/data");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function requestOrganizationDeletionAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(organizationId, "org:delete");
    await requireStepUpAuthentication();
    const db = serviceClient();

    const { data: existing } = await db
      .from("deletion_requests")
      .select("id")
      .eq("subject_type", "organization")
      .eq("organization_id", organizationId)
      .in("status", ["pending", "scheduled"])
      .maybeSingle();
    if (existing) return { ok: true };

    const scheduledFor = new Date(
      Date.now() + COOLING_OFF_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error } = await db.from("deletion_requests").insert({
      subject_type: "organization",
      organization_id: organizationId,
      requested_by_user_id: access.profile.id,
      status: "scheduled",
      scheduled_for: scheduledFor,
    });
    if (error) throw error;

    await db
      .from("organizations")
      .update({ status: "pending_deletion" })
      .eq("id", organizationId);

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "deletion.requested",
      targetType: "organization",
      targetId: organizationId,
      metadata: { scheduled_for: scheduledFor },
    });
    await trackGoal({ name: DataFastGoals.deletionFlowStarted, metadata: { scope: "organization" } }).catch(() => {});

    revalidatePath("/app/settings/data");
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function cancelDeletionRequestAction(
  requestId: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const db = serviceClient();

    const { data: request } = await db
      .from("deletion_requests")
      .select("*")
      .eq("id", requestId)
      .in("status", ["pending", "scheduled"])
      .maybeSingle();
    if (!request) throw Conflict("That request is no longer active.");

    // Authorize: the subject user, or an owner of the subject organization.
    if (request.subject_type === "user") {
      if (request.subject_user_id !== profile.id) throw Conflict("Not your request.");
    } else if (request.organization_id) {
      await requireOrganizationPermission(request.organization_id, "org:delete");
    }

    const { error } = await db
      .from("deletion_requests")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) throw error;

    if (request.subject_type === "organization" && request.organization_id) {
      await db
        .from("organizations")
        .update({ status: "active" })
        .eq("id", request.organization_id)
        .eq("status", "pending_deletion");
    }

    await recordAuditEvent({
      organizationId: request.organization_id,
      actorUserId: profile.id,
      action: "deletion.canceled",
      targetType: request.subject_type,
      targetId: requestId,
    });
    await trackGoal({ name: DataFastGoals.deletionFlowCanceled }).catch(() => {});

    revalidatePath("/app/settings/data");
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
