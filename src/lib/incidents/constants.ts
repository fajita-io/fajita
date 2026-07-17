/**
 * Incident engine vocabulary. These constants are the single TypeScript source
 * of truth for the incident domain and mirror the check constraints in
 * supabase/migrations/20260720000000_phase6_incident_schema.sql. Keep the two in
 * sync (the same discipline as the monitor-contracts TS/Go mirror).
 *
 * Three state layers are kept strictly separate:
 *   1. Monitor lifecycle (monitors.status)   -> owned by Phase 4/5
 *   2. Latest check result (check_results.status)
 *   3. Operational incident state (below)
 * Incident lifecycle is separate again from operational state.
 */

export const OPERATIONAL_STATES = [
  "operational",
  "verifying_failure",
  "degraded",
  "down",
  "recovering",
  "maintenance",
  "unknown",
] as const;
export type OperationalState = (typeof OPERATIONAL_STATES)[number];

export const INCIDENT_LIFECYCLE = [
  "open",
  "monitoring",
  "resolved",
  "canceled",
] as const;
export type IncidentLifecycle = (typeof INCIDENT_LIFECYCLE)[number];

export const INCIDENT_ORIGINS = [
  "automatic",
  "manual",
  "maintenance_related",
  "imported",
] as const;
export type IncidentOrigin = (typeof INCIDENT_ORIGINS)[number];

export const SEVERITIES = [
  "minor",
  "major",
  "critical",
  "maintenance",
  "informational",
] as const;
export type Severity = (typeof SEVERITIES)[number];

/** Severities an operator may set by hand (excludes derived-only values). */
export const ASSIGNABLE_SEVERITIES = ["minor", "major", "critical"] as const;

export const MONITOR_CRITICALITY = ["low", "normal", "high", "critical"] as const;
export type MonitorCriticality = (typeof MONITOR_CRITICALITY)[number];

export const UPDATE_TYPES = [
  "investigating",
  "identified",
  "monitoring",
  "resolved",
  "informational",
] as const;
export type UpdateType = (typeof UPDATE_TYPES)[number];

export const UPDATE_VISIBILITY = ["internal", "public_ready"] as const;
export type UpdateVisibility = (typeof UPDATE_VISIBILITY)[number];

export const PUBLIC_VISIBILITY = [
  "internal",
  "status_page_ready",
  "published",
  "hidden",
] as const;
export type PublicVisibility = (typeof PUBLIC_VISIBILITY)[number];

export const SUPPRESSION_POLICIES = [
  "suppress_incidents",
  "annotate_only",
  "do_not_suppress",
] as const;
export type SuppressionPolicy = (typeof SUPPRESSION_POLICIES)[number];

export const MAINTENANCE_STATUS = [
  "scheduled",
  "active",
  "completed",
  "canceled",
] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUS)[number];

/** Result eligibility classes produced by app.result_eligibility. */
export const ELIGIBILITY = ["success", "eligible", "config", "platform", "ignore"] as const;
export type Eligibility = (typeof ELIGIBILITY)[number];

/** The evaluation-logic version. Must match p_evaluation_version defaults in SQL. */
export const EVALUATION_VERSION = 1;

export function isOperationalState(v: string): v is OperationalState {
  return (OPERATIONAL_STATES as readonly string[]).includes(v);
}

export function isSeverity(v: string): v is Severity {
  return (SEVERITIES as readonly string[]).includes(v);
}
