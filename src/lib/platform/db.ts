import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Phase 17 platform-operations tables. Until generated Database types are
 * refreshed, route ops queries through this helper (same pattern as support).
 */
export function platformDb() {
  return serviceClient() as unknown as {
    from: (table: string) => ReturnType<ReturnType<typeof serviceClient>["from"]>;
  };
}
