/**
 * Centralized incident duration + timestamp formatting. All math is on UTC
 * instants (ISO strings or epoch ms). Never derive duration from browser local
 * time. Display formatting can apply the organization timezone separately.
 */

/** Milliseconds between two instants, clamped to >= 0. */
export function durationMs(fromIso: string | null, toIso: string | null): number {
  if (!fromIso) return 0;
  const start = Date.parse(fromIso);
  const end = toIso ? Date.parse(toIso) : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, end - start);
}

/** Compact human duration: 45s, 12m, 3h 20m, 2d 4h. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

/** Primary customer-facing incident duration: opened_at to resolution (or now). */
export function incidentDuration(
  openedAt: string | null,
  resolvedAt: string | null,
): string {
  return formatDuration(durationMs(openedAt, resolvedAt));
}

/** Exact absolute timestamp in a given timezone. Relative time is secondary. */
export function formatTimestamp(iso: string | null, timeZone = "UTC"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(d);
}

/** Secondary relative label, e.g. "3m ago", "in 2h". */
export function relativeTime(iso: string | null, now = Date.now()): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const deltaMs = t - now;
  const abs = Math.abs(deltaMs);
  const suffix = deltaMs <= 0 ? "ago" : "from now";
  const prefix = deltaMs <= 0 ? "" : "in ";
  const label = formatDuration(abs);
  return deltaMs <= 0 ? `${label} ${suffix}` : `${prefix}${label}`;
}
