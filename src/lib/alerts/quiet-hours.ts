/**
 * Quiet-hours evaluation. Pure module (client + server safe).
 *
 * A quiet window is defined in a specific timezone by a start minute, end
 * minute (both minutes from local midnight), and a set of weekdays. Windows may
 * cross midnight. Critical severities and explicit event-type exceptions always
 * pass through. Timezone conversion uses Intl so daylight-saving transitions
 * are handled correctly without a date library.
 */

export interface QuietWindow {
  timezone: string;
  startMinute: number;
  endMinute: number;
  /** 0 = Sunday .. 6 = Saturday. */
  days: number[];
  severityExceptions: string[];
  eventTypeExceptions: string[];
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Local minute-of-day and weekday for an instant in a given timezone. */
export function localMinuteAndDay(
  at: Date,
  timezone: string,
): { minute: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(at);
  let hour = 0;
  let minute = 0;
  let day = 0;
  for (const p of parts) {
    if (p.type === "hour") hour = Number.parseInt(p.value, 10);
    else if (p.type === "minute") minute = Number.parseInt(p.value, 10);
    else if (p.type === "weekday") day = WEEKDAY_INDEX[p.value] ?? 0;
  }
  return { minute: hour * 60 + minute, day };
}

/**
 * Is the window active at instant `at`? Only considers time and weekday, not
 * exceptions. A window where start === end is treated as inactive (empty).
 */
export function windowActiveAt(window: QuietWindow, at: Date): boolean {
  if (window.startMinute === window.endMinute) return false;
  const { minute, day } = localMinuteAndDay(at, window.timezone);

  if (window.startMinute < window.endMinute) {
    // Same-day window; the weekday of `at` must be included.
    return (
      window.days.includes(day) &&
      minute >= window.startMinute &&
      minute < window.endMinute
    );
  }

  // Cross-midnight window: [start, 1440) on the start day, or [0, end) which
  // belongs to the previous day's window.
  if (minute >= window.startMinute) {
    return window.days.includes(day);
  }
  if (minute < window.endMinute) {
    const prevDay = (day + 6) % 7;
    return window.days.includes(prevDay);
  }
  return false;
}

export type QuietDecision = "not_quiet" | "suppress_or_delay" | "exception_passes";

/**
 * Evaluate whether an event should be affected by quiet hours. Returns:
 *  - "not_quiet": no active window applies now.
 *  - "exception_passes": a window is active but the severity or event type is
 *    excepted, so delivery proceeds normally.
 *  - "suppress_or_delay": a window is active and the event is affected; the
 *    caller applies the rule's quiet behavior (suppress or delay).
 */
export function evaluateQuiet(params: {
  windows: QuietWindow[];
  at: Date;
  severity: string | null;
  eventType: string;
}): QuietDecision {
  const active = params.windows.filter((w) => windowActiveAt(w, params.at));
  if (active.length === 0) return "not_quiet";

  // If every active window excepts this event, it passes.
  const passes = active.every(
    (w) =>
      (params.severity != null && w.severityExceptions.includes(params.severity)) ||
      w.eventTypeExceptions.includes(params.eventType),
  );
  return passes ? "exception_passes" : "suppress_or_delay";
}

/** End of the current active window, used to schedule a delayed delivery. */
export function nextWindowEnd(window: QuietWindow, at: Date): Date {
  const { minute } = localMinuteAndDay(at, window.timezone);
  let minutesUntilEnd: number;
  if (window.startMinute < window.endMinute) {
    minutesUntilEnd = window.endMinute - minute;
  } else {
    // Cross-midnight.
    minutesUntilEnd =
      minute >= window.startMinute
        ? 1440 - minute + window.endMinute
        : window.endMinute - minute;
  }
  return new Date(at.getTime() + Math.max(1, minutesUntilEnd) * 60_000);
}
