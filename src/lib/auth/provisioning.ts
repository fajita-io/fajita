import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

interface ClerkIdentity {
  id: string;
  primaryEmail: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

function localPart(email: string | null): string | null {
  if (!email) return null;
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

/**
 * Idempotently ensure a Fajita profile exists for a Clerk identity.
 *
 * Insert on first sight. On subsequent calls we refresh the provider-owned
 * field (primary_email) but never clobber user-controlled application fields
 * (display_name, avatar_url, preferences): those are filled from Clerk only
 * when still empty. Safe to call on every authenticated request and from the
 * Clerk webhook; the unique constraint on external_id serializes races.
 */
export async function ensureUserProfile(
  identity: ClerkIdentity,
): Promise<ProfileRow> {
  const db = serviceClient();

  const { data: existing, error: readError } = await db
    .from("user_profiles")
    .select("*")
    .eq("external_id", identity.id)
    .maybeSingle();

  if (readError) throw readError;

  if (existing) {
    const patch: Partial<ProfileRow> = { last_seen_at: new Date().toISOString() };
    if (identity.primaryEmail && identity.primaryEmail !== existing.primary_email) {
      patch.primary_email = identity.primaryEmail;
    }
    if (!existing.display_name && identity.displayName) {
      patch.display_name = identity.displayName;
    }
    if (!existing.avatar_url && identity.avatarUrl) {
      patch.avatar_url = identity.avatarUrl;
    }
    const { data: updated, error: updateError } = await db
      .from("user_profiles")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (updateError) throw updateError;
    return updated;
  }

  const displayName =
    identity.displayName ?? localPart(identity.primaryEmail) ?? "New member";

  const { data: inserted, error: insertError } = await db
    .from("user_profiles")
    .insert({
      external_id: identity.id,
      primary_email: identity.primaryEmail,
      display_name: displayName,
      avatar_url: identity.avatarUrl,
      last_seen_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  // Lost an insert race: fall back to the row the other request created.
  if (insertError) {
    if (insertError.code === "23505") {
      const { data: raced, error } = await db
        .from("user_profiles")
        .select("*")
        .eq("external_id", identity.id)
        .single();
      if (error) throw error;
      return raced;
    }
    throw insertError;
  }

  return inserted;
}

/** Mark a profile suspended (webhook: user banned/locked). */
export async function suspendUserProfile(externalId: string): Promise<void> {
  const db = serviceClient();
  await db
    .from("user_profiles")
    .update({ suspended_at: new Date().toISOString() })
    .eq("external_id", externalId)
    .is("suspended_at", null);
}

/** Clear a suspension (webhook: user unbanned). */
export async function unsuspendUserProfile(externalId: string): Promise<void> {
  const db = serviceClient();
  await db
    .from("user_profiles")
    .update({ suspended_at: null })
    .eq("external_id", externalId);
}

/**
 * Soft-delete a profile (webhook: user.deleted). We keep the row for audit
 * integrity and set deleted_at; hard cleanup of owned organizations is handled
 * by the deletion worker foundation, not synchronously here.
 */
export async function softDeleteUserProfile(externalId: string): Promise<void> {
  const db = serviceClient();
  await db
    .from("user_profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("external_id", externalId)
    .is("deleted_at", null);
}
