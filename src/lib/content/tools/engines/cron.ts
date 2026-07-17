/**
 * Cron expression explainer for the 5-field format Fajita documents:
 * minute hour day-of-month month day-of-week
 *
 * Supports numbers, ranges (1-5), lists (1,15), steps (star/5), and names for
 * months/days. Does not execute shell commands. Not every cron dialect matches.
 */

export type CronFieldName =
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

export interface CronExplainOk {
  ok: true;
  fields: Record<CronFieldName, string>;
  human: string;
  nextRuns: string[];
  warnings: string[];
  syntaxNote: string;
}

export interface CronExplainErr {
  ok: false;
  error: string;
}

export type CronExplainResult = CronExplainOk | CronExplainErr;

const MONTH_NAMES: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const DOW_NAMES: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function expandField(
  raw: string,
  min: number,
  max: number,
  names?: Record<string, number>,
): number[] | string {
  const token = raw.trim().toLowerCase();
  if (!token) return "Empty field";

  const replaceNames = (s: string) =>
    s.replace(/[a-z]{3}/g, (m) => {
      if (!names || names[m] === undefined) return m;
      return String(names[m]);
    });

  const normalized = replaceNames(token);
  const values = new Set<number>();

  for (const part of normalized.split(",")) {
    const [rangePart, stepPart] = part.split("/");
    const step = stepPart !== undefined ? Number(stepPart) : 1;
    if (!Number.isInteger(step) || step < 1) return `Invalid step in "${raw}"`;

    let start: number;
    let end: number;
    if (rangePart === "*") {
      start = min;
      end = max;
    } else if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-");
      start = Number(a);
      end = Number(b);
    } else {
      start = Number(rangePart);
      end = start;
    }

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < min ||
      end > max ||
      start > end
    ) {
      return `Out of range value in "${raw}" (allowed ${min}-${max})`;
    }

    for (let i = start; i <= end; i += step) values.add(i);
  }

  return [...values].sort((a, b) => a - b);
}

function describeList(values: number[], label: string, allLabel: string, max: number): string {
  if (values.length === max - (label === "minute" ? -0 : 0) && values[0] === (label === "dow" ? 0 : label === "month" ? 1 : 0)) {
    // simplified: if covers full range
  }
  if (values.length > 12) return `${label}: ${values.length} values`;
  return `${label} ${values.join(", ")}`;
}

function fieldLabel(name: CronFieldName, values: number[]): string {
  switch (name) {
    case "minute":
      return values.length === 60 ? "every minute" : `minute ${values.join(", ")}`;
    case "hour":
      return values.length === 24 ? "every hour" : `hour ${values.join(", ")}`;
    case "dayOfMonth":
      return values.length === 31 ? "every day of the month" : `day-of-month ${values.join(", ")}`;
    case "month":
      return values.length === 12 ? "every month" : `month ${values.join(", ")}`;
    case "dayOfWeek":
      return values.length === 7 ? "every day of the week" : `day-of-week ${values.join(", ")}`;
  }
}

function matches(
  date: Date,
  minute: number[],
  hour: number[],
  dom: number[],
  month: number[],
  dow: number[],
): boolean {
  const m = date.getUTCMinutes();
  const h = date.getUTCHours();
  const D = date.getUTCDate();
  const M = date.getUTCMonth() + 1;
  const d = date.getUTCDay();
  const domMatch = dom.includes(D);
  const dowMatch = dow.includes(d);
  // Standard cron: when both DOM and DOW are restricted, many implementations OR them.
  const dayOk =
    (dom.length === 31 && dow.length === 7) ||
    (dom.length === 31 && dowMatch) ||
    (dow.length === 7 && domMatch) ||
    (domMatch || dowMatch);
  return minute.includes(m) && hour.includes(h) && month.includes(M) && dayOk;
}

export function explainCron(
  expression: string,
  timezone = "UTC",
  nextCount = 5,
  from: Date = new Date(),
): CronExplainResult {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      ok: false,
      error:
        "Use a 5-field expression: minute hour day-of-month month day-of-week. Six-field (with seconds) is not supported here.",
    };
  }

  const minute = expandField(parts[0], 0, 59);
  const hour = expandField(parts[1], 0, 23);
  const dayOfMonth = expandField(parts[2], 1, 31);
  const month = expandField(parts[3], 1, 12, MONTH_NAMES);
  const dayOfWeek = expandField(parts[4], 0, 7, DOW_NAMES);

  for (const field of [minute, hour, dayOfMonth, month, dayOfWeek]) {
    if (typeof field === "string") return { ok: false, error: field };
  }

  // Allow 7 as Sunday alias → normalize to 0
  const dowValues = (dayOfWeek as number[]).map((d) => (d === 7 ? 0 : d));
  const uniqueDow = [...new Set(dowValues)].sort((a, b) => a - b);

  const warnings: string[] = [];
  if (timezone !== "UTC") {
    warnings.push(
      `Next run times are computed in UTC for predictability. You selected ${timezone}; convert carefully around daylight-saving transitions.`,
    );
  }
  if (
    (dayOfMonth as number[]).length < 31 &&
    uniqueDow.length < 7
  ) {
    warnings.push(
      "Both day-of-month and day-of-week are restricted. Many cron implementations match either field (OR), which can surprise people.",
    );
  }

  const human = [
    fieldLabel("minute", minute as number[]),
    fieldLabel("hour", hour as number[]),
    fieldLabel("dayOfMonth", dayOfMonth as number[]),
    fieldLabel("month", month as number[]),
    fieldLabel("dayOfWeek", uniqueDow),
  ].join("; ");

  const nextRuns: string[] = [];
  const cursor = new Date(from);
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

  for (let i = 0; i < 366 * 24 * 60 && nextRuns.length < nextCount; i++) {
    if (
      matches(
        cursor,
        minute as number[],
        hour as number[],
        dayOfMonth as number[],
        month as number[],
        uniqueDow,
      )
    ) {
      nextRuns.push(cursor.toISOString().replace(".000Z", "Z"));
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }

  if (nextRuns.length === 0) {
    warnings.push("No upcoming runs found in the next year with this expression.");
  }

  void describeList;

  return {
    ok: true,
    fields: {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    },
    human,
    nextRuns,
    warnings,
    syntaxNote:
      "Supported syntax is classic 5-field cron (minute hour day-of-month month day-of-week) with lists, ranges, and steps. This is not a guarantee that every platform (systemd, GitHub Actions, cloud schedulers) uses identical rules.",
  };
}
