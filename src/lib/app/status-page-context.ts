import "server-only";

import { notFound } from "next/navigation";

import { requireActiveContext } from "@/lib/app/page-context";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { can } from "@/lib/auth/roles";
import type { ProfileRow } from "@/lib/auth/provisioning";
import type { OrgRole } from "@/lib/auth/roles";
import { getStatusPage, type StatusPageRecord } from "@/lib/status-pages/status-pages";

export interface StatusPageListContext {
  organizationId: string;
  organizationName: string;
  timezone: string;
  profile: ProfileRow;
  role: OrgRole;
  canManage: boolean;
  canPublish: boolean;
  isPlatformAdmin: boolean;
}

/**
 * Server guard for the status-page product area. Re-derives the caller and
 * active org from the session, confirms the feature is available (or the caller
 * is a platform admin during private beta), and returns resolved permissions.
 */
export async function requireStatusPageContext(): Promise<StatusPageListContext> {
  const { profile, membership } = await requireActiveContext();
  const organizationId = membership.organization.id;

  const [enabled, admin] = await Promise.all([
    isFeatureEnabled("statusPages", organizationId),
    isPlatformAdmin(),
  ]);
  if (!enabled && !admin) notFound();

  return {
    organizationId,
    organizationName: membership.organization.name,
    timezone: membership.organization.default_timezone ?? "UTC",
    profile,
    role: membership.role,
    canManage: can(membership.role, "status_pages:manage"),
    canPublish: can(membership.role, "status_pages:publish"),
    isPlatformAdmin: admin,
  };
}

export interface StatusPageDetailContext extends StatusPageListContext {
  statusPage: StatusPageRecord;
}

/** Guard for a single status page. 404 when it does not belong to the org. */
export async function requireStatusPage(
  statusPageId: string,
): Promise<StatusPageDetailContext> {
  const ctx = await requireStatusPageContext();
  const statusPage = await getStatusPage(ctx.organizationId, statusPageId);
  if (!statusPage) notFound();
  return { ...ctx, statusPage };
}
