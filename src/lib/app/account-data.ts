import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/** Organizations the user owns that still have active members. */
export async function ownedOrgsBlockingDeletion(
  profileId: string,
): Promise<{ id: string; name: string; memberCount: number }[]> {
  const db = serviceClient();
  const { data: owned } = await db
    .from("organizations")
    .select("id, name")
    .eq("owner_user_id", profileId)
    .in("status", ["active", "suspended", "pending_deletion"]);
  const blocking: { id: string; name: string; memberCount: number }[] = [];
  for (const org of owned ?? []) {
    const { count } = await db
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", org.id)
      .eq("status", "active");
    blocking.push({ id: org.id, name: org.name, memberCount: count ?? 0 });
  }
  return blocking;
}

export interface DeletionReadiness {
  canDelete: boolean;
  ownedOrganizations: { id: string; name: string; memberCount: number }[];
}

export async function getUserDeletionReadiness(
  profileId: string,
): Promise<DeletionReadiness> {
  const owned = await ownedOrgsBlockingDeletion(profileId);
  return { canDelete: owned.length === 0, ownedOrganizations: owned };
}
