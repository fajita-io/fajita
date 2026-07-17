/**
 * The Fajita incident state machine, in pure TypeScript.
 *
 * This is the canonical, documented, unit-tested transition table. The runtime
 * evaluator lives in SQL (app.evaluate_check_result) for transactional and
 * concurrency guarantees; this module mirrors its rules so the logic can be
 * tested deterministically and replayed in the internal incident lab.
 *
 * EVALUATION VERSION 1. If you change transitions here, change the SQL
 * evaluator in the same migration series and bump EVALUATION_VERSION.
 *
 * Core principle: one bad request is noise, a confirmed outage is a signal.
 */

import type {
  Eligibility,
  MonitorCriticality,
  OperationalState,
  Severity,
} from "./constants";

/** Allowed monitor operational-state transitions. Anything else is rejected. */
export const ALLOWED_TRANSITIONS: Record<OperationalState, OperationalState[]> = {
  operational: ["verifying_failure", "maintenance", "unknown"],
  verifying_failure: ["operational", "degraded", "down", "maintenance", "unknown"],
  degraded: ["recovering", "down", "operational", "maintenance", "unknown"],
  down: ["recovering", "degraded", "maintenance", "unknown"],
  recovering: ["operational", "degraded", "down", "maintenance", "unknown"],
  maintenance: ["operational", "verifying_failure", "degraded", "down", "unknown"],
  unknown: ["operational", "verifying_failure", "degraded", "down", "maintenance"],
};

export function isValidTransition(from: OperationalState, to: OperationalState): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

const FLAP_WINDOW_MS = 15 * 60 * 1000;
const FLAP_THRESHOLD = 4;

// --- Classification (mirror of app.result_eligibility / failure_family) ---

const CONFIG_CATEGORIES = new Set([
  "invalid_configuration",
  "unsupported_scheme",
  "redirect_blocked",
  "redirect_limit",
  "response_too_large",
  "blocked_destination",
]);

const ELIGIBLE_CATEGORIES = new Set([
  "dns_failure",
  "connection_refused",
  "connection_reset",
  "connect_timeout",
  "tls_failure",
  "tls_expired",
  "tls_hostname_mismatch",
  "response_timeout",
  "unexpected_status",
  "invalid_json",
  "assertion_failed",
  "heartbeat_missed",
]);

export function resultEligibility(status: string, category: string | null): Eligibility {
  if (status === "success") return "success";
  if (status === "canceled" || category === "canceled") return "ignore";
  if (category === "worker_error") return "platform";
  if (category && CONFIG_CATEGORIES.has(category)) return "config";
  if (category && ELIGIBLE_CATEGORIES.has(category)) return "eligible";
  if (status === "blocked") return "config";
  if (status === "failure" || status === "timed_out" || status === "error") return "eligible";
  return "ignore";
}

export function failureFamily(status: string, category: string | null): string {
  if (status === "success") return "none";
  if (category === "response_timeout" || category === "connect_timeout") return "timeout";
  if (category === "tls_failure" || category === "tls_expired" || category === "tls_hostname_mismatch") {
    return "tls";
  }
  if (category === "assertion_failed" || category === "invalid_json") return "assertion";
  if (category === "heartbeat_missed") return "heartbeat";
  return "availability";
}

export function operationalFromFailure(
  category: string | null,
  httpStatus: number | null | undefined,
): Extract<OperationalState, "degraded" | "down"> {
  if (
    httpStatus != null &&
    httpStatus >= 200 &&
    httpStatus <= 399 &&
    (category === "assertion_failed" || category === "invalid_json" || category === "response_timeout")
  ) {
    return "degraded";
  }
  return "down";
}

export function incidentSeverity(
  criticality: MonitorCriticality,
  operational: "degraded" | "down",
  affectedCount: number,
): Severity {
  if (affectedCount >= 4) return "critical";
  if (operational === "down" && criticality === "critical") return "critical";
  if (operational === "down") return "major";
  if (operational === "degraded" && (criticality === "critical" || criticality === "high")) return "major";
  return "minor";
}

// --- Pure evaluator (mirror of app.evaluate_check_result) ---

export interface EngineConfig {
  failureThreshold: number;
  recoveryThreshold: number;
  reopenWindowSeconds: number;
  criticality: MonitorCriticality;
  incidentSuppressed: boolean;
}

export interface OperationalSnapshot {
  state: OperationalState;
  activeIncident: boolean;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  recentTransitionCount: number;
  recentWindowStartedAt: number | null;
  flapping: boolean;
  lastResolvedAt: number | null;
}

export interface CheckInput {
  status: string;
  category?: string | null;
  httpStatus?: number | null;
  at: number;
  maintenanceSuppress?: boolean;
}

