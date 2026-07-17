import { CHECK_INTERVALS_SECONDS } from "@contracts/contract";

/**
 * Centralized monitor entitlements. This is the single source of truth for what
 * an organization is allowed to do with monitors. Billing is not live yet, so
 * every organization resolves to the default workspace entitlement below. When
 * Stripe plans arrive, `resolveEntitlements` (server side) will read the plan
 * and return the same shape; nothing else in the product needs to change.
 *
 * The values are semantic, never marketing plan names. Engine logic and the UI
 * both read from here so limits can never drift between surfaces.
 *
 * This module is intentionally free of server-only imports so the wizard and
 * limit-state components can import the shape and the interval helper directly.
 */

export interface MonitorEntitlements {
  /** Maximum monitors (draft + active + paused) an org may keep. */
  maxMonitors: number;
  /** Fastest allowed check interval in seconds. Slower intervals are always allowed. */
  minimumCheckIntervalSeconds: number;
  /** How many days of detailed check results are retained and shown. */
  resultRetentionDays: number;
  /** Maximum assertions attached to a single monitor version. */
  maxAssertionsPerMonitor: number;
  /** Maximum encrypted secret headers on a single monitor. */
  maxSecretHeadersPerMonitor: number;
  /** Whether heartbeat / cron monitors are available. */
  heartbeatEnabled: boolean;
  /** Whether data export is available. */
  exportEnabled: boolean;
  /** Whether the org may choose a specific region policy (multi-region readiness). */
  regionChoiceEnabled: boolean;
}

/**
 * Default entitlement while billing is not live. Deliberately generous so the
 * product is fully usable, but every limit is real and enforced server-side so
 * the enforcement path is proven before plans exist.
 */
export const DEFAULT_ENTITLEMENTS: MonitorEntitlements = {
  maxMonitors: 50,
  minimumCheckIntervalSeconds: 60,
  resultRetentionDays: 30,
  maxAssertionsPerMonitor: 50,
  maxSecretHeadersPerMonitor: 10,
  heartbeatEnabled: true,
  exportEnabled: true,
  regionChoiceEnabled: false,
};

/** The check intervals available to an org, coarsest-first for menus. */
export function availableIntervals(
  ent: MonitorEntitlements = DEFAULT_ENTITLEMENTS,
): number[] {
  return CHECK_INTERVALS_SECONDS.filter(
    (s) => s >= ent.minimumCheckIntervalSeconds,
  );
}

/** Human interval label, e.g. "Every 5 minutes". No abbreviations. */
export function intervalLabel(seconds: number): string {
  if (seconds < 60) return `Every ${seconds} seconds`;
  if (seconds === 60) return "Every minute";
  const minutes = seconds / 60;
  if (minutes < 60) return `Every ${minutes} minutes`;
  const hours = minutes / 60;
  return hours === 1 ? "Every hour" : `Every ${hours} hours`;
}

/** A restriction the UI can explain truthfully before any plan exists. */
export type EntitlementLimit =
  | "max_monitors"
  | "minimum_check_interval_seconds"
  | "result_retention_days"
  | "max_assertions_per_monitor"
  | "max_secret_headers_per_monitor"
  | "heartbeat_enabled"
  | "export_enabled";
