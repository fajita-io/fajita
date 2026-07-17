"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import { markOnboardingStepAction } from "./onboarding";
import { readActiveOrgId } from "@/lib/app/active-org";
import { toActionError, type ActionResult } from "./shared";

const schema = z.object({
  productUpdates: z.boolean(),
  changelogDigest: z.boolean(),
  featureAnnouncements: z.boolean(),
  accountActivity: z.boolean().optional(),
  education: z.boolean(),
  marketing: z.boolean(),
});

export async function updateNotificationPreferencesAction(
  input: z.input<typeof schema>,
): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const parsed = schema.parse(input);

    // account_activity is a security/transactional category and stays on: users
    // must be reachable for invitations, role changes, and security alerts.
    const { error } = await serviceClient()
      .from("notification_preferences")
      .upsert(
        {
          user_id: profile.id,
          product_updates: parsed.productUpdates,
          changelog_digest: parsed.changelogDigest,
          feature_announcements: parsed.featureAnnouncements,
          account_activity: true,
          education: parsed.education,
          marketing: parsed.marketing,
        },
        { onConflict: "user_id" },
      );
    if (error) throw error;

    const activeOrg = await readActiveOrgId();
    if (activeOrg) {
      await markOnboardingStepAction(activeOrg, "notifications_reviewed").catch(() => {});
    }

    revalidatePath("/app/settings/notifications");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
