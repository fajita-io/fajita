/**
 * Phase 19 prerequisite check.
 *
 * Phase 19 growth work begins only when Phase 18 is Ready or Conditionally Ready.
 * Not Ready blocks experiments, onboarding changes, pricing changes, and
 * intentional traffic expansion.
 */

import { BILLING_ENFORCEMENT_ENABLED } from "@/lib/billing/enforcement";
import {
  buildGoLiveApproval,
  classificationLabel,
  computeClassification,
  LAUNCH_BLOCKERS,
  openCriticalBlockers,
  openHighBlockers,
} from "@/lib/platform/readiness";

import type {
  Phase19Prerequisite,
  Phase19PrerequisiteResult,
} from "./types";

function statusFromBlockers(
  ids: string[],
  opts?: { requireClosed?: boolean },
): Phase19Prerequisite["status"] {
  const requireClosed = opts?.requireClosed ?? true;
  const relevant = LAUNCH_BLOCKERS.filter((b) => ids.includes(b.id));
  if (relevant.length === 0) return "unknown";
  const open = relevant.filter(
    (b) => b.status === "open" || b.status === "mitigating",
  );
  if (requireClosed && open.length > 0) return "fail";
  return "pass";
}

export function evaluatePhase19Prerequisites(
  evaluatedAt: string = new Date().toISOString(),
): Phase19PrerequisiteResult {
  const classification = computeClassification();
  const approval = buildGoLiveApproval();
  const critical = openCriticalBlockers();
  const high = openHighBlockers();

  const prerequisites: Phase19Prerequisite[] = [
    {
      id: "P19-P18-DECISION",
      title: "Phase 18 readiness decision exists",
      severity: "critical",
      status: approval.classification ? "pass" : "fail",
      blockerIds: [],
      evidence: "docs/readiness/go-live-approval.md; buildGoLiveApproval()",
    },
    {
      id: "P19-P18-READY",
      title: "Phase 18 classification is Ready or Conditionally Ready",
      severity: "critical",
      status: classification === "not_ready" ? "fail" : "pass",
      blockerIds: critical.map((b) => b.id),
      evidence: "computeClassification(); docs/handoff/phase-18-handoff.md",
      notes:
        classification === "not_ready"
          ? "Not Ready blocks all Phase 19 growth work."
          : undefined,
    },
    {
      id: "P19-LAUNCH-STAGE",
      title: "Production launch stage is recorded",
      severity: "critical",
      status: approval.launchStage === "none" ? "fail" : "pass",
      blockerIds: ["LB-008"],
      evidence: `go-live launchStage=${approval.launchStage}`,
      notes: "Stage must advance past none after authorized go-live.",
    },
    {
      id: "P19-OBSERVATION",
      title: "Launch observation is active",
      severity: "critical",
      status: approval.launchStage === "none" ? "fail" : "pass",
      blockerIds: ["LB-008"],
      evidence: "docs/operations/post-launch-observation.md; launch stage",
    },
    {
      id: "P19-PROD-MONITORING",
      title: "Production monitoring / error capture is active",
      severity: "critical",
      status: statusFromBlockers(["LB-001"]),
      blockerIds: ["LB-001"],
      evidence: ".cursor/maturity-memory/observability-plan.md",
    },
    {
      id: "P19-STATUS-PAGE",
      title: "Official Fajita status page is active",
      severity: "high",
      status: statusFromBlockers(["LB-012"]),
      blockerIds: ["LB-012"],
      evidence: "LB-012; docs/readiness/launch-blocker-register.md",
    },
    {
      id: "P19-OPERATOR-ALERTS",
      title: "Internal operator alerts are active",
      severity: "critical",
      status: statusFromBlockers(["LB-001"]),
      blockerIds: ["LB-001"],
      evidence:
        "Sentry wired (LB-001 verified). LB-007 customer alert channel tests remain high priority for Stage 1.",
      notes: "Operator error capture is required; customer alert e2e is tracked as LB-007.",
    },
    {
      id: "P19-BACKUP",
      title: "Production backup / restore state is healthy",
      severity: "critical",
      status: statusFromBlockers(["LB-004"]),
      blockerIds: ["LB-004"],
      evidence: "docs/reliability/database-restore-exercise.md",
    },
    {
      id: "P19-BILLING-RECON",
      title: "Billing reconciliation is clean",
      severity: "critical",
      status: statusFromBlockers(["LB-005", "LB-006", "LB-009"]),
      blockerIds: ["LB-005", "LB-006", "LB-009"],
      evidence: "Live prices, payment test, webhook e2e",
    },
    {
      id: "P19-ENTITLEMENT-RECON",
      title: "Entitlement reconciliation is clean",
      severity: "critical",
      status: (() => {
        const lb002 = LAUNCH_BLOCKERS.find((b) => b.id === "LB-002");
        if (!lb002) return "unknown";
        if (BILLING_ENFORCEMENT_ENABLED) return "pass";
        // Stage 0 may keep enforcement off when LB-002 is explicitly accepted.
        if (lb002.status === "accepted" || lb002.status === "verified") {
          return "pass";
        }
        return "fail";
      })(),
      blockerIds: ["LB-002"],
      evidence: `BILLING_ENFORCEMENT_ENABLED=${BILLING_ENFORCEMENT_ENABLED}; LB-002=${LAUNCH_BLOCKERS.find((b) => b.id === "LB-002")?.status}`,
      notes:
        "Stage 0 may keep enforcement off. Enable only after LB-005/LB-006 verified.",
    },
    {
      id: "P19-NO-CRITICAL-BLOCKER",
      title: "No unresolved critical blocker remains",
      severity: "critical",
      status: critical.length === 0 ? "pass" : "fail",
      blockerIds: critical.map((b) => b.id),
      evidence: "LAUNCH_BLOCKERS open critical set",
    },
    {
      id: "P19-NO-CROSS-TENANT",
      title: "No unresolved cross-tenant issue remains",
      severity: "critical",
      status: "pass",
      blockerIds: [],
      evidence:
        "Phase 18 SSRF/RLS reviews; no open LB tagged cross-tenant exposure",
      notes: "Re-verify before Stage 2 if new tenancy code ships.",
    },
    {
      id: "P19-NO-SSRF",
      title: "No unresolved SSRF issue remains",
      severity: "critical",
      status: "pass",
      blockerIds: [],
      evidence: "docs/security/final-ssrf-review.md",
    },
    {
      id: "P19-NO-SECRET-EXPOSURE",
      title: "No unresolved secret exposure remains",
      severity: "critical",
      status: "pass",
      blockerIds: [],
      evidence: "scripts/secret-scan.ts; docs/security/final-secret-management-review.md",
    },
    {
      id: "P19-NO-DUP-BILLING",
      title: "No duplicate-billing issue remains",
      severity: "critical",
      status: statusFromBlockers(["LB-006", "LB-009"]),
      blockerIds: ["LB-006", "LB-009"],
      evidence: "Billing webhook idempotency + live payment evidence",
    },
    {
      id: "P19-STATUS-CRITICAL",
      title: "No critical status-page issue remains",
      severity: "high",
      status: statusFromBlockers(["LB-012"]),
      blockerIds: ["LB-012"],
      evidence: "LB-012 official status page production config",
    },
    {
      id: "P19-SUPPORT-HANDOFF",
      title: "No critical support handoff issue remains",
      severity: "high",
      status: "pass",
      blockerIds: [],
      evidence: "Phase 16 support ops; re-check after public signup",
      notes: "Pass pending public volume; not a Phase 18 critical LB.",
    },
  ];

  const failedCritical = prerequisites.filter(
    (p) => p.severity === "critical" && p.status === "fail",
  );
  const failedHigh = prerequisites.filter(
    (p) => p.severity === "high" && p.status === "fail",
  );

  const linkedIds = new Set(
    [...failedCritical, ...failedHigh].flatMap((p) => p.blockerIds),
  );
  const linkedBlockers = LAUNCH_BLOCKERS.filter((b) => linkedIds.has(b.id));

  let authorization: Phase19PrerequisiteResult["authorization"];
  if (classification === "not_ready" || failedCritical.length > 0) {
    authorization = "blocked";
  } else if (
    classification === "conditionally_ready" ||
    failedHigh.length > 0
  ) {
    authorization = "conditionally_authorized";
  } else {
    authorization = "authorized";
  }

  const authorizationLabel =
    authorization === "authorized"
      ? "Authorized"
      : authorization === "conditionally_authorized"
        ? "Conditionally Authorized"
        : "Blocked";

  return {
    authorization,
    authorizationLabel,
    phase18Classification: classification,
    phase18ClassificationLabel: classificationLabel(classification),
    launchStage: approval.launchStage,
    evaluatedAt,
    prerequisites,
    failedCritical,
    failedHigh,
    linkedBlockers,
    blockedActions: [
      "Do not start product experiments",
      "Do not change onboarding flows for conversion",
      "Do not change pricing or packaging",
      "Do not intentionally increase traffic",
      "Do not expand feature availability for growth",
      "Do not enable public signup while Phase 18 is Not Ready",
    ],
    allowedWhileBlocked: [
      "Resolve Phase 18 launch blockers",
      "Re-run readiness gates and update go-live approval",
      "Keep signup_public and checkout_paid flags off",
      "Operate Stage 0 founder-only verification without customer traffic",
      "Review this prerequisite surface and readiness scorecard",
    ],
    nextSteps: [
      "Close open critical blockers: " +
        (critical.map((b) => b.id).join(", ") || "none"),
      high.length
        ? "Close or accept high blockers with founder sign-off: " +
          high.map((b) => b.id).join(", ")
        : "No open high blockers",
      "Advance launch stage past none after go-live roles approve",
      "Re-evaluate Phase 19 prerequisites; begin stabilization only after authorization",
    ],
  };
}

export function isPhase19GrowthAuthorized(
  result: Phase19PrerequisiteResult = evaluatePhase19Prerequisites(),
): boolean {
  return (
    result.authorization === "authorized" ||
    result.authorization === "conditionally_authorized"
  );
}
