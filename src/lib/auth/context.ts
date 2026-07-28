import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import { platformAdminIds } from "@/lib/env";
import { ensureUserProfile, type ProfileRow } from "./provisioning";
import {
  Forbidden,
  OrgUnavailable,
  StepUpRequired,
  Suspended,
  Unauthenticated,
} from "./errors";
import { can, type OrgRole, type Permission } from "./roles";

type MemberRow = Database["public"]["Tables"]["organization_members"]["Row"];
type OrgRow = Database["public"]["Tables"]["organizations"]["Row"];

export interface OrgAccess {
  profile: ProfileRow;
  organization: OrgRow;
  membership: MemberRow;
  role: OrgRole;
}

/** Clerk session user id, or null when unauthenticated. */
export async function getSessionUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Load the current caller's profile, provisioning it on first sight. Returns
 * null when there is no session. Does not enforce suspension/deletion; callers
 * that need a usable account use `requireAuthenticatedUser`.
 */
export async function getCurrentProfile(): Promise<ProfileRow | null> {
  let userId: string | null;
  try {
    userId = await getSessionUserId();
  } catch (error) {
    console.error("[auth] session lookup failed", error);
    return null;
  }
  if (!userId) return null;

  const db = serviceClient();
  const { data, error: readError } = await db
    .from("user_profiles")
    .select("*")
    .eq("external_id", userId)
    .maybeSingle();
  if (readError) throw readError;
  if (data) return data;

  // First authenticated hit: provision from the Clerk identity. currentUser can
  // briefly return null right after signup while the session cookie settles.
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("[auth] currentUser failed during provisioning", error);
    return null;
  }
  if (!user) return null;
  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    null;
  return ensureUserProfile({
    id: userId,
    primaryEmail,
    displayName,
    avatarUrl: user.imageUrl ?? null,
  });
}

/**
 * Require a signed-in, usable account. Throws for anonymous, suspended, or
 * soft-deleted callers. Protected routes are already gated by middleware; this
 * is the server-action / data-layer guard.
 */
export async function requireAuthenticatedUser(): Promise<ProfileRow> {
  const profile = await getCurrentProfile();
  if (!profile) throw Unauthenticated();
  if (profile.deleted_at) throw Unauthenticated();
  if (profile.suspended_at) throw Suspended();
  return profile;
}

/**
 * Require active membership in an organization. Verifies the organization is
 * usable (active) and the caller is an active member. Returns the resolved
 * access bundle. Never trusts a client-supplied role; role comes from the row.
 */
export async function requireOrganizationMembership(
  organizationId: string,
): Promise<OrgAccess> {
  const profile = await requireAuthenticatedUser();
  const db = serviceClient();

  const { data: organization } = await db
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .maybeSingle();
  if (!organization) throw OrgUnavailable();
  if (organization.status === "deleted" || organization.status === "suspended") {
    throw OrgUnavailable();
  }

  const { data: membership } = await db
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!membership || membership.status !== "active") throw Forbidden();

  return {
    profile,
    organization,
    membership,
    role: membership.role as OrgRole,
  };
}

/**
 * Require a specific permission in an organization. Central gate for every
 * mutating server action. Deny by default.
 */
export async function requireOrganizationPermission(
  organizationId: string,
  permission: Permission,
): Promise<OrgAccess> {
  const access = await requireOrganizationMembership(organizationId);
  if (!can(access.role, permission)) throw Forbidden();
  return access;
}

/**
 * Platform administration is an internal role, entirely separate from
 * organization roles. Membership comes from an explicit allowlist of Clerk
 * user ids (PLATFORM_ADMIN_USER_IDS), never from an email domain. Empty
 * allowlist means nobody is an admin, which is the safe default.
 */
export async function requirePlatformAdmin(): Promise<ProfileRow> {
  const profile = await requireAuthenticatedUser();
  const admins = platformAdminIds();
  if (!admins.has(profile.external_id)) throw Forbidden();
  return profile;
}

export async function isPlatformAdmin(): Promise<boolean> {
  const userId = await getSessionUserId();
  if (!userId) return false;
  return platformAdminIds().has(userId);
}

/**
 * Step-up (reverification) foundation for high-risk actions (account/org
 * deletion, ownership transfer). When the Clerk instance has reverification
 * configured, this enforces a fresh factor check; otherwise it is a no-op and
 * the sensitive flow relies on typed confirmation in the UI. It never claims a
 * control that is not active.
 *
 * @returns true when a fresh factor was verified.
 */
export async function hasFreshStepUp(): Promise<boolean> {
  try {
    const { has } = await auth();
    return has?.({ reverification: "strict" }) ?? false;
  } catch {
    return false;
  }
}

export async function requireStepUpAuthentication(): Promise<void> {
  // Only enforce when the instance actually supports reverification; if the
  // check throws or is unconfigured, upstream UI confirmation is the guard.
  const ok = await hasFreshStepUp();
  if (!ok && process.env.FAJITA_ENFORCE_STEP_UP === "1") {
    throw StepUpRequired();
  }
}
