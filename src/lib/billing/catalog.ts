/**
 * Centralized billing catalog: the single source of truth for plan identity,
 * entitlement values, and Stripe mapping. Nothing else in the product may
 * hardcode plan names or limits. Server enforcement, workers, and the UI all
 * read entitlements from here (through the entitlement engine and snapshots).
 *
 * Plan identity uses the approved internal keys `starter` / `pro` / `business`
 * from src/lib/stripe/plans.ts. The provisional "Sizzle / Skillet / Kitchen"
 * names in the phase brief were explicitly rejected in the brand and copy docs
 * (docs/website/public-copy-system.md); this catalog uses the approved matrix,
 * as the brief instructs when one already exists.
 *
 * This module is free of server-only imports so the pricing UI and limit-state
 * components can read the shape directly. Dollar amounts are provisional and
 * internal: public publishing stays gated by src/lib/site/pricing.ts.
 */
import {
  PLANS,
  type BillingInterval,
  type PlanId,
} from "@/lib/stripe/plans";

/**
 * Entitlement version. Bump when the shape or plan values change in a way that
 * should force snapshot recalculation. Stored on every snapshot.
 */
export const ENTITLEMENT_VERSION = 1;

/** Access state the entitlement engine derives from billing state. */
export type BillingAccessState =
  | "none" // no subscription; product is locked to read-only
  | "active" // paid and healthy (or trialing / scheduled cancellation)
  | "grace_period" // payment failed, still within the fair recovery window
  | "restricted" // recovery window elapsed; monitoring paused, data preserved
  | "canceled"; // subscription ended; read-only retention window

/**
 * Typed entitlement values. Only keys with a real enforcement path exist here.
 * `null` on a numeric limit means "no fixed cap" (fair-use), never "infinite".
 */
export interface PlanEntitlements {
  // Monitoring
  monitoring_enabled: boolean;
  max_active_monitors: number | null;
  minimum_check_interval_seconds: number;
  max_assertions_per_monitor: number;
  max_secret_headers_per_monitor: number;
  heartbeat_monitoring_enabled: boolean;
  ssl_monitoring_enabled: boolean;
  monitor_export_enabled: boolean;

  // History retention (days)
  detailed_check_retention_days: number;
  incident_retention_days: number;
  response_time_history_days: number;
  audit_log_retention_days: number;
  delivery_log_retention_days: number;

  // Team
  max_organization_members: number | null;
  max_pending_invitations: number;

  // Alerts
  email_alerts_enabled: boolean;
  slack_alerts_enabled: boolean;
  discord_alerts_enabled: boolean;
  webhook_alerts_enabled: boolean;
  max_alert_channels: number | null;
  max_alert_rules: number | null;

  // Status pages
  max_status_pages: number | null;
  custom_status_domains_enabled: boolean;
  max_custom_status_domains: number;
  status_page_remove_powered_by: boolean;

  // Subscribers
  max_confirmed_subscribers: number | null;
  subscriber_import_enabled: boolean;
  subscriber_export_enabled: boolean;
  subscriber_email_remove_powered_by: boolean;

  // Exports
  organization_export_enabled: boolean;
  billing_export_enabled: boolean;
}

export type EntitlementKey = keyof PlanEntitlements;

/** Provisional internal pricing (minor units, USD). NOT published publicly. */
export interface PlanPricing {
  currency: "usd";
  /** Amount in cents charged per month on the monthly plan. */
  monthlyCents: number;
  /** Amount in cents charged per year on the annual plan. */
  yearlyCents: number;
}

export interface CatalogPlan {
  key: PlanId;
  name: string;
  description: string;
  displayOrder: number;
  /** Stripe Price lookup keys per interval (immutable price mapping). */
  lookupKeys: Record<BillingInterval, string>;
  pricing: PlanPricing;
  entitlements: PlanEntitlements;
}

/**
 * Per-plan entitlement values. Centralized and editable. Limits are semantic,
 * enforced server-side and by workers, and surfaced in the usage UI.
 */
