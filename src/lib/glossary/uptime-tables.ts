/**
 * Programmatic uptime downtime examples. Never hard-code unverified values.
 */

const SECONDS_PER_DAY = 24 * 60 * 60;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365.25;

function formatDuration(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds);
  const days = Math.floor(seconds / SECONDS_PER_DAY);
  const hours = Math.floor((seconds % SECONDS_PER_DAY) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (secs > 0 && days === 0) {
    parts.push(`${secs} second${secs === 1 ? "" : "s"}`);
  }
  return parts.join(" ") || "0 seconds";
}

export interface UptimeRow {
  uptimeLabel: string;
  /** Decimal fraction, e.g. 0.999 for 99.9%. */
  uptimeFraction: number;
  monthDowntime: string;
  yearDowntime: string;
}

const TARGETS = [
  { label: "99%", fraction: 0.99 },
  { label: "99.9%", fraction: 0.999 },
  { label: "99.95%", fraction: 0.9995 },
  { label: "99.99%", fraction: 0.9999 },
];

/** Approximate downtime for common uptime targets. Month uses 30 days. */
export function uptimeDowntimeRows(): UptimeRow[] {
  const monthSeconds = DAYS_PER_MONTH * SECONDS_PER_DAY;
  const yearSeconds = DAYS_PER_YEAR * SECONDS_PER_DAY;
  return TARGETS.map(({ label, fraction }) => ({
    uptimeLabel: label,
    uptimeFraction: fraction,
    monthDowntime: formatDuration(monthSeconds * (1 - fraction)),
    yearDowntime: formatDuration(yearSeconds * (1 - fraction)),
  }));
}

export function uptimeTableForBlocks(): {
  headers: string[];
  rows: string[][];
  caption: string;
} {
  const rows = uptimeDowntimeRows().map((r) => [
    r.uptimeLabel,
    r.monthDowntime,
    r.yearDowntime,
  ]);
  return {
    headers: [
      "Uptime",
      "Approx. downtime per 30-day month",
      "Approx. downtime per year",
    ],
    rows,
    caption:
      "Approximate downtime for common uptime targets. Exact values change with month length and leap years.",
  };
}
