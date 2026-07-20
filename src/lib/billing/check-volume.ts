/**
 * Check-volume utilities for usage-based pricing. Checks are the primary
 * cost driver; monitor count and interval determine consumption.
 */

import type { PlanId } from "@/lib/stripe/plans";

/** Overage rate: $6 per 100K checks beyond plan allowance (80% target margin). */
export const CHECK_OVERAGE_PER_100K_CENTS = 600;

/** Annual billing: two months free (20% off). */
export const ANNUAL_MONTHS_FREE = 2;

/** Allowed check intervals in seconds (matches monitor contract). */
export const CHECK_INTERVAL_OPTIONS = [60, 300, 600, 900, 1800, 3600] as const;

export type CheckIntervalSeconds = (typeof CHECK_INTERVAL_OPTIONS)[number];

export interface VolumeTier {
  key: string;
  label: string;
  checksIncluded: number;
  /** Which catalog plan fits this volume at list price. */
  recommendedPlan: PlanId;
  /** Above this tier, contact for custom pricing. */
  contactSales?: boolean;
}

/** Volume tiers for the public pricing slider (DataFast-style axis). */
export const VOLUME_TIERS: VolumeTier[] = [
  {
    key: "100k",
    label: "100K",
    checksIncluded: 100_000,
    recommendedPlan: "starter",
  },
  {
    key: "500k",
    label: "500K",
    checksIncluded: 500_000,
    recommendedPlan: "pro",
  },
  {
    key: "2m",
    label: "2M",
    checksIncluded: 2_000_000,
    recommendedPlan: "business",
  },
  {
    key: "6m",
    label: "6M",
    checksIncluded: 6_000_000,
    recommendedPlan: "business",
    contactSales: true,
  },
];

/** Estimated checks per month for a steady monitor fleet. */
export function estimateMonthlyChecks(
  activeMonitors: number,
  intervalSeconds: number,
): number {
  if (activeMonitors <= 0 || intervalSeconds <= 0) return 0;
  const checksPerMonitorPerMonth = Math.floor(
    (86_400 / intervalSeconds) * 30,
  );
  return activeMonitors * checksPerMonitorPerMonth;
}

/** Human-readable check count (100000 → "100K"). */
export function formatChecksCompact(count: number): string {
  if (count >= 1_000_000) {
    const m = count / 1_000_000;
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (count >= 1_000) {
    const k = count / 1_000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(0)}K`;
  }
  return String(count);
}

/** Plan that best fits estimated monthly check volume at published tiers. */
export function recommendPlanForChecks(checks: number): PlanId {
  if (checks <= VOLUME_TIERS[0].checksIncluded) return "starter";
  if (checks <= VOLUME_TIERS[1].checksIncluded) return "pro";
  return "business";
}

/** Interval label for pricing calculator. */
export function intervalOptionLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  if (seconds === 60) return "1 min";
  if (seconds % 60 === 0) return `${seconds / 60} min`;
  return `${seconds}s`;
}
