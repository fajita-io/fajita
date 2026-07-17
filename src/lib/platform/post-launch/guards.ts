/**
 * Server-side guards for Phase 19 growth actions.
 * Experiments and conversion changes must not run while blocked.
 */

import { evaluatePhase19Prerequisites } from "./prerequisites";
import { getStabilizationWindow } from "./stabilization";
import type { GuardDecision, GuardedAction } from "./types";

export function evaluateGuardedAction(action: GuardedAction): GuardDecision {
  const prereq = evaluatePhase19Prerequisites();
  const window = getStabilizationWindow();
  const authorization = prereq.authorization;

  if (authorization === "blocked") {
    return {
      action,
      allowed: false,
      reason:
        "Phase 19 is blocked: Phase 18 classification is Not Ready or critical prerequisites failed.",
      authorization,
      stabilizationPhase: window.phase,
    };
  }

  if (window.changeFreeze && action !== "advocacy_outreach") {
    if (
      action === "start_experiment" ||
      action === "change_onboarding" ||
      action === "change_pricing" ||
      action === "lifecycle_experiment" ||
      action === "increase_traffic" ||
      action === "expand_feature_availability"
    ) {
      return {
        action,
        allowed: false,
        reason: `Stabilization phase ${window.phase} freezes noncritical product and growth changes.`,
        authorization,
        stabilizationPhase: window.phase,
      };
    }
  }

  if (action === "start_experiment" || action === "lifecycle_experiment") {
    if (!window.experimentsEligible) {
      return {
        action,
        allowed: false,
        reason:
          "Experiments are eligible only after the first 30 days of controlled learning (normal phase).",
        authorization,
        stabilizationPhase: window.phase,
      };
    }
  }

  if (action === "increase_traffic") {
    if (!window.trafficExpansionEligible) {
      return {
        action,
        allowed: false,
        reason:
          "Intentional traffic expansion requires full authorization and controlled_30d or later.",
        authorization,
        stabilizationPhase: window.phase,
      };
    }
  }

  if (action === "change_pricing") {
    return {
      action,
      allowed: false,
      reason:
        "Pricing changes require pricing-change governance after research evidence. Not available during early Phase 19 scaffolding.",
      authorization,
      stabilizationPhase: window.phase,
    };
  }

  return {
    action,
    allowed: true,
    reason: "Action permitted under current Phase 19 authorization and stabilization window.",
    authorization,
    stabilizationPhase: window.phase,
  };
}

export function assertPhase19GrowthAllowed(action: GuardedAction): void {
  const decision = evaluateGuardedAction(action);
  if (!decision.allowed) {
    throw new Error(`Phase 19 guard blocked ${action}: ${decision.reason}`);
  }
}
