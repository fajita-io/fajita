/**
 * Centralized payment grace-period policy. One place defines how long a failed
 * payment is tolerated before the organization is restricted. Values are
 * configurable here and never hardcoded across the product.
 *
 * Provisional policy:
 *   Days 0-3   full operation, prominent warning, Stripe retries.
 *   Days 4-7   monitoring continues, new resource creation blocked.
 *   After 7    restricted: new checks stop, data preserved and readable.
 */
export interface GracePolicy {
  /** End of the "warn only" window, in whole days from first failure. */
  warnUntilDay: number;
  /** End of the "block new resources" window. Restriction begins after this. */
  blockNewUntilDay: number;
}

export const GRACE_POLICY: GracePolicy = {
  warnUntilDay: 3,
  blockNewUntilDay: 7,
};

export type GracePhase = "warn" | "block_new" | "restricted";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days elapsed between two instants (never negative). */
export function daysElapsed(fromIso: string, now: Date = new Date()): number {
  const from = new Date(fromIso).getTime();
  const diff = now.getTime() - from;
  return Math.max(0, Math.floor(diff / MS_PER_DAY));
}

/** Which grace phase applies given when the payment first failed. */
export function gracePhase(
  failedAtIso: string,
  now: Date = new Date(),
  policy: GracePolicy = GRACE_POLICY,
): GracePhase {
  const days = daysElapsed(failedAtIso, now);
  if (days <= policy.warnUntilDay) return "warn";
  if (days <= policy.blockNewUntilDay) return "block_new";
  return "restricted";
}

/** Whether creating new resources is blocked in this grace phase. */
export function blocksNewResources(phase: GracePhase): boolean {
  return phase === "block_new" || phase === "restricted";
}

/** ISO date when restriction begins for a given first-failure instant. */
export function restrictionStartsAt(
  failedAtIso: string,
  policy: GracePolicy = GRACE_POLICY,
): string {
  const from = new Date(failedAtIso).getTime();
  return new Date(from + (policy.blockNewUntilDay + 1) * MS_PER_DAY).toISOString();
}
