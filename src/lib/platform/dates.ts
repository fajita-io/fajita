/**
 * Global date range and comparison controls for internal operations.
 * Platform timezone is America/Denver (Kalispell operations), UTC for infra.
 */

export const PLATFORM_TIMEZONE = "America/Denver";

export type DatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "current_month"
  | "prior_month"
  | "current_quarter"
  | "prior_quarter"
  | "current_year"
  | "custom";

export type ComparisonMode =
  | "previous_period"
  | "previous_month"
  | "previous_year"
  | "none";

export interface DateRange {
  start: Date;
  end: Date;
  preset: DatePreset;
  partial: boolean;
  label: string;
}

export interface ComparisonRange {
  mode: ComparisonMode;
  start: Date | null;
  end: Date | null;
  label: string;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export function resolveDateRange(
  preset: DatePreset,
  customStart?: string | null,
  customEnd?: string | null,
  now = new Date(),
): DateRange {
  const today = startOfDay(now);
  let start = today;
  let end = endOfDay(now);
  let partial = false;

  switch (preset) {
    case "today":
      partial = true;
      break;
    case "yesterday":
      start = addDays(today, -1);
      end = endOfDay(addDays(today, -1));
      break;
    case "last_7_days":
      start = addDays(today, -6);
      partial = true;
      break;
    case "last_30_days":
      start = addDays(today, -29);
      partial = true;
      break;
    case "current_month":
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      partial = true;
      break;
    case "prior_month": {
      const y = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
      const m = now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1;
      start = new Date(Date.UTC(y, m, 1));
      end = endOfDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)));
      break;
    }
    case "current_quarter": {
      const q = Math.floor(now.getUTCMonth() / 3) * 3;
      start = new Date(Date.UTC(now.getUTCFullYear(), q, 1));
      partial = true;
      break;
    }
    case "prior_quarter": {
      const q = Math.floor(now.getUTCMonth() / 3) * 3;
      const startMonth = q - 3;
      const y = startMonth < 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
      const m = (startMonth + 12) % 12;
      start = new Date(Date.UTC(y, m, 1));
      end = endOfDay(new Date(Date.UTC(now.getUTCFullYear(), q, 0)));
      break;
    }
    case "current_year":
      start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      partial = true;
      break;
    case "custom":
      if (customStart) start = startOfDay(new Date(customStart));
      if (customEnd) end = endOfDay(new Date(customEnd));
      partial = end > now;
      break;
  }

  return {
    start,
    end,
    preset,
    partial,
    label: `${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}${
      partial ? " (partial current period)" : ""
    }`,
  };
}

export function resolveComparison(
  range: DateRange,
  mode: ComparisonMode,
): ComparisonRange {
  if (mode === "none") {
    return { mode, start: null, end: null, label: "No comparison" };
  }

  const ms = range.end.getTime() - range.start.getTime();
  let start: Date;
  let end: Date;

  if (mode === "previous_period") {
    end = new Date(range.start.getTime() - 1);
    start = new Date(end.getTime() - ms);
  } else if (mode === "previous_month") {
    start = new Date(range.start);
    start.setUTCMonth(start.getUTCMonth() - 1);
    end = new Date(range.end);
    end.setUTCMonth(end.getUTCMonth() - 1);
  } else {
    start = new Date(range.start);
    start.setUTCFullYear(start.getUTCFullYear() - 1);
    end = new Date(range.end);
    end.setUTCFullYear(end.getUTCFullYear() - 1);
  }

  return {
    mode,
    start,
    end,
    label: `${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`,
  };
}

export function parseRangeFromSearchParams(sp: {
  range?: string;
  from?: string;
  to?: string;
  compare?: string;
}): { range: DateRange; comparison: ComparisonRange } {
  const preset = (sp.range as DatePreset) || "last_30_days";
  const validPresets: DatePreset[] = [
    "today",
    "yesterday",
    "last_7_days",
    "last_30_days",
    "current_month",
    "prior_month",
    "current_quarter",
    "prior_quarter",
    "current_year",
    "custom",
  ];
  const safePreset = validPresets.includes(preset) ? preset : "last_30_days";
  const range = resolveDateRange(safePreset, sp.from, sp.to);
  const compare = (sp.compare as ComparisonMode) || "previous_period";
  const validCompare: ComparisonMode[] = [
    "previous_period",
    "previous_month",
    "previous_year",
    "none",
  ];
  const comparison = resolveComparison(
    range,
    validCompare.includes(compare) ? compare : "previous_period",
  );
  return { range, comparison };
}
