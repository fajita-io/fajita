import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Support tables are applied in Phase 16 migrations. Until generated Database
 * types are refreshed, route support queries through this helper.
 */
export function supportDb() {
  return serviceClient() as unknown as {
    from: (table: string) => ReturnType<ReturnType<typeof serviceClient>["from"]>;
  };
}
