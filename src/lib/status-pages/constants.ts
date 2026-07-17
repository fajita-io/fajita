/**
 * Vocabulary for the public status-page product. This file is the single
 * source of truth for public state names, their human labels, and the mapping
 * from Fajita's internal operational states to the deliberately smaller public
 * allowlist. Client-safe (no server imports) so both the renderer and the
 * management UI import the same definitions.
 *
 * Public copy uses conventional, customer-facing language. Internal engine
 * vocabulary (verifying_failure, lease state, worker region, ...) is never
 * exposed. See docs/security/status-page-public-private-boundary.md.
 */

/** Lifecycle of a status page record. */
export const STATUS_PAGE_STATUSES = [
  "draft",
  "publishing",
  "published",
  "unpublished",
  "suspended",
  "pending_deletion",
  "deleted",
] as const;
export type StatusPageStatus = (typeof STATUS_PAGE_STATUSES)[number];

export const STATUS_PAGE_VISIBILITIES = [
  "public",
  "password_protected",
  "private_link",
  "organization_only",
] as const;
export type StatusPageVisibility = (typeof STATUS_PAGE_VISIBILITIES)[number];

/** Public per-component states. Deliberately small and unambiguous. */
export const PUBLIC_COMPONENT_STATES = [
  "operational",
  "degraded_performance",
  "partial_outage",
  "major_outage",
  "under_maintenance",
] as const;
export type PublicComponentState = (typeof PUBLIC_COMPONENT_STATES)[number];

/** Overall page states. */
export const OVERALL_STATES = [
  "operational",
  "degraded",
  "partial_outage",
  "major_outage",
  "maintenance",
] as const;
export type OverallState = (typeof OVERALL_STATES)[number];

/** Component calculation modes. Explicit modes, never a formula language. */
export const COMPONENT_CALCULATION_MODES = [
  "any_critical",
  "majority",
  "primary",
  "manual",
] as const;
export type ComponentCalculationMode =
  (typeof COMPONENT_CALCULATION_MODES)[number];

/** Fajita internal operational states (from the Phase 6 engine). */
export type InternalOperationalState =
  | "operational"
  | "verifying_failure"
  | "degraded"
  | "down"
  | "recovering"
  | "maintenance"
  | "unknown";

export const STATUS_PAGE_THEMES = [
  "signal",
  "ember",
  "paper",
  "midnight",
] as const;
export type StatusPageTheme = (typeof STATUS_PAGE_THEMES)[number];

export const INCIDENT_HISTORY_WINDOWS = [
  "seven_days",
  "thirty_days",
  "ninety_days",
  "twelve_months",
  "full",
] as const;
export type IncidentHistoryWindow = (typeof INCIDENT_HISTORY_WINDOWS)[number];

export const AUTO_PUBLISH_MODES = [
  "never",
  "draft_only",
  "major_critical",
  "all",
] as const;
export type AutoPublishMode = (typeof AUTO_PUBLISH_MODES)[number];

/** Public label for a component state. Always paired with a non-color glyph. */
export const COMPONENT_STATE_LABEL: Record<PublicComponentState, string> = {
  operational: "Operational",
  degraded_performance: "Degraded Performance",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  under_maintenance: "Under Maintenance",
};

/** Public label for an overall page state. */
export const OVERALL_STATE_LABEL: Record<OverallState, string> = {
  operational: "All Systems Operational",
  degraded: "Degraded Performance",
  partial_outage: "Partial System Disruption",
  major_outage: "Major Service Disruption",
  maintenance: "Under Maintenance",
};

/**
 * Reserved subdomain labels. A customer may not claim these as a hosted
 * subdomain. Includes platform routes, brand terms, and impersonation risks.
 */
export const RESERVED_SUBDOMAINS = new Set<string>([
  "www",
  "app",
  "api",
  "admin",
  "administrator",
  "support",
  "status",
  "billing",
  "login",
  "signin",
  "signup",
  "register",
  "security",
  "fajita",
  "fajitaio",
  "fajita-io",
  "mail",
  "email",
  "smtp",
  "internal",
  "staging",
  "dev",
  "test",
  "assets",
  "cdn",
  "static",
  "docs",
  "help",
  "blog",
  "dashboard",
  "account",
  "accounts",
  "auth",
  "webhook",
  "webhooks",
  "console",
  "root",
  "system",
]);
