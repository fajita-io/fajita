import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";

type PrefRow = Database["public"]["Tables"]["user_preferences"]["Row"];

export const PREFERENCE_DEFAULTS: Omit<
  PrefRow,
  "user_id" | "created_at" | "updated_at"
> = {
  date_format: "YYYY-MM-DD",
  time_format: "24h",
  week_start: "monday",
  default_landing: "overview",
  chart_density: "comfortable",
};

/** Read a user's stored preferences (server-only; caller passes its own id). */
export async function getPreferences(userId: string): Promise<PrefRow | null> {
  const { data } = await serviceClient()
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