const STARTER_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: true,
  max_active_monitors: 10,
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

const PRO_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: true,
  max_active_monitors: 50,
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

const BUSINESS_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: true,
  max_active_monitors: null,
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

  max_confirmed_subscribers: 10000,
  subscriber_import_enabled: true,
  subscriber_export_enabled: true,
  subscriber_email_remove_powered_by: true,

  organization_export_enabled: true,
  billing_export_enabled: true,
};

/**
 * The locked entitlement set applied when there is no active paid subscription
 * (`none` / `restricted` / `canceled`). Monitoring is off, no resource creation
 * is allowed, but data is never deleted and billing/export stay reachable.
 */
export const LOCKED_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: false,
  max_active_monitors: 0,
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

/**
 * Beta grant applied to organizations that have no subscription while billing
 * is pre-launch. It preserves the pre-billing product behavior (generous but
 * real, server-enforced limits) so existing beta organizations are not locked
 * out before pricing opens. When billing launches (billing feature reaches a
 * customer-available stage), unbilled organizations resolve to LOCKED instead.
 * See `billingLaunched()` in the entitlement engine.
 */
export const BETA_ENTITLEMENTS: PlanEntitlements = {
  monitoring_enabled: true,
  max_active_monitors: 50,
  minimum_check_interval_seconds: 60,
  max_assertions_per_monitor: 50,
  max_secret_headers_per_monitor: 10,
  heartbeat_monitoring_enabled: true,
  ssl_monitoring_enabled: true,
  monitor_export_enabled: true,

  detailed_check_retention_days: 30,
  incident_retention_days: 90,
  response_time_history_days: 30,
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

/**
 * The catalog. Dollar amounts are the approved public list price in USD cents.
 * Marketing reads them through src/lib/site/pricing.ts. Checkout resolves
 * Stripe Prices by lookup key; keep Dashboard prices aligned with these cents.
 */
export const BILLING_CATALOG: Record<PlanId, CatalogPlan> = {
  starter: {
    key: "starter",
    name: PLANS.starter.name,
    description: PLANS.starter.description,
    displayOrder: 1,
    lookupKeys: PLANS.starter.lookupKeys,
    pricing: { currency: "usd", monthlyCents: 900, yearlyCents: 9000 },
    entitlements: STARTER_ENTITLEMENTS,
  },
  pro: {
    key: "pro",
    name: PLANS.pro.name,
    description: PLANS.pro.description,
    displayOrder: 2,
    lookupKeys: PLANS.pro.lookupKeys,
    pricing: { currency: "usd", monthlyCents: 1900, yearlyCents: 19000 },
    entitlements: PRO_ENTITLEMENTS,
  },
  business: {
    key: "business",
    name: PLANS.business.name,
    description: PLANS.business.description,
    displayOrder: 3,
    lookupKeys: PLANS.business.lookupKeys,
    pricing: { currency: "usd", monthlyCents: 3900, yearlyCents: 39000 },
    entitlements: BUSINESS_ENTITLEMENTS,
  },
};

export const CATALOG_PLANS: CatalogPlan[] = Object.values(BILLING_CATALOG).sort(
  (a, b) => a.displayOrder - b.displayOrder,
);

/** Entitlements for a plan key. */
export function entitlementsForPlan(planKey: PlanId): PlanEntitlements {
  return BILLING_CATALOG[planKey].entitlements;
}

/**
 * Resolve the effective entitlement set for a plan and access state. A `none`,
 * `restricted`, or `canceled` state locks the product regardless of plan; only
 * `active` and `grace_period` grant the plan's entitlements. Grace period keeps
 * full entitlements so existing monitoring continues during recovery.
 */
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

/** Provisional recurring monthly value in cents, normalized to a month. */
export function monthlyValueCents(
  planKey: PlanId,
  interval: BillingInterval,
): number {
  const { pricing } = BILLING_CATALOG[planKey];
  return interval === "year"
    ? Math.round(pricing.yearlyCents / 12)
    : pricing.monthlyCents;
}
