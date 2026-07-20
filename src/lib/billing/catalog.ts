/**
 * Centralized billing catalog: the single source of truth for plan identity,
 * entitlement values, and Stripe mapping. Nothing else in the product may
 * hardcode plan names or limits. Server enforcement, workers, and the UI all
 * read entitlements from here (through the entitlement engine and snapshots).
 *
 * Plan identity uses internal keys `starter` / `pro` / `business` (Stripe
 * lookup keys unchanged). Customer-facing names are Core, Team, and Scale.
 *
 * Pricing is check-volume based. Each plan includes a monthly check allowance
 * aligned with target gross margins (75–85%). See check-volume.ts for overage
 * and volume tier helpers.
 */
import {
  PLANS,
  type BillingInterval,
  type PlanId,
} from "@/lib/stripe/plans";

import { CHECK_OVERAGE_PER_100K_CENTS } from "./check-volume";

/**
 * Entitlement version. Bump when the shape or plan values change in a way that
 * should force snapshot recalculation. Stored on every snapshot.
 */
export const ENTITLEMENT_VERSION = 2;

/** Access state the entitlement engine derives from billing state. */
export type BillingAccessState =
  | "none"
  | "active"
  | "grace_period"
  | "restricted"
  | "canceled";

export interface PlanEntitlements {
  monitoring_enabled: boolean;
  max_active_monitors: number | null;
  /** Included checks per billing period (primary usage meter). */
  max_monthly_checks: number;
  minimum_check_interval_seconds: number;
  max_assertions_per_monitor: number;
  max_secret_headers_per_monitor: number;
  heartbeat_monitoring_enabled: boolean;
  ssl_monitoring_enabled: boolean;
  monitor_export_enabled: boolean;

  detailed_check_retention_days: number;
  incident_retention_days: number;
  response_time_history_days: number;
  audit_log_retention_days: number;
  delivery_log_retention_days: number;

  max_organization_members: number | null;
  max_pending_invitations: number;

  email_alerts_enabled: boolean;
  slack_alerts_enabled: boolean;
  discord_alerts_enabled: boolean;
  webhook_alerts_enabled: boolean;
  max_alert_channels: number | null;
  max_alert_rules: number | null;

  max_status_pages: number | null;
  custom_status_domains_enabled: boolean;
  max_custom_status_domains: number;
  status_page_remove_powered_by: boolean;

  max_confirmed_subscribers: number | null;
  subscriber_import_enabled: boolean;
  subscriber_export_enabled: boolean;
  subscriber_email_remove_powered_by: boolean;

  organization_export_enabled: boolean;
  billing_export_enabled: boolean;
}

export type EntitlementKey = keyof PlanEntitlements;

export interface PlanPricing {
  currency: "usd";
  monthlyCents: number;
  yearlyCents: number;
  /** Overage beyond max_monthly_checks, per 100K checks. */
  overagePer100kChecksCents: number;
}

export interface CatalogPlan {
  key: PlanId;
  name: string;
  description: string;
  displayOrder: number;
  lookupKeys: Record<BillingInterval, string>;
  pricing: PlanPricing;
  entitlements: PlanEntitlements;
}

const CORE_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: true,
  max_active_monitors: 10,
  max_monthly_checks: 100_000,
  minimum_check_interval_seconds: 300,
  max_assertions_per_monitor: 10,
  max_secret_headers_per_monitor: 5,
  heartbeat_monitoring_enabled: true,
  ssl_monitoring_enabled: true,
  monitor_export_enabled: false,

  detailed_check_retention_days: 30,
  incident_retention_days: 30,
  response_time_history_days: 30,
  audit_log_retention_days: 30,
  delivery_log_retention_days: 30,

  max_organization_members: 1,
  max_pending_invitations: 0,

  email_alerts_enabled: true,
  slack_alerts_enabled: false,
  discord_alerts_enabled: false,
  webhook_alerts_enabled: false,
  max_alert_channels: 1,
  max_alert_rules: 3,

  max_status_pages: 1,
  custom_status_domains_enabled: false,
  max_custom_status_domains: 0,
  status_page_remove_powered_by: false,

  max_confirmed_subscribers: 100,
  subscriber_import_enabled: false,
  subscriber_export_enabled: false,
  subscriber_email_remove_powered_by: false,

  organization_export_enabled: false,
  billing_export_enabled: true,
};

const TEAM_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: true,
  max_active_monitors: 50,
  max_monthly_checks: 500_000,
  minimum_check_interval_seconds: 60,
  max_assertions_per_monitor: 25,
  max_secret_headers_per_monitor: 10,
  heartbeat_monitoring_enabled: true,
  ssl_monitoring_enabled: true,
  monitor_export_enabled: true,

  detailed_check_retention_days: 90,
  incident_retention_days: 365,
  response_time_history_days: 90,
  audit_log_retention_days: 90,
  delivery_log_retention_days: 90,

  max_organization_members: 5,
  max_pending_invitations: 10,

  email_alerts_enabled: true,
  slack_alerts_enabled: true,
  discord_alerts_enabled: true,
  webhook_alerts_enabled: true,
  max_alert_channels: 10,
  max_alert_rules: 25,

  max_status_pages: 3,
  custom_status_domains_enabled: true,
  max_custom_status_domains: 3,
  status_page_remove_powered_by: false,

  max_confirmed_subscribers: 2500,
  subscriber_import_enabled: true,
  subscriber_export_enabled: true,
  subscriber_email_remove_powered_by: false,

  organization_export_enabled: true,
  billing_export_enabled: true,
};

