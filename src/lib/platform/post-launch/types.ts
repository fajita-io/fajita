/**
 * Phase 19 post-launch operating system types.
 * Growth work is gated on Phase 18 Ready or Conditionally Ready.
 */

import type { LaunchBlocker, ReadinessClassification } from "@/lib/platform/readiness";

export type Phase19Authorization =
  | "authorized"
  | "conditionally_authorized"
  | "blocked";

export type PrerequisiteSeverity = "critical" | "high" | "info";

export type PrerequisiteStatus = "pass" | "fail" | "unknown" | "not_applicable";

export interface Phase19Prerequisite {
  id: string;
  title: string;
  severity: PrerequisiteSeverity;
  status: PrerequisiteStatus;
  /** Linked Phase 18 blocker IDs when failed. */
  blockerIds: string[];
  evidence: string;
  notes?: string;
}

export interface Phase19PrerequisiteResult {
  authorization: Phase19Authorization;
  authorizationLabel: string;
  phase18Classification: ReadinessClassification;
  phase18ClassificationLabel: string;
  launchStage: string;
  evaluatedAt: string;
  prerequisites: Phase19Prerequisite[];
  failedCritical: Phase19Prerequisite[];
  failedHigh: Phase19Prerequisite[];
  linkedBlockers: LaunchBlocker[];
  /** Explicit operator guidance while blocked. */
  blockedActions: string[];
  allowedWhileBlocked: string[];
  nextSteps: string[];
}

export type StabilizationPhase =
  | "pre_launch"
  | "intensive_72h"
  | "launch_14d"
  | "controlled_30d"
  | "normal";

export interface StabilizationWindow {
  phase: StabilizationPhase;
  phaseLabel: string;
  /** True when noncritical product changes must freeze. */
  changeFreeze: boolean;
  /** True when conversion / pricing / onboarding experiments may run. */
  experimentsEligible: boolean;
  /** True when intentional traffic expansion is allowed. */
  trafficExpansionEligible: boolean;
  notes: string[];
}

export type GuardedAction =
  | "start_experiment"
  | "change_onboarding"
  | "change_pricing"
  | "expand_feature_availability"
  | "increase_traffic"
  | "lifecycle_experiment"
  | "advocacy_outreach";

export interface GuardDecision {
  action: GuardedAction;
  allowed: boolean;
  reason: string;
  authorization: Phase19Authorization;
  stabilizationPhase: StabilizationPhase;
}
