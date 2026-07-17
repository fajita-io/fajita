/**
 * Centralized uptime and response-time semantics. Every surface that shows an
 * uptime percentage or an average response time computes it from these helpers,
 * so the number can never differ between the monitor list, the overview page,
 * and a monitor detail page.
 *
 * Phase 5 uptime definition:
 *   Percentage of completed checks that passed during the selected period.
 *
 * Excluded from the calculation:
 *   - Manual test executions (is_test = true), excluded at the SQL source.
 *   - Draft and paused periods (no checks were scheduled, so there is no result
 *     to count; gaps are shown as "no data", never as downtime).
 *   - Blocked results from an invalid or restricted configuration.
 *   - Canceled results.
 *
 * This module is client-safe (no server imports) so charts and summaries can
 * render it directly.
 */

export interface ResultStats {
  /** success + failure + error + timed_out. The denominator. */
  totalConsidered: number;
  passed: number;
  failed: number;
  errored: number;
  timedOut: number;
  /** Blocked results, tracked but excluded from the denominator. */
  blocked: number;
  /** Average total time in ms across successful checks, or null. */
  avgTotalMs: number | null;
  lastCheckedAt: string | null;
}

export const EMPTY_STATS: ResultStats = {
  totalConsidered: 0,
  passed: 0,
  failed: 0,
  errored: 0,
  timedOut: 0,
  blocked: 0,
  avgTotalMs: null,
  lastCheckedAt: null,
};

/**
 * Uptime fraction in [0,1], or null when there is not enough data to make a
 * truthful claim. Never returns 100% or 0% for an empty window.
 */
export function uptimeFraction(stats: ResultStats): number | null {
  if (stats.totalConsidered === 0) return null;
  return stats.passed / stats.totalConsidered;
}

/**
 * Uptime as a display string with sample-size-aware precision. Returns "No data"
 * when nothing has been measured, avoiding false precision on tiny samples.
 */
export function formatUptime(stats: ResultStats): string {
  const f = uptimeFraction(stats);
  if (f === null) return "No data";
  const pct = f * 100;
  // Few samples: whole numbers only. Larger samples: one or two decimals.
  if (stats.totalConsidered < 20) return `${Math.round(pct)}%`;
  if (pct >= 99.95 && f < 1) return "99.9%"; // never round a real failure up to 100%
  if (f === 1) return "100%";
  return `${pct.toFixed(stats.totalConsidered >= 200 ? 2 : 1)}%`;
}

/** Health band for coloring an uptime figure without relying on color alone. */
export function uptimeBand(
  stats: ResultStats,
): "operational" | "degraded" | "down" | "unknown" {
  const f = uptimeFraction(stats);
  if (f === null) return "unknown";
  if (f >= 0.995) return "operational";
  if (f >= 0.95) return "degraded";
  return "down";
}

/** Average response time as a display string, or a dash when unknown. */
export function formatResponseTime(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  if (ms < 1) return "<1 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