const SCALE_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: true,
  max_active_monitors: 150,
  max_monthly_checks: 2_000_000,
  minimum_check_interval_seconds: 60,
  max_assertions_per_monitor: 50,
  max_secret_headers_per_monitor: 20,
  heartbeat_monitoring_enabled: true,
  ssl_monitoring_enabled: true,
  monitor_export_enabled: true,

  detailed_check_retention_days: 365,
  incident_retention_days: 730,
  response_time_history_days: 365,
  audit_log_retention_days: 365,
  delivery_log_retention_days: 180,

  max_organization_members: 15,
  max_pending_invitations: 30,

  email_alerts_enabled: true,
  slack_alerts_enabled: true,
  discord_alerts_enabled: true,
  webhook_alerts_enabled: true,
  max_alert_channels: 25,
  max_alert_rules: 100,

  max_status_pages: 10,
  custom_status_domains_enabled: true,
  max_custom_status_domains: 10,
  status_page_remove_powered_by: true,

  max_confirmed_subscribers: 10_000,
  subscriber_import_enabled: true,
  subscriber_export_enabled: true,
  subscriber_email_remove_powered_by: true,

  organization_export_enabled: true,
  billing_export_enabled: true,
};

export const LOCKED_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: false,
  max_active_monitors: 0,
  max_monthly_checks: 0,
  minimum_check_interval_seconds: 300,
  max_assertions_per_monitor: 0,
  max_secret_headers_per_monitor: 0,
  heartbeat_monitoring_enabled: false,
  ssl_monitoring_enabled: false,
  monitor_export_enabled: false,

  detailed_check_retention_days: 30,
  incident_retention_days: 30,
  response_time_history_days: 30,
  audit_log_retention_days: 30,
  delivery_log_retention_days: 30,

  max_organization_members: 1,
  max_pending_invitations: 0,

  email_alerts_enabled: false,
  slack_alerts_enabled: false,
  discord_alerts_enabled: false,
  webhook_alerts_enabled: false,
  max_alert_channels: 0,
  max_alert_rules: 0,

  max_status_pages: 0,
  custom_status_domains_enabled: false,
  max_custom_status_domains: 0,
  status_page_remove_powered_by: false,

  max_confirmed_subscribers: 0,
  subscriber_import_enabled: false,
  subscriber_export_enabled: false,
  subscriber_email_remove_powered_by: false,

  organization_export_enabled: true,
  billing_export_enabled: true,
};

export const BETA_ENTITLEMENTS: PlanEntitlements = {
  ...TEAM_ENTITLEMENTS,
  detailed_check_retention_days: 30,
  response_time_history_days: 30,
  status_page_remove_powered_by: false,
};

const sharedPricing = {
  currency: "usd" as const,
  overagePer100kChecksCents: CHECK_OVERAGE_PER_100K_CENTS,
};

/**
 * List prices target 75–85% gross margin at typical usage. Annual = 10 months
 * (two months free). Stripe lookup keys unchanged for existing products.
 */
export const BILLING_CATALOG: Record<PlanId, CatalogPlan> = {
  starter: {
    key: "starter",
    name: PLANS.starter.name,
    description: PLANS.starter.description,
    displayOrder: 1,
    lookupKeys: PLANS.starter.lookupKeys,
    pricing: {
      ...sharedPricing,
      monthlyCents: 1200,
      yearlyCents: 12000,
    },
    entitlements: CORE_ENTITLEMENTS,
  },
  pro: {
    key: "pro",
    name: PLANS.pro.name,
    description: PLANS.pro.description,
    displayOrder: 2,
    lookupKeys: PLANS.pro.lookupKeys,
    pricing: {
      ...sharedPricing,
      monthlyCents: 4900,
      yearlyCents: 49000,
    },
    entitlements: TEAM_ENTITLEMENTS,
  },
  business: {
    key: "business",
    name: PLANS.business.name,
    description: PLANS.business.description,
    displayOrder: 3,
    lookupKeys: PLANS.business.lookupKeys,
    pricing: {
      ...sharedPricing,
      monthlyCents: 9900,
      yearlyCents: 99000,
    },
    entitlements: SCALE_ENTITLEMENTS,
  },
};

export const CATALOG_PLANS: CatalogPlan[] = Object.values(BILLING_CATALOG).sort(
  (a, b) => a.displayOrder - b.displayOrder,
);

export function entitlementsForPlan(planKey: PlanId): PlanEntitlements {
  return BILLING_CATALOG[planKey].entitlements;
}

export function effectiveEntitlements(
  planKey: PlanId | null,
  access: BillingAccessState,
): PlanEntitlements {
  if (!planKey) return LOCKED_ENTITLEMENTS;
  if (access === "active" || access === "grace_period") {
    return entitlementsForPlan(planKey);
  }
  return LOCKED_ENTITLEMENTS;
}

export function monthlyValueCents(
  planKey: PlanId,
  interval: BillingInterval,
): number {
  const { pricing } = BILLING_CATALOG[planKey];
  return interval === "year"
    ? Math.round(pricing.yearlyCents / 12)
    : pricing.monthlyCents;
}

/** Checks included for a plan (convenience for UI). */
export function checksIncludedForPlan(planKey: PlanId): number {
  return BILLING_CATALOG[planKey].entitlements.max_monthly_checks;
}