export type EvalAction =
  | "operational"
  | "verifying"
  | "incident_opened"
  | "incident_reopened"
  | "incident_continued"
  | "recovery_started"
  | "recovering"
  | "resolved"
  | "maintenance_suppressed"
  | "platform_uncertainty"
  | "config_ignored"
  | "ignored"
  | "monitor_suppressed";

export interface EvalOutcome {
  next: OperationalSnapshot;
  action: EvalAction;
  transition: { from: OperationalState; to: OperationalState } | null;
}

export function initialSnapshot(): OperationalSnapshot {
  return {
    state: "operational",
    activeIncident: false,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
    recentTransitionCount: 0,
    recentWindowStartedAt: null,
    flapping: false,
    lastResolvedAt: null,
  };
}

/**
 * Deterministic single-step evaluation used by tests and the incident lab.
 * Semantics intentionally match the SQL evaluator; it does not persist events.
 */
export function evaluate(
  prev: OperationalSnapshot,
  input: CheckInput,
  config: EngineConfig,
): EvalOutcome {
  const from = prev.state;
  const s: OperationalSnapshot = { ...prev };
  const elig = resultEligibility(input.status, input.category ?? null);

  const effectiveFailureThreshold = Math.max(
    config.failureThreshold - (config.criticality === "critical" ? 1 : 0),
    1,
  );
  const effectiveRecoveryThreshold = config.recoveryThreshold + (s.flapping ? 2 : 0);

  if (input.maintenanceSuppress && !s.activeIncident) {
    s.state = "maintenance";
    return { next: s, action: "maintenance_suppressed", transition: mkT(from, "maintenance") };
  }

  if (elig === "success") {
    if (s.activeIncident) {
      s.consecutiveFailures = 0;
      s.consecutiveSuccesses += 1;
      if (s.consecutiveSuccesses >= effectiveRecoveryThreshold) {
        s.state = "operational";
        s.activeIncident = false;
        s.consecutiveSuccesses = 0;
        s.flapping = false;
        s.lastResolvedAt = input.at;
        return { next: s, action: "resolved", transition: mkT(from, "operational") };
      }
      const started = from !== "recovering";
      s.state = "recovering";
      return {
        next: s,
        action: started ? "recovery_started" : "recovering",
        transition: started ? mkT(from, "recovering") : null,
      };
    }
    s.state = "operational";
    s.consecutiveFailures = 0;
    s.consecutiveSuccesses += 1;
    return { next: s, action: "operational", transition: from !== "operational" ? mkT(from, "operational") : null };
  }

  if (elig === "ignore") return { next: s, action: "ignored", transition: null };
  if (elig === "config") return { next: s, action: "config_ignored", transition: null };

  if (elig === "platform") {
    if (!s.activeIncident && from === "operational") {
      s.state = "unknown";
      return { next: s, action: "platform_uncertainty", transition: mkT(from, "unknown") };
    }
    return { next: s, action: "platform_uncertainty", transition: null };
  }

  // eligible failure
  const opTarget = operationalFromFailure(input.category ?? null, input.httpStatus);

  if (config.incidentSuppressed && !s.activeIncident) {
    s.state = "verifying_failure";
    s.consecutiveFailures += 1;
    s.consecutiveSuccesses = 0;
    return { next: s, action: "monitor_suppressed", transition: from !== "verifying_failure" ? mkT(from, "verifying_failure") : null };
  }

  if (s.activeIncident) {
    const wasRecovering = from === "recovering";
    s.consecutiveFailures += 1;
    s.consecutiveSuccesses = 0;
    if (wasRecovering) {
      s.recentTransitionCount += 1;
      s.recentWindowStartedAt = s.recentWindowStartedAt ?? input.at;
    }
    s.state = opTarget;
    if (
      s.recentWindowStartedAt != null &&
      s.recentWindowStartedAt > input.at - FLAP_WINDOW_MS &&
      s.recentTransitionCount >= FLAP_THRESHOLD
    ) {
      s.flapping = true;
    }
    return { next: s, action: "incident_continued", transition: from !== opTarget ? mkT(from, opTarget) : null };
  }

  s.consecutiveFailures += 1;
  s.consecutiveSuccesses = 0;

  if (s.consecutiveFailures < effectiveFailureThreshold) {
    s.state = "verifying_failure";
    return { next: s, action: "verifying", transition: from !== "verifying_failure" ? mkT(from, "verifying_failure") : null };
  }

  const withinReopen =
    s.lastResolvedAt != null && input.at - s.lastResolvedAt <= config.reopenWindowSeconds * 1000;
  s.state = opTarget;
  s.activeIncident = true;
  s.lastResolvedAt = null;
  return {
    next: s,
    action: withinReopen ? "incident_reopened" : "incident_opened",
    transition: mkT(from, opTarget),
  };
}

function mkT(from: OperationalState, to: OperationalState) {
  return { from, to };
}
