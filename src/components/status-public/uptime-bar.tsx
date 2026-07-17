import { COMPONENT_STATE_LABEL } from "@/lib/status-pages/constants";
import { formatDay, formatUptimePercent } from "@/lib/status-pages/format";
import type { PublicDailyUptime } from "@/lib/status-pages/snapshot-types";

const DAY_LABEL: Record<string, string> = {
  ...COMPONENT_STATE_LABEL,
  no_data: "No data",
};

/**
 * Accessible daily uptime history. Each day is a labelled bar with a title
 * (native tooltip) plus a screen-reader summary; state is conveyed by pattern
 * and label, never color alone. On narrow screens the bars compress but stay
 * readable rather than overflowing.
 */
export function UptimeBar({
  days,
  fraction,
  windowDays,
  timezone,
  locale,
  label,
}: {
  days: PublicDailyUptime[];
  fraction: number | null;
  windowDays: number;
  timezone: string;
  locale: string;
  label: string;
}) {
  const summary =
    fraction === null
      ? `${label}: uptime not available for the last ${windowDays} days.`
      : `${label}: ${formatUptimePercent(fraction)} uptime over the last ${windowDays} days.`;

  return (
    <div className="sp-uptime">
      <div className="sp-uptime__meta">
        <span>{windowDays}-day uptime</span>
        <span>{formatUptimePercent(fraction)}</span>
      </div>
      <div className="sp-uptime__track" role="img" aria-label={summary}>
        {days.map((day) => {
          const state = day.worst;
          const pct = day.fraction === null ? "No data" : formatUptimePercent(day.fraction);
          return (
            <span
              key={day.date}
              className="sp-uptime__day"
              data-state={state}
              title={`${formatDay(day.date, timezone, locale)}: ${DAY_LABEL[state] ?? state} (${pct})`}
            />
          );
        })}
      </div>
      <div className="sp-uptime__legend" aria-hidden="true">
        <span>{windowDays} days ago</span>
        <span>Today</span>
      </div>
      <p className="sp-visually-hidden">{summary}</p>
    </div>
  );
}
