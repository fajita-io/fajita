import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { requireActiveContext } from "@/lib/app/page-context";
import { getMonitorDetail } from "@/lib/monitoring/queries";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { can } from "@/lib/auth/roles";
import type { ProfileRow } from "@/lib/auth/provisioning";
import type { OrgRole } from "@/lib/auth/roles";

export interface MonitorPageContext {
  organizationId: string;
  organizationName: string;
  profile: ProfileRow;
  role: OrgRole;
  /** Whether the caller can create/edit/activate monitors. */
  canManage: boolean;
}

/**
 * Server guard for every monitor product page. Re-derives the caller and active
 * organization from the session (never the client), confirms the monitors
 * feature is available to this org (or the caller is a platform admin during
 * development), and returns the resolved context. Pages that are gated but
 * unavailable return a 404 rather than leaking their existence.
 */
export async function requireMonitorPage(): Promise<MonitorPageContext> {
  const { profile, membership } = await requireActiveContext();
  const organizationId = membership.organization.id;

  const [enabled, admin] = await Promise.all([
    isFeatureEnabled("monitors", organizationId),
    isPlatformAdmin(),
  ]);
  if (!enabled && !admin) notFound();

  return {
    organizationId,
    organizationName: membership.organization.name,
    profile,
    role: membership.role,
    canManage: can(membership.role, "monitors:manage"),
  };
}

/**
 * Request-deduplicated monitor detail load. The detail layout and the active
 * tab both need the monitor; `cache` ensures one database round trip per
 * request rather than one per component.
 */
export const loadMonitorDetail = cache(getMonitorDetail);
