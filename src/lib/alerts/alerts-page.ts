import "server-only";

import { notFound } from "next/navigation";

import { requireActiveContext } from "@/lib/app/page-context";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { can } from "@/lib/auth/roles";
import type { ProfileRow } from "@/lib/auth/provisioning";
import type { OrgRole } from "@/lib/auth/roles";

export interface AlertsPageContext {
  organizationId: string;
  organizationName: string;
  timezone: string;
  profile: ProfileRow;
  role: OrgRole;
  /** Can create, test, edit, pause, and delete channels and rules. */
  canManageAlerts: boolean;
  isPlatformAdmin: boolean;
}

/**
 * Server guard for alert-configuration pages. Confirms the integrations feature
 * is available for this org (or the caller is a platform admin during private
 * beta) and resolves permissions. Gated-but-unavailable routes 404 so no
 * half-built surface leaks.
 */
export async function requireAlertsPage(): Promise<AlertsPageContext> {
  const { profile, membership } = await requireActiveContext();
  const organizationId = membership.organization.id;

  const [enabled, admin] = await Promise.all([
    isFeatureEnabled("integrations", organizationId),
    isPlatformAdmin(),
  ]);
  if (!enabled && !admin) notFound();

  return {
    organizationId,
    organizationName: membership.organization.name,
    timezone: membership.organization.default_timezone ?? "UTC",
    profile,
    role: membership.role,
    canManageAlerts: can(membership.role, "integrations:manage"),
    isPlatformAdmin: admin,
  };
}
