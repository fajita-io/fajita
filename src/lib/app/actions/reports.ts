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
 * Server actions for weekly report settings and recipients. Settings and the
 * recipient list are owner/admin concerns (`org:update`); recipients must be
 * active members and their personal weekly-report preference is still
 * respected at send time (preference checks live in the lifecycle intent
 * pipeline, not here).
 */

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (
    !rateLimit(`reports:${bucket}:${profileId}`, {
      limit: perMinute,
      windowMs: 60_000,
    })
  ) {
    throw RateLimited();
  }
}

const settingsSchema = z.object({
  enabled: z.boolean(),
  weekStart: z.enum(["monday", "sunday"]),
});

export async function updateReportSettingsAction(
  organizationId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "org:update",
    );
    limitOrThrow(access.profile.id, "settings", 10);
    const data = settingsSchema.parse(input);

    const db = serviceClient();
    const { error } = await db.from("organization_report_settings").upsert(
      {
        organization_id: organizationId,
        enabled: data.enabled,
        week_start: data.weekStart,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" },
    );
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "report.settings_changed",
      targetType: "organization_report_settings",
      targetId: organizationId,
      metadata: { enabled: data.enabled, week_start: data.weekStart },
    });
    revalidatePath("/app/reports");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function addReportRecipientAction(
  organizationId: string,
  userId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "org:update",
    );
    limitOrThrow(access.profile.id, "recipients", 20);
    const parsedUserId = z.string().uuid().parse(userId);

    const db = serviceClient();
    const { data: membership } = await db
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", parsedUserId)
      .eq("status", "active")
      .maybeSingle();
    if (!membership) {
      throw Forbidden("Report recipients must be active members.");
    }

    const { error } = await db.from("weekly_report_recipients").upsert(
      {
        organization_id: organizationId,
        user_id: parsedUserId,
        added_by_user_id: access.profile.id,
      },
      { onConflict: "organization_id,user_id" },
    );
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "report.recipient_added",
      targetType: "weekly_report_recipients",
      targetId: parsedUserId,
    });
    revalidatePath("/app/reports");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeReportRecipientAction(
  organizationId: string,
  userId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "org:update",
    );
    limitOrThrow(access.profile.id, "recipients", 20);
    const parsedUserId = z.string().uuid().parse(userId);

    const db = serviceClient();
    const { error } = await db
      .from("weekly_report_recipients")
      .delete()
      .eq("organization_id", organizationId)
      .eq("user_id", parsedUserId);
    if (error) throw error;

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "report.recipient_removed",
      targetType: "weekly_report_recipients",
      targetId: parsedUserId,
    });
    revalidatePath("/app/reports");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/** Analytics-only marker so report engagement is measurable without content. */
export async function trackReportViewedAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    await requireOrganizationPermission(organizationId, "org:read");
    await trackGoal({ name: DataFastGoals.weeklyReportViewed });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
