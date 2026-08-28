import { DemoFrame, Metric, ChannelChip } from "@/components/design-system/primitives";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { UptimeChart, type UptimeDay } from "@/components/design-system/uptime-chart";
import { InteractiveSampleLabel } from "@/components/site/interactive-sample-label";
import { demoEndpoints } from "@/lib/site/demo-brand";

/**
 * Exactly the story the copy tells: 90 days, one 14-minute incident
 * (day 31), one maintenance window (day 74). Consistent with the 99.98%
 * uptime metric shown beside it.
 */
function previewDays(): UptimeDay[] {
  const days: UptimeDay[] = [];
  const start = new Date("2026-07-16T00:00:00Z");
  for (let i = 89; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    let status: UptimeDay["status"] = "operational";
    if (i === 59) status = "down";
    if (i === 16) status = "maintenance";
    days.push({ date: d.toISOString().slice(0, 10), status });
  }
  return days;
}

/**
 * Deterministic 24h response-time series (minutes compressed). Plausible
 * numbers for a healthy API: ~180 ms baseline with normal variance and
 * one short evening bump. Same output every build; no random flicker.
 */
function responseSeries(): number[] {
  const points: number[] = [];
  let s = 11;
  const next = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = 0; i < 48; i++) {
    let v = 178 + Math.sin(i / 5.1) * 14 + next() * 26;
    if (i >= 33 && i <= 36) v += (i - 32) * 55; // the evening bump
    if (i === 37) v = 224;
    points.push(Math.round(v));
  }
  return points;
}

function ResponseChart() {
  const data = responseSeries();
  const max = 420;
  const w = 560;
  const h = 120;
  const stepX = w / (data.length - 1);
  const points = data
    .map((v, i) => `${(i * stepX).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="fj-response-chart"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
        style={{ height: "7rem" }}
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={w}
            y1={h * f}
            y2={h * f}
            stroke="var(--color-chart-grid)"
            strokeWidth="1"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-chart-series-1)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className="fj-visually-hidden">
        Response time over the last 24 hours: steady near 180 milliseconds,
        one brief rise to about 400 milliseconds in the evening, back to
        baseline within twenty minutes.
      </span>
      <div
        aria-hidden
        style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-1)" }}
      >
        <span className="fj-caption">24h ago</span>
        <span className="fj-caption">response time</span>
        <span className="fj-caption">now</span>
      </div>
    </div>
  );
}

/**
 * Product proof: one monitor in the marketing demo frame. Sample data only;
 * labeled as an interactive preview.
 */
export function MonitorPreview() {
  return (
    <DemoFrame title="fajita · monitor preview">
      <div className="fj-monitor-preview">
        <div className="fj-monitor-preview__head">
          <span className="fj-monitor-preview__endpoint">
            GET {demoEndpoints.apiHealth.label}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <StatusBadge status="operational" />
            <InteractiveSampleLabel detail="Check passing" />
          </div>
        </div>

        <div className="fj-monitor-preview__metrics">
          <Metric value="184 ms" label="Response time" />
          <Metric value="99.98%" label="Uptime, 90 days" />
          <Metric value="212d" label="SSL valid" />
          <Metric value="28s ago" label="Last checked" />
        </div>

        <ResponseChart />

        <UptimeChart
          days={previewDays()}
          label={`${demoEndpoints.apiHealth.label} · last 90 days`}
        />

        <div className="fj-monitor-preview__facts">
          <ChannelChip>Alerts: #ops-alerts + email</ChannelChip>
          <ChannelChip>Status page: public</ChannelChip>
          <ChannelChip>1 incident, resolved in 14 min</ChannelChip>
        </div>
      </div>
    </DemoFrame>
  );
}
