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
  assignTag,
  createTag,
  deleteTag,
  renameTag,
  TAG_COLOR_TOKENS,
  unassignTag,
  type TagColorToken,
} from "@/lib/monitoring/tags";

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
  if (!rateLimit(`tags:${bucket}:${profileId}`, { limit: perMinute, windowMs: 60_000 })) {
    throw RateLimited();
  }
}

const nameSchema = z.string().trim().min(1, "A tag name is required.").max(40);
const colorSchema = z.enum(TAG_COLOR_TOKENS).optional();

export async function createTagAction(
  organizationId: string,
  name: unknown,
  color?: unknown,
): Promise<ActionResult<{ id: string; created: boolean }>> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 40);
    const parsedName = nameSchema.parse(name);
    const parsedColor = colorSchema.parse(color) as TagColorToken | undefined;
    const result = await createTag({
      organizationId,
      actorProfileId: access.profile.id,
      name: parsedName,
      colorToken: parsedColor,
    });
    if (result.created) {
      await recordAuditEvent({
        organizationId,
        actorUserId: access.profile.id,
        action: "monitor_tag.created",
        targetType: "monitor_tag",
        targetId: result.id,
        summary: "Created a tag",
      });
      await trackGoal({ name: DataFastGoals.monitorTagCreated }).catch(() => {});
    }
    revalidatePath("/app/monitors");
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function renameTagAction(
  organizationId: string,
  tagId: string,
  name: unknown,
  color?: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "rename", 40);
    const parsedName = nameSchema.parse(name);
    const parsedColor = colorSchema.parse(color) as TagColorToken | undefined;
    await renameTag({ organizationId, tagId, name: parsedName, colorToken: parsedColor });
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteTagAction(
  organizationId: string,
  tagId: string,
): Promise<ActionResult> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "delete", 30);
    await deleteTag({ organizationId, tagId });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor_tag.deleted",
      targetType: "monitor_tag",
      targetId: tagId,
      summary: "Deleted a tag",
    });
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function assignTagAction(
  organizationId: string,
  monitorId: string,
  tagId: string,
): Promise<ActionResult> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "assign", 120);
    await assignTag({ organizationId, monitorId, tagId });
    revalidatePath(`/app/monitors/${monitorId}`);
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function unassignTagAction(
  organizationId: string,
  monitorId: string,
  tagId: string,
): Promise<ActionResult> {
  try {
    const access = await requireAccess(organizationId);
    limitOrThrow(access.profile.id, "unassign", 120);
    await unassignTag({ organizationId, monitorId, tagId });
    revalidatePath(`/app/monitors/${monitorId}`);
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
