/**
 * Central incident copy. Customer-facing incident text must be specific, calm,
 * technically accurate, free of blame, free of jokes during serious failures,
 * and free of em dashes. No internal phase numbers, no raw implementation
 * detail, no secrets, no full URLs. See voice-and-boundaries and draper rules.
 */

import type { OperationalState, Severity, UpdateType } from "./constants";

export const OPERATIONAL_STATE_LABEL: Record<OperationalState, string> = {
  operational: "Operational",
  verifying_failure: "Verifying",
  degraded: "Degraded",
  down: "Down",
  recovering: "Recovering",
  maintenance: "Under maintenance",
  unknown: "Unknown",
};

/** Plain-language explanation of each operational state for customers. */
export const OPERATIONAL_STATE_COPY: Record<OperationalState, string> = {
  operational: "The service is passing its checks.",
  verifying_failure:
    "Fajita is checking whether this failure is temporary or persistent.",
  degraded: "The service is responding, but one or more required checks are failing.",
  down: "Fajita confirmed that the service is unavailable or failing critical checks.",
  recovering:
    "The service is responding again. Fajita is confirming that the recovery is stable.",
  maintenance:
    "Monitoring continues during this maintenance window, but expected failures will not open a new incident.",
  unknown:
    "Fajita could not confirm the state of this service. This may be a temporary platform condition, not a customer outage.",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
  maintenance: "Maintenance",
  informational: "Informational",
};

export const SEVERITY_COPY: Record<Severity, string> = {
  minor: "Limited impact or moderate degradation.",
  major: "Significant customer impact or an important service unavailable.",
  critical: "Broad outage, core service unavailable, or severe operational impact.",
  maintenance: "Planned maintenance.",
  informational: "For awareness only.",
};

export const UPDATE_TYPE_LABEL: Record<UpdateType, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
  informational: "Update",
};

/** Shown when a public-ready update is saved. Do not imply customers were notified. */
export const PUBLIC_UPDATE_SAVED_NOTICE =
  "Saved for your status page. No external message has been sent.";

/** Shown when a public summary is saved but not yet published. */
export const STATUS_PAGE_SUMMARY_SAVED_NOTICE =
  "Saved for your status page. Nothing is published yet.";

export const DELIVERY_PENDING_NOTICE =
  "Alert delivery is unavailable on your current plan. This event is recorded for your timeline.";

/** Human label for a timeline event type. Unknown types fall back to the raw. */
const EVENT_TITLES: Record<string, string> = {
  "incident.opened": "Incident opened",
  "incident.reopened": "Incident reopened",
  "incident.resolved": "Incident resolved",
  "incident.canceled": "Incident canceled",
  "incident.acknowledged": "Acknowledged",
  "incident.unacknowledged": "Acknowledgment removed",
  "incident.assigned": "Assigned",
  "incident.severity_changed": "Severity changed",
  "incident.update_added": "Update added",
  "incident.note_added": "Internal note added",
  "incident.monitor_attached": "Monitor attached",
  "incident.monitor_removed": "Monitor removed",
  "monitor.recovery_started": "Recovery started",
  "monitor.recovery_interrupted": "Recovery interrupted",
  "monitor.flapping_started": "Flapping detected",
  "monitor.flapping_stabilized": "Flapping stabilized",
  "maintenance.started": "Maintenance started",
  "maintenance.ended": "Maintenance ended",
};

export function eventTitle(eventType: string, fallback?: string): string {
  return EVENT_TITLES[eventType] ?? fallback ?? eventType;
}
