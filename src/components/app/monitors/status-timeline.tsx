import { absoluteTime } from "@/lib/monitoring/display";

export interface TimelinePoint {
  checkedAt: string;
  status: string;
}

/**
 * Compact status timeline. Oldest to newest, left to right. Result is encoded by
 * both color and a legend label (never color alone), missing data is shown as a
 * distinct hatched cell (never a continuous line implying checks that did not
 * run), and each cell carries an accessible title. A single failed cell is a
 * failed check, never an incident.
 */
export function StatusTimeline({ points }: { points: TimelinePoint[] }) {
  if (points.length === 0) {
    return <p className="fj-rtchart__summary">No checks yet in this period.</p>;
  }
  const ordered = [...points].reverse(); // incoming is newest-first
  return (
    <div>
      <div className="fj-tl" role="img" aria-label={`Recent check results, oldest to newest. ${summarize(points)}.`}>
        {ordered.map((p, i) => (
          <span
            key={i}
            className="fj-tl__cell"
            data-r={cellResult(p.status)}
            title={`${absoluteTime(p.checkedAt)}: ${p.status}`}
          />
        ))}
      </div>
      <div className="fj-tl__legend" aria-hidden="true">
        <Legend cls="success" label="Passed" />
        <Legend cls="failure" label="Failed" />
        <Legend cls="blocked" label="Blocked" />
        <Legend cls="none" label="No data" />
      </div>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="fj-tl__legenditem">
      <span className="fj-tl__swatch fj-tl__cell" data-r={cls} />
      {label}
    </span>
  );
}

function cellResult(status: string): string {
  if (status === "success") return "success";
  if (status === "blocked") return "blocked";
  if (status === "failure" || status === "error" || status === "timed_out") return "failure";
  return "none";
}

function summarize(points: TimelinePoint[]): string {
  const pass = points.filter((p) => p.status === "success").length;
  return `${pass} of ${points.length} passed`;
}
