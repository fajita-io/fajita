import "server-only";

import { isPlatformAdmin, requireAuthenticatedUser } from "@/lib/auth/context";
import { Forbidden, NotFound } from "@/lib/auth/errors";
import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import type { ProfileRow } from "@/lib/auth/provisioning";
import {
  FEATURE_REGISTRY,
  isStageAvailable,
} from "@/lib/app/feature-flags";

import { programPublished } from "./config";
import { affiliateCan, type AffiliatePermission } from "./permissions";
import type { MembershipState } from "./states";

export type AffiliateRow = Database["public"]["Tables"]["affiliates"]["Row"];

export interface AffiliateAccess {
  profile: ProfileRow;
  affiliate: AffiliateRow;
}

/** Resolve the current caller's affiliate record, or null if they have none. */
export async function getAffiliateForCurrentUser(): Promise<{
  profile: ProfileRow;
  affiliate: AffiliateRow | null;
}> {
  const profile = await requireAuthenticatedUser();
  const db = serviceClient();
  const { data } = await db
    .from("affiliates")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  return { profile, affiliate: data ?? null };
}

/** Require the caller to be an affiliate (any membership state). */
export async function requireAffiliate(): Promise<AffiliateAccess> {
  const { profile, affiliate } = await getAffiliateForCurrentUser();
  if (!affiliate) throw Forbidden();
  return { profile, affiliate };
}

/**
 * Require an affiliate with a given permission. Suspended/terminated affiliates
 * keep only read permissions (see permissions.ts). Terminated/closed affiliates
 * are further gated at the route layer.
 */
export async function requireAffiliatePermission(
  permission: AffiliatePermission,
): Promise<AffiliateAccess> {
  const access = await requireAffiliate();
  const state = access.affiliate.membership_state as MembershipState;
  if (!affiliateCan(state, permission)) throw Forbidden();
  return access;
}

/**
 * Whether the affiliate program is publicly available (published terms + a
 * shipped feature stage). Until then the program is admin-preview only.
 */
export function affiliateProgramIsPublic(): boolean {
  return (
    programPublished && isStageAvailable(FEATURE_REGISTRY.affiliates.stage)
  );
}

/**
 * Whether the caller may see public program surfaces (landing page,
 * application). Everyone when the program is public; platform admins only
 * during pre-launch preview. Pages use this with Next's notFound(); server
 * actions use requireAffiliateProgramAccess() so the error maps cleanly.
 */
export async function canAccessAffiliateProgram(): Promise<boolean> {
  if (affiliateProgramIsPublic()) return true;
  return isPlatformAdmin();
}

/**
 * Action-layer gate for public program surfaces. Throws not-found to avoid
 * advertising an unlaunched program.
 */
export async function requireAffiliateProgramAccess(): Promise<void> {
  if (await canAccessAffiliateProgram()) return;
  throw NotFound();
}
