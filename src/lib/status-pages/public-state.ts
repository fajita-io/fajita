/**
 * Centralized public-state calculation. Every surface that shows a component
 * state or an overall status derives it here, so the number never disagrees
 * between the public renderer, the projection builder, and the management
 * preview. Pure and client-safe.
 *
 * Design rules (from the phase directive):
 *   - "All Systems Operational" is calculated, never hardcoded.
 *   - Internal verification is not automatically exposed as an outage.
 *   - Scheduled maintenance never hides an unrelated confirmed outage.
 *   - Confirmed outages are never downgraded to make metrics look better.
 *   - Unknown/unmeasured monitors do not manufacture a fake outage; they are
 *     reflected honestly as no-data in uptime, not as a live incident.
 */

import {
  type ComponentCalculationMode,
  type InternalOperationalState,
  type OverallState,
  type PublicComponentState,
} from "./constants";

/** Severity ordering used to combine and compare states (higher = worse). */
const COMPONENT_SEVERITY: Record<PublicComponentState, number> = {
  operational: 0,
  under_maintenance: 1,
  degraded_performance: 2,
  partial_outage: 3,
  major_outage: 4,
};

export function componentSeverity(state: PublicComponentState): number {
  return COMPONENT_SEVERITY[state];
}

export function moreSevereComponent(
  a: PublicComponentState,
  b: PublicComponentState,
): PublicComponentState {
  return COMPONENT_SEVERITY[a] >= COMPONENT_SEVERITY[b] ? a : b;
}

export interface MappedMonitorState {
  internalState: InternalOperationalState;
  isCritical: boolean;
  /** True when the engine has recent data for this monitor. */
  hasData?: boolean;
}

/**
 * Map a single monitor's internal state to the public component vocabulary.
 * `exposeVerifyingAsDegraded` lets a customer opt to surface verification as
 * degraded; the default keeps verification private (shown operational) to
 * avoid flicker, per the public-delay policy.
 */
export function monitorToPublicState(
  monitor: MappedMonitorState,
  opts: { exposeVerifyingAsDegraded?: boolean } = {},
): PublicComponentState {
  switch (monitor.internalState) {
    case "operational":
      return "operational";
    case "verifying_failure":
      return opts.exposeVerifyingAsDegraded
        ? "degraded_performance"
        : "operational";
    case "degraded":
    case "recovering":
      return "degraded_performance";
    case "down":
      // A confirmed-down critical component is a major outage; a non-critical
      // one is a partial outage (the service still mostly works).
      return monitor.isCritical ? "major_outage" : "partial_outage";
    case "maintenance":
      return "under_maintenance";
    case "unknown":
    default:
      // Unknown is not a confirmed outage. Reflected as operational for the
      // live badge; the uptime history shows the real no-data gap.
      return "operational";
  }
}

export interface ComponentStateInput {
  mode: ComponentCalculationMode;
  monitors: MappedMonitorState[];
  /** Active manual override, when set and unexpired. */
  manualStatus?: PublicComponentState | null;
  exposeVerifyingAsDegraded?: boolean;
}

/**
 * Compute a component's public state from its calculation mode and mapped
 * monitors. Returns `operational` for a component with no mapped monitors and
 * no manual status (nothing to report), which the management UI flags for the
 * operator so it is a deliberate choice, not a hidden gap.
 */
export function computeComponentState(
  input: ComponentStateInput,
): PublicComponentState {
  const opts = {
    exposeVerifyingAsDegraded: input.exposeVerifyingAsDegraded,
  };

  // Manual override wins whenever present, regardless of mode.
  if (input.manualStatus) return input.manualStatus;
  if (input.mode === "manual") return "operational";

  const monitors = input.monitors;
  if (monitors.length === 0) return "operational";

  const mapped = monitors.map((m) => ({
    state: monitorToPublicState(m, opts),
    isCritical: m.isCritical,
  }));

  if (input.mode === "primary") {
    return mapped[0]?.state ?? "operational";
  }

  if (input.mode === "majority") {
    const counts = new Map<PublicComponentState, number>();
    for (const m of mapped) counts.set(m.state, (counts.get(m.state) ?? 0) + 1);
    let winner: PublicComponentState = "operational";
    let best = -1;
    for (const [state, count] of counts) {
      // On a tie, prefer the more severe state (honest, not flattering).
      if (count > best || (count === best && componentSeverity(state) > componentSeverity(winner))) {
        winner = state;
        best = count;
      }
    }
    return winner;
  }

  // any_critical (default): most severe state among critical monitors; if
  // there are no critical monitors, fall back to the most severe of all.
  const critical = mapped.filter((m) => m.isCritical);
  const pool = critical.length > 0 ? critical : mapped;
  return pool.reduce<PublicComponentState>(
    (acc, m) => moreSevereComponent(acc, m.state),
    "operational",
  );
}

/** Map a component severity onto the overall vocabulary. */
function componentToOverall(state: PublicComponentState): OverallState {
  switch (state) {
    case "major_outage":
      return "major_outage";
    case "partial_outage":
      return "partial_outage";
    case "degraded_performance":
      return "degraded";
    case "under_maintenance":
      return "maintenance";
    case "operational":
    default:
      return "operational";
  }
}

const OVERALL_SEVERITY: Record<OverallState, number> = {
  operational: 0,
  maintenance: 1,
  degraded: 2,
  partial_outage: 3,
  major_outage: 4,
};

/**
 * Compute the overall page state from visible component states plus whether
 * any published maintenance is active. Maintenance only surfaces when nothing
 * worse is happening: an active maintenance window never hides a confirmed
 * outage on an unrelated component.
 */
export function computeOverallState(input: {
  componentStates: PublicComponentState[];
  hasActiveMaintenance?: boolean;
}): OverallState {
  let overall: OverallState = "operational";
  for (const state of input.componentStates) {
    const mapped = componentToOverall(state);
    if (OVERALL_SEVERITY[mapped] > OVERALL_SEVERITY[overall]) overall = mapped;
  }
  if (input.hasActiveMaintenance && OVERALL_SEVERITY[overall] < OVERALL_SEVERITY.maintenance) {
    overall = "maintenance";
  }
  return overall;
}

/** Shared status-badge vocabulary for reusing the design system colors. */
export function overallToBadgeStatus(
  state: OverallState,
): "operational" | "degraded" | "down" | "maintenance" {
  switch (state) {
    case "operational":
      return "operational";
    case "degraded":
      return "degraded";
    case "maintenance":
      return "maintenance";
    case "partial_outage":
    case "major_outage":
    default:
      return "down";
  }
}

export function componentToBadgeStatus(
  state: PublicComponentState,
): "operational" | "degraded" | "down" | "maintenance" {
  switch (state) {
    case "operational":
      return "operational";
    case "degraded_performance":
      return "degraded";
    case "under_maintenance":
      return "maintenance";
    case "partial_outage":
    case "major_outage":
    default:
      return "down";
  }
}
