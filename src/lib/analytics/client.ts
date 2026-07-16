"use client";

import {
  type DataFastGoalName,
  sanitizeGoalParams,
} from "@/lib/analytics/goals";

/**
 * Track a custom goal in the browser.
 * Prefer server-side trackGoal() for auth-confirmed events (signup, payment intent).
 */
export function trackGoal(
  name: DataFastGoalName | string,
  params?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined") return;

  const sanitized = sanitizeGoalParams(params);
  if (sanitized) {
    window.datafast?.(name, sanitized);
    return;
  }

  window.datafast?.(name);
}

/**
 * Track a goal once per session (uses sessionStorage).
 * Useful for scroll or one-time UI milestones.
 */
export function trackGoalOnce(
  name: DataFastGoalName | string,
  params?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined") return;

  const key = `datafast:once:${name}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage unavailable; track anyway
  }

  trackGoal(name, params);
}
