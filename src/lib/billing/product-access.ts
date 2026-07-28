import "server-only";

import { Forbidden } from "@/lib/auth/errors";
import { getOrgEntitlements } from "@/lib/billing/engine";
import type { PlanEntitlements } from "@/lib/billing/catalog";

export function alertsAvailable(entitlements: PlanEntitlements): boolean {
  if ((entitlements.max_alert_channels ?? 0) <= 0) return false;
  return (
    entitlements.email_alerts_enabled ||
    entitlements.slack_alerts_enabled ||
    entitlements.discord_alerts_enabled ||
    entitlements.webhook_alerts_enabled
  );
}

export function statusPagesAvailable(entitlements: PlanEntitlements): boolean {
  return (entitlements.max_status_pages ?? 0) > 0;
}

export async function requireAlertsEntitlement(
  organizationId: string,
): Promise<PlanEntitlements> {
  const entitlements = await getOrgEntitlements(organizationId);
  if (!alertsAvailable(entitlements)) {
    throw Forbidden("Alert channels are unavailable on your current plan.");
  }
  return entitlements;
}

export async function requireStatusPagesEntitlement(
  organizationId: string,
): Promise<PlanEntitlements> {
  const entitlements = await getOrgEntitlements(organizationId);
  if (!statusPagesAvailable(entitlements)) {
    throw Forbidden("Status pages are unavailable on your current plan.");
  }
  return entitlements;
}
