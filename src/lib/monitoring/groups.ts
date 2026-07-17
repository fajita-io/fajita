import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Monitor group write layer. Organization scoped; callers must have verified
 * the monitors:manage permission first. Deleting a group never deletes its
 * monitors: it clears their group_id (enforced by the FK on delete set null and
 * an explicit update here for the soft-delete path).
 */

export async function createGroup(params: {
  organizationId: string;
  actorProfileId: string;
  name: string;
  description?: string | null;
}): Promise<{ id: string }> {
  const db = serviceClient();
  const { data: maxRow } = await db
    .from("monitor_groups")
    .select("position")
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data, error } = await db
    .from("monitor_groups")
    .insert({
      organization_id: params.organizationId,
      name: params.name,
      description: params.description ?? null,
      position,
      created_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}

export async function renameGroup(params: {
  organizationId: string;
  groupId: string;
  name: string;
  description?: string | null;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("monitor_groups")
    .update({ name: params.name, description: params.description ?? null })
    .eq("id", params.groupId)
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null);
  if (error) throw error;
}

export async function reorderGroups(params: {
  organizationId: string;
  orderedIds: string[];
}): Promise<void> {
  const db = serviceClient();
  // Sequential small updates; group counts are bounded per organization.
  for (let i = 0; i < params.orderedIds.length; i += 1) {
    await db
      .from("monitor_groups")
      .update({ position: i })
      .eq("id", params.orderedIds[i])
      .eq("organization_id", params.organizationId);
  }
}

/** Soft-delete a group and unset it from its monitors. */
export async function deleteGroup(params: {
  organizationId: string;
  groupId: string;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("monitors")
    .update({ group_id: null })
    .eq("organization_id", params.organizationId)
    .eq("group_id", params.groupId);
  const { error } = await db
    .from("monitor_groups")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.groupId)
    .eq("organization_id", params.organizationId);
  if (error) throw error;
}

/** Move a monitor into a group (or ungrouped when groupId is null). */
export async function moveMonitorToGroup(params: {
  organizationId: string;
  monitorId: string;
  groupId: string | null;
}): Promise<void> {
  const db = serviceClient();
  if (params.groupId) {
    // Confirm the group belongs to the same organization (defense in depth).
    const { data: g } = await db
      .from("monitor_groups")
      .select("id")
      .eq("id", params.groupId)
      .eq("organization_id", params.organizationId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!g) throw new Error("Group not found in this organization.");
  }
  const { error } = await db
    .from("monitors")
    .update({ group_id: params.groupId })
    .eq("id", params.monitorId)
    .eq("organization_id", params.organizationId);
  if (error) throw error;
}
