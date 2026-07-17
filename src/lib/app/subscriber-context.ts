import "server-only";

import { notFound } from "next/navigation";

import { requireStatusPage, type StatusPageDetailContext } from "@/lib/app/status-page-context";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { can } from "@/lib/auth/roles";

export interface SubscriberContext extends StatusPageDetailContext {
  canReadSummary: boolean;
  canReadSensitive: boolean;
  canManageSubscribers: boolean;
  canSuppress: boolean;
  canDelete: boolean;
  canImport: boolean;
  canExport: boolean;
  canReadDeliveries: boolean;
  canManageSettings: boolean;
}

/**
 * Guard for the subscriber product area of a status page. Requires the
 * status-page guard to pass first (auth, org membership, page ownership), then
 * checks the statusSubscribers feature (or platform admin during private beta)
 * and resolves the split subscriber permissions. A member with only
 * read_summary sees counts and delivery health, never addresses.
 */
export async function requireSubscriberContext(
  statusPageId: string,
): Promise<SubscriberContext> {
  const ctx = await requireStatusPage(statusPageId);

  const enabled = await isFeatureEnabled("statusSubscribers", ctx.organizationId);
  if (!enabled && !ctx.isPlatformAdmin) notFound();

  const role = ctx.role;
  const canReadSummary = can(role, "subscribers:read_summary");
  // No subscriber access at all: treat like the feature is hidden.
  if (!canReadSummary && !ctx.isPlatformAdmin) notFound();

  return {
    ...ctx,
    canReadSummary,
    canReadSensitive: can(role, "subscribers:read_sensitive"),
    canManageSubscribers: can(role, "subscribers:manage"),
    canSuppress: can(role, "subscribers:suppress"),
    canDelete: can(role, "subscribers:delete"),
    canImport: can(role, "subscribers:import"),
    canExport: can(role, "subscribers:export"),
    canReadDeliveries: can(role, "subscribers:delivery_read"),
    canManageSettings: can(role, "subscribers:settings_manage"),
  };
}
