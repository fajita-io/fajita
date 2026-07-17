import "server-only";

import {
  isPlatformAdmin,
  requireAuthenticatedUser,
  requirePlatformAdmin,
  requireStepUpAuthentication,
} from "@/lib/auth/context";
import { Forbidden } from "@/lib/auth/errors";
import type { ProfileRow } from "@/lib/auth/provisioning";
import { platformAdminIds } from "@/lib/env";
import { platformDb } from "./db";
import {
  isPlatformRole,
  platformCan,
  permissionsForRoles,
  type PlatformPermission,
  type PlatformRole,
  type StepUpAction,
} from "./permissions";

export interface PlatformAccess {
  profile: ProfileRow;
  roles: PlatformRole[];
  permissions: Set<PlatformPermission>;
  /** True when access came from PLATFORM_ADMIN_USER_IDS bootstrap. */
  bootstrapOwner: boolean;
}

/**
 * Resolve platform roles for a profile.
 * Bootstrap: allowlisted Clerk ids receive platform_owner.
 * Additional graded roles come from platform_operator_roles.
 */
export async function resolvePlatformRoles(
  profile: ProfileRow,
): Promise<{ roles: PlatformRole[]; bootstrapOwner: boolean }> {
  const bootstrapOwner = platformAdminIds().has(profile.external_id);
  const roles = new Set<PlatformRole>();
  if (bootstrapOwner) roles.add("platform_owner");

  try {
    const db = platformDb();
    const { data } = await db
      .from("platform_operator_roles")
      .select("role")
      .eq("user_id", profile.id)
      .eq("status", "active");
    for (const row of data ?? []) {
      const role = String((row as { role: string }).role);
      if (isPlatformRole(role)) roles.add(role);
    }
  } catch {
    // Table may be absent before migration; bootstrap still works.
  }

  return { roles: [...roles], bootstrapOwner };
}

export async function getPlatformAccess(): Promise<PlatformAccess | null> {
  try {
    const profile = await requireAuthenticatedUser();
    const { roles, bootstrapOwner } = await resolvePlatformRoles(profile);
    if (roles.length === 0) return null;
    return {
      profile,
      roles,
      permissions: permissionsForRoles(roles),
      bootstrapOwner,
    };
  } catch {
    return null;
  }
}

export async function requirePlatformAccess(): Promise<PlatformAccess> {
  const access = await getPlatformAccess();
  if (!access) throw Forbidden();
  return access;
}

export async function requirePlatformPermission(
  permission: PlatformPermission,
): Promise<PlatformAccess> {
  const access = await requirePlatformAccess();
  if (!platformCan(access.roles, permission)) throw Forbidden();
  return access;
}

/**
 * Development convenience: allow local exploration when NODE_ENV is
 * development AND no platform admins are configured. Production requires
 * platform access. Brand Lab may also open when BRAND_LAB_ENABLED=true.
 */
export async function allowInternalPage(): Promise<boolean> {
  if (await isPlatformAdmin()) return true;
  const access = await getPlatformAccess();
  if (access) return true;
  if (process.env.NODE_ENV !== "production" && platformAdminIds().size === 0) {
    return true;
  }
  if (process.env.BRAND_LAB_ENABLED === "true") return true;
  return false;
}

export async function requireStepUpForAction(
  action: StepUpAction,
  opts?: { resourceType?: string; resourceId?: string },
): Promise<PlatformAccess> {
  const access = await requirePlatformAccess();
  await requireStepUpAuthentication();

  try {
    const db = platformDb();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await db.from("platform_step_up_events").insert({
      user_id: access.profile.id,
      action_key: action,
      resource_type: opts?.resourceType ?? null,
      resource_id: opts?.resourceId ?? null,
      expires_at: expires,
    });
  } catch {
    // Recording is best-effort; step-up gate already ran.
  }

  return access;
}

/** Legacy bridge: prefer requirePlatformPermission for new code. */
export { requirePlatformAdmin, isPlatformAdmin };
