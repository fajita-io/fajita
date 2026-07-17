import type { CSSProperties } from "react";

import { statusSpecs, type OperationalStatus } from "./status/status";

export interface UptimeDay {
  /** ISO date, for the accessible table alternative. */
  date: string;
  status: OperationalStatus;
}

export interface UptimeChartProps {
  days: UptimeDay[];
  /** e.g. "api.acme.dev · last 90 days" */
  label: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The 90-day uptime bar strip used on status pages and dashboards.
 * Color is backed by a visually hidden per-day text alternative, so the
 * chart is never color-only. Bars use status -bold tokens.
 */
export function UptimeChart({ days, label, className, style }: UptimeChartProps) {
  const barWidth = 100 / days.length;
  return (
    <div className={className} style={style}>
      <svg
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "2.5rem" }}
        aria-hidden
      >
        {days.map((d, i) => (
          <rect
            key={d.date}
            x={i * barWidth + barWidth * 0.12}
            y="0"
            width={barWidth * 0.76}
            height="12"
            rx="0.6"
            fill={statusSpecs[d.status].bold}
            className="fj-thermal-transition"
          />
        ))}
      </svg>
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {label}.{" "}
        {summarize(days)}
      </span>
      <div
        aria-hidden
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "var(--space-1)",
        }}
      >
        <span className="fj-caption">{days.length} days ago</span>
        <span className="fj-caption">{label}</span>
        <span className="fj-caption">Today</span>
      </div>
    </div>
  );
}

function summarize(days: UptimeDay[]): string {
  const bad = days.filter((d) => d.status !== "operational");
  if (bad.length === 0) return `All ${days.length} days operational.`;
  return `${days.length - bad.length} of ${days.length} days operational. Exceptions: ${bad
    .map((d) => `${d.date} ${statusSpecs[d.status].label.toLowerCase()}`)
    .join(", ")}.`;
}

/**
 * Deterministic, realistic sample history for demos and the Brand Lab.
 * Same seed in, same story out: no random flicker between builds.
 */
export function sampleUptimeDays(count = 90, seed = 7): UptimeDay[] {
  const days: UptimeDay[] = [];
  const start = new Date("2026-07-16T00:00:00Z");
  let s = seed;
  const next = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    const r = next();
    let status: OperationalStatus = "operational";
    if (r > 0.985) status = "down";
    else if (r > 0.955) status = "degraded";
    else if (r > 0.945) status = "maintenance";
    days.push({ date: d.toISOString().slice(0, 10), status });
  }
  return days;
}
