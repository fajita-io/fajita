import "server-only";

import { Forbidden } from "@/lib/auth/errors";
import { getOrgEntitlements } from "@/lib/billing/engine";
import type { PlanEntitlements } from "@/lib/billing/catalog";
import { ALERT_PROVIDERS, type AlertProvider } from "@/lib/alerts/constants";

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

export function providerAlertsEnabled(
  entitlements: PlanEntitlements,
  provider: AlertProvider,
): boolean {
  switch (provider) {
    case "email":
      return entitlements.email_alerts_enabled;
    case "slack":
      return entitlements.slack_alerts_enabled;
    case "discord":
      return entitlements.discord_alerts_enabled;
    case "webhook":
      return entitlements.webhook_alerts_enabled;
  }
}

export function enabledAlertProviders(entitlements: PlanEntitlements): AlertProvider[] {
  return ALERT_PROVIDERS.filter((provider) => providerAlertsEnabled(entitlements, provider));
}

export function providerPlanMessage(provider: AlertProvider): string {
  if (provider === "email") return "Email alerts are unavailable on your current plan.";
  const label = provider === "slack" ? "Slack" : provider === "discord" ? "Discord" : "Webhook";
  return `${label} alerts are on Team and Scale.`;
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

export async function requireProviderAlertsEntitlement(
  organizationId: string,
  provider: AlertProvider,
): Promise<PlanEntitlements> {
  const entitlements = await requireAlertsEntitlement(organizationId);
  if (!providerAlertsEnabled(entitlements, provider)) {
    throw Forbidden(providerPlanMessage(provider));
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
