import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { requireActiveContext } from "@/lib/app/page-context";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { can } from "@/lib/auth/roles";
import { getIncidentDetail } from "@/lib/incidents/queries";
import type { ProfileRow } from "@/lib/auth/provisioning";
import type { OrgRole } from "@/lib/auth/roles";

export interface IncidentPageContext {
  organizationId: string;
  organizationName: string;
  timezone: string;
  profile: ProfileRow;
  role: OrgRole;
  /** Can operate incidents (create, ack, assign, note, update, resolve). */
  canManageIncidents: boolean;
  /** Can schedule and cancel maintenance windows. */
  canManageMaintenance: boolean;
  isPlatformAdmin: boolean;
}

/**
 * Server guard for incident and maintenance product pages. Re-derives the
 * caller and active org from the session, confirms the incidents feature is
 * available (or the caller is a platform admin during private beta), and
 * returns the resolved context. Gated-but-unavailable routes return 404.
 */
export async function requireIncidentPage(
  feature: "incidents" | "maintenance" = "incidents",
): Promise<IncidentPageContext> {
  const { profile, membership } = await requireActiveContext();
  const organizationId = membership.organization.id;

  const [enabled, admin] = await Promise.all([
    isFeatureEnabled(feature, organizationId),
    isPlatformAdmin(),
  ]);
  if (!enabled && !admin) notFound();

  return {
    organizationId,
    organizationName: membership.organization.name,
    timezone: membership.organization.default_timezone ?? "UTC",
    profile,
    role: membership.role,
    canManageIncidents: can(membership.role, "incidents:manage"),
    canManageMaintenance: can(membership.role, "maintenance:manage"),
    isPlatformAdmin: admin,
  };
}

export const loadIncidentDetail = cache(getIncidentDetail);
