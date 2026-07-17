import { formatResponseTime } from "@/lib/monitoring/uptime";
import { absoluteTime } from "@/lib/monitoring/display";

export interface ChartPoint {
  checkedAt: string;
  status: string;
  totalMs: number | null;
}

/**
 * Accessible response-time chart. Server-rendered SVG (no client JS), with a
 * threshold line, failed-check markers, real axis labels and units, a plain
 * text summary, and a visually-hidden data table alternative. No decorative
 * gradients, no smoothing that hides values, no invented data.
 */
export function ResponseChart({
  points,
  thresholdMs,
  label = "Response time",
}: {
  points: ChartPoint[];
  thresholdMs?: number | null;
  label?: string;
}) {
  if (points.length === 0) {
    return (
      <p className="fj-rtchart__summary">No checks have run in this period yet.</p>
    );
  }

  const W = 720;
  const H = 200;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const successMs = points.filter((p) => p.status === "success" && p.totalMs != null).map((p) => p.totalMs as number);
  const dataMax = Math.max(...successMs, thresholdMs ?? 0, 100);
  const yMax = Math.ceil((dataMax * 1.15) / 50) * 50;

  const n = points.length;
  const x = (i: number) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (ms: number) => padT + innerH - (ms / yMax) * innerH;

  const linePts = points
    .map((p, i) => (p.status === "success" && p.totalMs != null ? `${x(i)},${y(p.totalMs)}` : null))
    .filter(Boolean) as string[];
  const linePath = linePts.length > 1 ? `M ${linePts.join(" L ")}` : "";

  const failures = points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.status !== "success");

  const avg = successMs.length > 0 ? successMs.reduce((a, b) => a + b, 0) / successMs.length : null;
  const failCount = points.length - successMs.length;

  const yTicks = [0, yMax / 2, yMax];

  return (
    <figure className="fj-rtchart" style={{ margin: 0 }}>
      <svg
        className="fj-rtchart__svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label} chart. ${points.length} checks. Average ${avg ? formatResponseTime(avg) : "no data"}. ${failCount} failed.`}
        preserveAspectRatio="none"
      >
        <g className="fj-rtchart__grid">
          {yTicks.map((t) => (
            <line key={t} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
          ))}
        </g>
        {yTicks.map((t) => (
          <text key={`l${t}`} className="fj-rtchart__axis" x={padL - 6} y={y(t) + 3} textAnchor="end">
            {t >= 1000 ? `${(t / 1000).toFixed(1)}s` : `${t}ms`}
          </text>
        ))}
        {thresholdMs ? (
          <line className="fj-rtchart__threshold" x1={padL} x2={W - padR} y1={y(thresholdMs)} y2={y(thresholdMs)} />
        ) : null}
        {linePath ? <path className="fj-rtchart__line" d={linePath} /> : null}
        {failures.map(({ i }) => (
          <circle key={i} className="fj-rtchart__dot-fail" cx={x(i)} cy={padT + innerH} r={3.5} />
        ))}
        <text className="fj-rtchart__axis" x={padL} y={H - 6} textAnchor="start">
          {shortTime(points[0].checkedAt)}
        </text>
        <text className="fj-rtchart__axis" x={W - padR} y={H - 6} textAnchor="end">
          {shortTime(points[n - 1].checkedAt)}
        </text>
      </svg>
      <figcaption className="fj-rtchart__summary">
        {points.length} checks. Average {avg ? formatResponseTime(avg) : "no data"}.
        {thresholdMs ? ` Limit ${formatResponseTime(thresholdMs)}.` : ""} {failCount} failed.
      </figcaption>
      <table className="fj-visually-hidden">
        <caption>{label} data</caption>
        <thead>
          <tr>
            <th>Time</th>
            <th>Result</th>
            <th>Response time</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={i}>
              <td>{absoluteTime(p.checkedAt)}</td>
              <td>{p.status}</td>
              <td>{formatResponseTime(p.totalMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function shortTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit" });
}
