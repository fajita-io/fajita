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
  cancelMaintenanceWindow,
  createMaintenanceWindow,
  updateMaintenanceWindow,
} from "@/lib/incidents/maintenance";
import { SUPPRESSION_POLICIES } from "@/lib/incidents/constants";

/**
 * Server actions for maintenance windows. Verify `maintenance:manage`, confirm
 * the maintenance feature is available, rate-limit by actor, and audit. The
 * engine reads these windows to suppress incident opening; suppression logic
 * itself lives in SQL, not here.
 */

async function requireMaintenanceAccess(organizationId: string) {
  const access = await requireOrganizationPermission(
    organizationId,
    "maintenance:manage",
  );
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("maintenance", organizationId);
  if (!admin && !enabled) {
    throw Forbidden("Maintenance windows are not available yet.");
  }
  return access;
}

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (
    !rateLimit(`maintenance:${bucket}:${profileId}`, {
      limit: perMinute,
      windowMs: 60_000,
    })
  ) {
    throw RateLimited();
  }
}

const windowSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).optional(),
    internalNotes: z.string().trim().max(4000).optional(),
    publicSummary: z.string().trim().max(4000).optional(),
    timezone: z.string().trim().min(1).max(64),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    suppressionPolicy: z.enum(SUPPRESSION_POLICIES).default("suppress_incidents"),
    monitorIds: z.array(z.string().uuid()).max(200).default([]),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: "End time must be after the start time.",
    path: ["endsAt"],
  });

export async function createMaintenanceWindowAction(
  organizationId: string,
  input: unknown,
): Promise<ActionResult<{ windowId: string }>> {
  try {
    const access = await requireMaintenanceAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 20);
    const data = windowSchema.parse(input);

    const windowId = await createMaintenanceWindow({
      organizationId,
      actorProfileId: access.profile.id,
      data,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "maintenance.created",
      targetType: "maintenance_window",
      targetId: windowId,
      summary: `Scheduled maintenance "${data.name}"`,
      metadata: {
        suppression_policy: data.suppressionPolicy,
        monitor_count: data.monitorIds.length,
      },
    });
    await trackGoal({ name: DataFastGoals.maintenanceCreated }).catch(() => {});

    revalidatePath("/app/maintenance");
    return { ok: true, data: { windowId } };
  } catch (error) {
    return toActionError(error);
  }
}

const editSchema = windowSchema.partial();

export async function updateMaintenanceWindowAction(
  organizationId: string,
  windowId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireMaintenanceAccess(organizationId);
    limitOrThrow(access.profile.id, "update", 40);
    const data = editSchema.parse(input);

    await updateMaintenanceWindow({ organizationId, windowId, data });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "maintenance.updated",
      targetType: "maintenance_window",
      targetId: windowId,
      summary: "Updated a maintenance window",
    });
    await trackGoal({ name: DataFastGoals.maintenanceUpdated }).catch(() => {});

    revalidatePath("/app/maintenance");
    revalidatePath(`/app/maintenance/${windowId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function cancelMaintenanceWindowAction(
  organizationId: string,
  windowId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMaintenanceAccess(organizationId);
    limitOrThrow(access.profile.id, "cancel", 30);

    await cancelMaintenanceWindow({
      organizationId,
      windowId,
      actorProfileId: access.profile.id,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "maintenance.canceled",
      targetType: "maintenance_window",
      targetId: windowId,
      summary: "Canceled a maintenance window",
    });
    await trackGoal({ name: DataFastGoals.maintenanceCanceled }).catch(() => {});

    revalidatePath("/app/maintenance");
    revalidatePath(`/app/maintenance/${windowId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
