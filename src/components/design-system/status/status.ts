export type OperationalStatus =
  | "operational"
  | "degraded"
  | "verifying"
  | "down"
  | "maintenance"
  | "paused"
  | "unknown"
  | "recovering";

export interface StatusSpec {
  label: string;
  /** Semantic tokens; never hardcode colors for status. */
  text: string;
  bold: string;
  soft: string;
}

export const statusSpecs: Record<OperationalStatus, StatusSpec> = {
  operational: {
    label: "Operational",
    text: "var(--color-status-operational)",
    bold: "var(--color-status-operational-bold)",
    soft: "var(--color-status-operational-soft)",
  },
  degraded: {
    label: "Degraded",
    text: "var(--color-status-degraded)",
    bold: "var(--color-status-degraded-bold)",
    soft: "var(--color-status-degraded-soft)",
  },
  verifying: {
    label: "Verifying",
    text: "var(--color-status-verifying)",
    bold: "var(--color-status-verifying-bold)",
    soft: "var(--color-status-verifying-soft)",
  },
  down: {
    label: "Down",
    text: "var(--color-status-down)",
    bold: "var(--color-status-down-bold)",
    soft: "var(--color-status-down-soft)",
  },
  maintenance: {
    label: "Maintenance",
    text: "var(--color-status-maintenance)",
    bold: "var(--color-status-maintenance-bold)",
    soft: "var(--color-status-maintenance-soft)",
  },
  paused: {
    label: "Paused",
    text: "var(--color-status-paused)",
    bold: "var(--color-status-paused-bold)",
    soft: "var(--color-status-paused-soft)",
  },
  unknown: {
    label: "Unknown",
    text: "var(--color-status-unknown)",
    bold: "var(--color-status-unknown-bold)",
    soft: "var(--color-status-unknown-soft)",
  },
  recovering: {
    label: "Recovering",
    text: "var(--color-status-recovering)",
    bold: "var(--color-status-recovering-bold)",
    soft: "var(--color-status-recovering-soft)",
  },
};
