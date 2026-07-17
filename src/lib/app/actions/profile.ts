"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { toActionError, type ActionResult } from "./shared";

type ProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Add a display name.").max(120),
  timezone: z.string().trim().min(1).max(64),
  theme: z.enum(["light", "dark", "system"]),
  reducedMotion: z.enum(["reduce", "no-preference", "system"]),
  productEmail: z.boolean(),
  marketingEmail: z.boolean(),
});

export async function updateProfileAction(
  input: z.input<typeof profileSchema>,
): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const parsed = profileSchema.parse(input);

    const patch: ProfileUpdate = {
      display_name: parsed.displayName,
      timezone: parsed.timezone,
      theme_preference: parsed.theme,
      reduced_motion_preference: parsed.reducedMotion,
      product_email_preference: parsed.productEmail,
      marketing_email_preference: parsed.marketingEmail,
    };

    const { error } = await serviceClient()
      .from("user_profiles")
      .update(patch)
      .eq("id", profile.id);
    if (error) throw error;

    await trackGoal({ name: DataFastGoals.profileUpdated }).catch(() => {});
    if (parsed.theme !== profile.theme_preference) {
      await trackGoal({ name: DataFastGoals.themeChanged, metadata: { theme: parsed.theme } }).catch(() => {});
    }
    if (parsed.reducedMotion === "reduce" && profile.reduced_motion_preference !== "reduce") {
      await trackGoal({ name: DataFastGoals.reducedMotionEnabled }).catch(() => {});
    }

    revalidatePath("/app/settings/profile");
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
