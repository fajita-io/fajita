import type { SubscriberEventType } from "./constants";

/**
 * Human-readable, customer-safe labels for subscriber email. These convey
 * status as text (never color alone) and carry no internal vocabulary.
 */

const SEVERITY_LABELS: Record<string, string> = {
  minor: "Minor Service Disruption",
  major: "Major Service Disruption",
  critical: "Critical Service Disruption",
  maintenance: "Scheduled Maintenance",
  informational: "Service Notice",
};

const LIFECYCLE_LABELS: Record<string, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
  open: "Open",
  degraded: "Degraded",
  down: "Down",
};

export function severityLabel(severity: string | null | undefined): string {
  if (!severity) return "Incident";
  return SEVERITY_LABELS[severity] ?? "Incident";
}

export function lifecycleLabel(status: string | null | undefined): string {
  if (!status) return "Update";
  return LIFECYCLE_LABELS[status] ?? "Update";
}

export function eventStatusLabel(
  eventType: SubscriberEventType,
  lifecycleStatus: string | null | undefined,
): string {
  switch (eventType) {
    case "incident_opened":
      return lifecycleLabel(lifecycleStatus) === "Update"
        ? "Investigating"
        : lifecycleLabel(lifecycleStatus);
    case "incident_resolved":
      return "Resolved";
    case "incident_reopened":
      return "Reopened";
    case "maintenance_scheduled":
      return "Scheduled";
    case "maintenance_started":
      return "In progress";
    case "maintenance_completed":
      return "Completed";
    case "maintenance_canceled":
      return "Canceled";
    case "incident_update":
    case "maintenance_updated":
    case "manual_notice":
      return lifecycleLabel(lifecycleStatus);
    default:
      return "Update";
  }
}
