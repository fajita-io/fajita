"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent } from "@/lib/app/audit";
import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { requireAuthenticatedUser } from "@/lib/auth/context";
import { cancelLifecycleIntents } from "@/lib/lifecycle/intents";
import {
  messageKeysForPreference,
  updateLifecyclePreferences,
  type LifecyclePreferences,
} from "@/lib/lifecycle/preferences";

/**
 * User-level lifecycle email preferences. Disabling a preference also cancels
 * any already-queued optional messages of that class, so "off" means off, not
 * "off after the queue drains". Required service messages (deletion notices,
 * cancellation confirmations, export ready) are not controlled here by design.
 */

const prefsSchema = z.object({
  setup_guidance: z.boolean(),
  weekly_report: z.boolean(),
  incident_recaps: z.boolean(),
  usage_notices: z.boolean(),
  reactivation_reminders: z.boolean(),
});

export async function updateLifecyclePreferencesAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const values = prefsSchema.parse(input) as LifecyclePreferences;

    await updateLifecyclePreferences(profile.id, values);

    // Cancel pending optional intents for every preference now disabled.
    const disabledKeys = (
      Object.keys(values) as (keyof LifecyclePreferences)[]
    )
      .filter((key) => !values[key])
      .flatMap((key) => messageKeysForPreference(key));
    if (disabledKeys.length > 0) {
      await cancelLifecycleIntents(
        profile.id,
        disabledKeys,
        "preference_disabled",
      );
    }

    await recordAuditEvent({
      organizationId: null,
      actorUserId: profile.id,
      action: "lifecycle.preferences_changed",
      targetType: "lifecycle_email_preferences",
      targetId: profile.id,
      metadata: { ...values },
    });
    await trackGoal({ name: DataFastGoals.lifecycleEmailPrefsUpdated }).catch(
      () => {},
    );
    revalidatePath("/app/settings/notifications");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
