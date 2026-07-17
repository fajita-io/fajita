"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent } from "@/lib/app/audit";
import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin, requireOrganizationPermission } from "@/lib/auth/context";
import { Forbidden, RateLimited } from "@/lib/auth/errors";
import { rateLimit } from "@/lib/site/rate-limit";
import {
  createGroup,
  deleteGroup,
  renameGroup,
  reorderGroups,
} from "@/lib/monitoring/groups";

async function requireAccess(organizationId: string) {
  const access = await requireOrganizationPermission(organizationId, "monitors:manage");
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("monitors", organizationId);
  if (!admin && !enabled) {
    throw Forbidden("Monitoring is not available for this organization yet.");
  }
  return access;
}

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (!rateLimit(`groups:${bucket}:${profileId}`, { limit: perMinute, windowMs: 60_000 })) {
    throw RateLimited();
  }
}

const nameSchema = z.string().trim().min(1, "A name is required.").max(80);
const descSchema = z.string().trim().max(500).optional();

export async function createGroupAction(
  organizationId: string,
  name: unknown,
  description?: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 30);
    const parsedName = nameSchema.parse(name);
    const parsedDesc = descSchema.parse(description);
    const { id } = await createGroup({
      organizationId,
      actorProfileId: access.profile.id,
      name: parsedName,
      description: parsedDesc ?? null,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor_group.created",
      targetType: "monitor_group",
      targetId: id,
      summary: `Created group "${parsedName}"`,
    });
    await trackGoal({ name: DataFastGoals.monitorGroupCreated }).catch(() => {});
    revalidatePath("/app/monitor-groups");
    revalidatePath("/app/monitors");
    return { ok: true, data: { id } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function renameGroupAction(
  organizationId: string,
  groupId: string,
  name: unknown,
  description?: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "rename", 40);
    const parsedName = nameSchema.parse(name);
    const parsedDesc = descSchema.parse(description);
    await renameGroup({
      organizationId,
      groupId,
      name: parsedName,
      description: parsedDesc ?? null,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor_group.updated",
      targetType: "monitor_group",
      targetId: groupId,
      summary: "Updated a group",
    });
    revalidatePath("/app/monitor-groups");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function reorderGroupsAction(
  organizationId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "reorder", 30);
    const ids = z.array(z.string().uuid()).max(200).parse(orderedIds);
    await reorderGroups({ organizationId, orderedIds: ids });
    revalidatePath("/app/monitor-groups");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteGroupAction(
  organizationId: string,
  groupId: string,
): Promise<ActionResult> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "delete", 20);
    await deleteGroup({ organizationId, groupId });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor_group.deleted",
      targetType: "monitor_group",
      targetId: groupId,
      summary: "Deleted a group (its monitors were kept and ungrouped)",
    });
    revalidatePath("/app/monitor-groups");
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
