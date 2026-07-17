/**
 * Timestamp formatting for the public renderer. Status pages must show exact,
 * unambiguous times in the page's configured timezone (relative time is only a
 * secondary convenience), so these helpers always render an absolute date with
 * the zone abbreviation. Client-safe.
 */

export function formatInstant(
  iso: string | null | undefined,
  timezone = "UTC",
  locale = "en",
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(date);
  }
}

export function formatDay(iso: string, timezone = "UTC", locale = "en"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone: timezone,
    }).format(date);
  } catch {
    return iso;
  }
}

/** Compact relative age for the freshness line ("updated 4 minutes ago"). */
export function relativeAge(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Duration between two instants, for resolved incidents. */
export function formatDuration(startIso: string, endIso: string | null): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "";
  const minutes = Math.round((end - start) / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours < 24) return rem ? `${hours}h ${rem}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH ? `${days}d ${remH}h` : `${days}d`;
}

export function formatUptimePercent(fraction: number | null): string {
  if (fraction === null) return "No data";
  const pct = fraction * 100;
  const rounded = pct >= 99.995 ? 100 : Math.floor(pct * 100) / 100;
  return `${rounded.toFixed(rounded === 100 ? 0 : 2)}%`;
}
