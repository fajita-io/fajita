import type { OperationalStatus } from "@/components/design-system/status/status";
import type { BrandIconName } from "@/components/design-system/icons";
import type {
  IncidentOrigin,
  OperationalState,
  Severity,
} from "./constants";

/**
 * Presentation mappers for the incident UI. Pure, usable on server and client.
 * These translate engine vocabulary into the existing status design system so
 * incidents share color and shape language with monitors. State is never
 * communicated by color alone: every badge carries a label.
 */

/** Map an engine operational state onto the shared status badge vocabulary. */
export function operationalToStatus(state: OperationalState): OperationalStatus {
  switch (state) {
    case "verifying_failure":
      return "verifying";
    case "operational":
      return "operational";
    case "degraded":
      return "degraded";
    case "down":
      return "down";
    case "recovering":
      return "recovering";
    case "maintenance":
      return "maintenance";
    default:
      return "unknown";
  }
}

export const SEVERITY_ICON: Record<Severity, BrandIconName> = {
  minor: "warning",
  major: "warning",
  critical: "alert",
  maintenance: "maintenance",
  informational: "overview",
};

export const ORIGIN_LABEL: Record<IncidentOrigin, string> = {
  automatic: "Automatic",
  manual: "Manual",
  maintenance_related: "Maintenance",
  imported: "Imported",
};

/** Lifecycle short label for chips. */
export function lifecycleLabel(status: string): string {
  switch (status) {
    case "open":
      return "Open";
    case "monitoring":
      return "Monitoring";
    case "resolved":
      return "Resolved";
    case "canceled":
      return "Canceled";
    default:
      return status;
  }
}

/** Whether a lifecycle status is still active (open or monitoring). */
export function isActiveLifecycle(status: string): boolean {
  return status === "open" || status === "monitoring";
}
