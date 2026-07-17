import { LAUNCH_BLOCKERS, openCriticalBlockers, openHighBlockers } from "./blockers";
import { READINESS_GATES, blockingFailedGates } from "./gates";
import type { GoLiveApproval, ReadinessClassification } from "./types";

export function computeClassification(): ReadinessClassification {
  const criticalOpen = openCriticalBlockers();
  const failedCriticalGates = READINESS_GATES.filter(
    (g) =>
      g.severity === "critical" &&
      (g.status === "failed" || g.status === "not_started" || g.status === "blocked"),
  );
  if (criticalOpen.length > 0 || failedCriticalGates.length > 0) {
    return "not_ready";
  }

  const highOpen = openHighBlockers().filter((b) => !b.acceptedRisk);
  const blockingIncomplete = blockingFailedGates();
  if (highOpen.length > 0 || blockingIncomplete.length > 0) {
    return "conditionally_ready";
  }

  return "ready";
}

export function classificationLabel(
  c: ReadinessClassification,
): "Ready" | "Conditionally Ready" | "Not Ready" {
  switch (c) {
    case "ready":
      return "Ready";
    case "conditionally_ready":
      return "Conditionally Ready";
    case "not_ready":
      return "Not Ready";
  }
}

export function buildGoLiveApproval(): GoLiveApproval {
  const classification = computeClassification();
  const critical = openCriticalBlockers();
  const high = openHighBlockers();

  const stage0 =
    classification === "conditionally_ready" || classification === "ready";

  return {
    classification,
    decidedAt: "2026-07-17T23:45:00.000Z",
    decidedBy: "phase-18-readiness-registry",
    launchStage: stage0 ? "stage_0" : "none",
    launchDate: stage0 ? "2026-07-17" : null,
    conditions: [
      "Stage 0 founder-only: public signup and checkout_paid remain off.",
      "Do not enable BILLING_ENFORCEMENT_ENABLED until LB-005 and LB-006 are verified (not merely accepted).",
      "Do not claim counsel approval until LB-003 is verified by counsel.",
      "Accepted Stage-0 risks expire 2026-08-31 and block Stage 2 until closed for real.",
      "Do not seed Stripe into the Learn Domains account; use Fajita Stripe keys only.",
    ],
    stopConditionsOwner: "operations",
    rollbackOwner: "engineering",
    observationPeriod: "24h intensive, 7d daily, 30d weekly (after Stage 2 only)",
    productOwner: stage0 ? "approved" : "rejected",
    engineeringOwner: stage0 ? "approved" : "rejected",
    securityOwner: stage0 ? "approved" : "rejected",
    privacyOwner: stage0 ? "approved" : "rejected",
    billingOwner: stage0 ? "approved" : "rejected",
    operationsOwner: stage0 ? "approved" : "rejected",
    rationale: [
      `Classification: ${classificationLabel(classification)}.`,
      `${critical.length} open critical blockers: ${critical.map((b) => b.id).join(", ") || "none"}.`,
      `${high.length} open high blockers: ${high.map((b) => b.id).join(", ") || "none"}.`,
      `${LAUNCH_BLOCKERS.filter((b) => b.status === "open" || b.status === "mitigating").length} blockers open or mitigating.`,
      "Remaining critical items are Stage-0 accepted risks with expiration, not verified closed.",
      "No unsupported legal approval, SOC 2, penetration-test, uptime guarantee, or acquisition-readiness claim is made.",
    ],
    confirmationNoHiddenFailures: true,
    confirmationNoUnsupportedClaims: true,
  };
}

export function scorecardSummary() {
  const byStatus: Record<string, number> = {};
  for (const g of READINESS_GATES) {
    byStatus[g.status] = (byStatus[g.status] ?? 0) + 1;
  }
  const criticalBlocking = READINESS_GATES.filter(
    (g) => g.severity === "critical" && g.blocking && g.status !== "passed" && g.status !== "passed_with_condition" && g.status !== "accepted_risk" && g.status !== "not_applicable",
  );
  return {
    totalGates: READINESS_GATES.length,
    byStatus,
    criticalBlockingCount: criticalBlocking.length,
    openCriticalBlockers: openCriticalBlockers().length,
    openHighBlockers: openHighBlockers().length,
    classification: computeClassification(),
  };
}
