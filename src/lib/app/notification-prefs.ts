import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";

type Row = Database["public"]["Tables"]["notification_preferences"]["Row"];

/** Read a user's notification preferences (server-only; caller-scoped). */
export async function getNotificationPreferences(
  userId: string,
): Promise<Row | null> {
  const { data } = await serviceClient()
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
