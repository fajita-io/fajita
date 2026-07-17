"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import { toActionError, type ActionResult } from "./shared";

const prefsSchema = z.object({
  dateFormat: z.enum(["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "DD MMM YYYY"]),
  timeFormat: z.enum(["12h", "24h"]),
  weekStart: z.enum(["sunday", "monday"]),
  defaultLanding: z.enum(["overview", "team", "settings"]),
  chartDensity: z.enum(["comfortable", "compact"]),
});

export async function updatePreferencesAction(
  input: z.input<typeof prefsSchema>,
): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const parsed = prefsSchema.parse(input);

    const { error } = await serviceClient()
      .from("user_preferences")
      .upsert(
        {
          user_id: profile.id,
          date_format: parsed.dateFormat,
          time_format: parsed.timeFormat,
          week_start: parsed.weekStart,
          default_landing: parsed.defaultLanding,
          chart_density: parsed.chartDensity,
        },
        { onConflict: "user_id" },
      );
    if (error) throw error;

    revalidatePath("/app/settings/preferences");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
