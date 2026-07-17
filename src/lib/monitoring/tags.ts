import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Monitor tag write layer. Organization scoped; callers must have verified the
 * monitors:manage permission first. Tag names are normalized to lower case and
 * de-duplicated per organization by a partial unique index. Colors come from a
 * fixed accessible palette (enforced by a check constraint), never arbitrary
 * hex, so a tag can never break contrast.
 */

export const TAG_COLOR_TOKENS = [
  "neutral",
  "ember",
  "amber",
  "lime",
  "sky",
  "violet",
  "rose",
  "slate",
] as const;
export type TagColorToken = (typeof TAG_COLOR_TOKENS)[number];

/** Normalize a tag name: trim, collapse whitespace, lower case. */
export function normalizeTagName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 40);
}

/** Create a tag, or return the existing one with the same normalized name. */
export async function createTag(params: {
  organizationId: string;
  actorProfileId: string;
  name: string;
  colorToken?: TagColorToken;
}): Promise<{ id: string; created: boolean }> {
  const db = serviceClient();
  const name = normalizeTagName(params.name);
  if (!name) throw new Error("A tag name is required.");

  const { data: existing } = await db
    .from("monitor_tags")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("name", name)
    .is("deleted_at", null)
    .maybeSingle();
  if (existing) return { id: existing.id, created: false };

  const { data, error } = await db
    .from("monitor_tags")
    .insert({
      organization_id: params.organizationId,
      name,
      color_token: params.colorToken ?? "neutral",
      created_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id, created: true };
}

export async function renameTag(params: {
  organizationId: string;
  tagId: string;
  name: string;
  colorToken?: TagColorToken;
}): Promise<void> {
  const db = serviceClient();
  const name = normalizeTagName(params.name);
  if (!name) throw new Error("A tag name is required.");
  const update: { name: string; color_token?: TagColorToken } = { name };
  if (params.colorToken) update.color_token = params.colorToken;
  const { error } = await db
    .from("monitor_tags")
    .update(update)
    .eq("id", params.tagId)
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null);
  if (error) throw error;
}

export async function deleteTag(params: {
  organizationId: string;
  tagId: string;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("monitor_tag_assignments")
    .delete()
    .eq("organization_id", params.organizationId)
    .eq("tag_id", params.tagId);
  const { error } = await db
    .from("monitor_tags")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.tagId)
    .eq("organization_id", params.organizationId);
  if (error) throw error;
}

/** Attach a tag to a monitor (idempotent). */
export async function assignTag(params: {
  organizationId: string;
  monitorId: string;
  tagId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db.from("monitor_tag_assignments").upsert(
    {
      organization_id: params.organizationId,
      monitor_id: params.monitorId,
      tag_id: params.tagId,
    },
    { onConflict: "monitor_id,tag_id" },
  );
  if (error) throw error;
}

/** Detach a tag from a monitor. */
export async function unassignTag(params: {
  organizationId: string;
  monitorId: string;
  tagId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("monitor_tag_assignments")
    .delete()
    .eq("organization_id", params.organizationId)
    .eq("monitor_id", params.monitorId)
    .eq("tag_id", params.tagId);
  if (error) throw error;
}
