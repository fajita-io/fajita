/**
 * Scale-readiness gate. Product health and Phase 18/19 prerequisites dominate
 * channel ambition. Do not scale an unstable or Not Ready system.
 */

import {
  getStabilizationWindow,
  isPhase19GrowthAuthorized,
} from "@/lib/platform/post-launch";
import {
  classificationLabel,
  computeClassification,
  openCriticalBlockers,
} from "@/lib/platform/readiness";

import type { ScaleBlocker, ScaleGateStatus } from "./types";

/**
 * True only when Phase 19 growth is authorized and the stabilization clock
 * has started (not pre_launch). Currently false while Phase 18 is Not Ready.
 */
export function isPhase19StabilizationActive(): boolean {
  if (!isPhase19GrowthAuthorized()) return false;
  return getStabilizationWindow().phase !== "pre_launch";
}

/** @deprecated Prefer isPhase19StabilizationActive(). Kept for scale fixtures. */
export const PHASE19_STABILIZATION_ACTIVE = false;

export const PHASE19_HANDOFF_LINK = "/docs/handoff/phase-19-handoff.md";

export const SCALE_READINESS_VERSION = "scale-readiness-v1";

export interface ScaleReadinessResult {
  gateStatus: ScaleGateStatus;
  phase18Classification: ReturnType<typeof computeClassification>;
  phase18Label: string;
  phase19StabilizationActive: boolean;
  productStable: boolean;
  customerEvidenceReady: boolean;
  economicsReady: boolean;
  operationsReady: boolean;
  blockers: ScaleBlocker[];
  canIncreasePaidTraffic: boolean;
  canLaunchPartnerCampaign: boolean;
  canAdvancePastStage0: boolean;
  evaluatedAt: string;
  calculationVersion: string;
  authorizationSummary: string;
}

function buildBlockers(): ScaleBlocker[] {
  const blockers: ScaleBlocker[] = [];
  const phase18 = computeClassification();

  if (phase18 !== "ready" && phase18 !== "conditionally_ready") {
    blockers.push({
      id: "SB-001",
      title: "Phase 18 production readiness is Not Ready",
      domain: "phase18",
      severity: "critical",
      link: "/internal/readiness",
      status: "open",
    });
  }

  if (!isPhase19StabilizationActive()) {
    blockers.push({
      id: "SB-002",
      title: "Phase 19 post-launch stabilization is not active",
      domain: "phase19",
      severity: "critical",
      link: "/internal/post-launch/overview",
      status: "open",
    });
  }

  for (const b of openCriticalBlockers()) {
    blockers.push({
      id: `SB-P18-${b.id}`,
      title: b.title,
      domain: "phase18",
      severity: "critical",
      link: `/internal/readiness`,
      status: b.status === "open" || b.status === "mitigating" ? "open" : "resolved",
    });
  }

  blockers.push({
    id: "SB-003",
    title: "Live activation and retention baselines not yet established",
    domain: "customer",
    severity: "high",
    link: "/internal/product/activation",
    status: "open",
  });

  blockers.push({
    id: "SB-004",
    title: "Cost-to-serve and contribution baselines incomplete",
    domain: "economics",
    severity: "high",
    link: "/internal/costs",
    status: "open",
  });

  return blockers;
}

export function evaluateScaleReadiness(
  now: Date = new Date(),
): ScaleReadinessResult {
  const phase18 = computeClassification();
  const phase18Label = classificationLabel(phase18);
  const blockers = buildBlockers();
  const criticalOpen = blockers.filter(
    (b) => b.severity === "critical" && b.status === "open",
  );

  const productStable = criticalOpen.filter((b) => b.domain === "product").length === 0
    && phase18 !== "not_ready";
  const customerEvidenceReady = !blockers.some(
    (b) => b.id === "SB-003" && b.status === "open",
  );
  const economicsReady = !blockers.some(
    (b) => b.id === "SB-004" && b.status === "open",
  );
  const phase19Active = isPhase19StabilizationActive();
  const operationsReady =
    phase19Active &&
    (phase18 === "ready" || phase18 === "conditionally_ready");

  let gateStatus: ScaleGateStatus = "not_eligible";

  if (phase18 === "not_ready" || criticalOpen.length > 0) {
    gateStatus = "not_eligible";
  } else if (!phase19Active) {
    gateStatus = "stabilizing";
  } else if (!customerEvidenceReady || !economicsReady) {
    gateStatus = "stabilizing";
  } else if (productStable && operationsReady) {
    gateStatus = "eligible_limited";
  }

  // Hard stop while prerequisites fail. Keep advance flags false until both
  // Phase 18 and Phase 19 clear, even if intermediate gateStatus improves.
  return {
    gateStatus,
    phase18Classification: phase18,
    phase18Label,
    phase19StabilizationActive: phase19Active,
    productStable: false,
    customerEvidenceReady,
    economicsReady,
    operationsReady: false,
    blockers,
    canIncreasePaidTraffic: false,
    canLaunchPartnerCampaign: false,
    canAdvancePastStage0: false,
    evaluatedAt: now.toISOString(),
    calculationVersion: SCALE_READINESS_VERSION,
    authorizationSummary:
      "Phase 20 scale authorization: BLOCKED. Keep existing acquisition pace. Do not intentionally increase paid, affiliate, partner, referral, or high-volume organic traffic until Phase 18 is Ready or Conditionally Ready and Phase 19 stabilization is active.",
  };
}

export function gateStatusLabel(status: ScaleGateStatus): string {
  switch (status) {
    case "not_eligible":
      return "Not eligible";
    case "stabilizing":
      return "Stabilizing";
    case "eligible_limited":
      return "Eligible for limited scale";
    case "eligible_channel_expansion":
      return "Eligible for channel expansion";
    case "eligible_accelerated":
      return "Eligible for accelerated scale";
    case "paused":
      return "Paused";
    case "restricted":
      return "Restricted";
  }
}

/** Campaign / partner launch must fail closed while gate is blocked. */
export function assertScaleActionAllowed(action: string): {
  allowed: boolean;
  reason: string;
} {
  const readiness = evaluateScaleReadiness();
  if (
    readiness.gateStatus === "not_eligible" ||
    readiness.gateStatus === "paused" ||
    readiness.gateStatus === "restricted" ||
    readiness.gateStatus === "stabilizing"
  ) {
    return {
      allowed: false,
      reason: `Action "${action}" blocked. Gate status: ${gateStatusLabel(readiness.gateStatus)}. ${readiness.authorizationSummary}`,
    };
  }
  return { allowed: true, reason: "Gate permits limited action with approval." };
}
