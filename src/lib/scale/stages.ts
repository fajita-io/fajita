import type { ScaleStageDefinition, ScaleStageKey } from "./types";
import { evaluateScaleReadiness } from "./readiness";

export const SCALE_STAGES: ScaleStageDefinition[] = [
  {
    stage: 0,
    key: "baseline",
    name: "Baseline operations",
    entryCriteria: [
      "Default after Phase 20 ships",
      "Existing customers and organic traffic only",
      "No intentional traffic acceleration",
    ],
    maxTraffic: "Current organic + existing affiliate only",
    maxBudget: "$0 incremental paid / partner launch budget",
    supportRequirements: ["Founder coverage for existing volume"],
    infrastructureRequirements: ["Current worker and DB headroom documented"],
    primaryMetrics: ["Product reliability", "Billing reconciliation", "Support backlog"],
    guardrails: [
      "No paid campaign launch",
      "No partner launch spikes",
      "No referral prompt ramp",
    ],
    stopConditions: [
      "Critical production incident",
      "Billing or entitlement reconciliation unclean",
      "Monitoring queue or alert delivery degradation",
      "Support capacity unsafe",
    ],
    reviewCadence: "Weekly scale review",
    approvalRequired: false,
  },
  {
    stage: 1,
    key: "limited_validation",
    name: "Limited channel validation",
    entryCriteria: [
      "Scale gate Eligible for limited scale",
      "Phase 18 Ready or Conditionally Ready",
      "Phase 19 stabilization active",
      "Activation and Day-7 retention baselines available",
      "One or two channels with explicit stop conditions",
    ],
    maxTraffic: "Small cohort caps per channel experiment",
    maxBudget: "Per-campaign total test cap with daily cap",
    supportRequirements: ["Documented coverage hours for test volume"],
    infrastructureRequirements: ["Campaign capacity reservation approved"],
    primaryMetrics: [
      "Activated paid organizations",
      "Day-7 retained paid organizations",
      "Activated CAC",
      "Support contacts per organization",
    ],
    guardrails: [
      "Clicks are not a win condition",
      "Weekly review mandatory",
      "Hard stop on refund / abuse spikes",
    ],
    stopConditions: [
      "Activation below threshold",
      "Retention below threshold",
      "Retained CAC above ceiling",
      "Capacity or support warning",
      "Gate moves to Paused or Restricted",
    ],
    reviewCadence: "Weekly",
    approvalRequired: true,
  },
  {
    stage: 2,
    key: "repeatable_acquisition",
    name: "Repeatable acquisition",
    entryCriteria: [
      "Proven activation for the channel",
      "Proven early retention",
      "Known cost and support burden",
      "Repeatable campaign or distribution process",
    ],
    maxTraffic: "Repeatable volume within capacity reservation",
    maxBudget: "Approved recurring budget with retained-CAC ceiling",
    supportRequirements: ["Support burden within model"],
    infrastructureRequirements: ["Worker and DB below scale threshold"],
    primaryMetrics: ["Retained new MRR", "Day-30 retained CAC", "Contribution estimate"],
    guardrails: ["No stage advance on calendar pressure"],
    stopConditions: [
      "Retained CAC ceiling breached",
      "Payback ceiling breached",
      "Concentration risk accepted without mitigation",
    ],
    reviewCadence: "Weekly + monthly economics",
    approvalRequired: true,
  },
  {
    stage: 3,
    key: "channel_expansion",
    name: "Channel expansion",
    entryCriteria: [
      "At least one repeatable retained channel",
      "Gate Eligible for channel expansion",
      "Support and infrastructure headroom",
    ],
    maxTraffic: "Additional partners / content / affiliates within caps",
    maxBudget: "Per-channel budgets; limited paid where approved",
    supportRequirements: ["Hiring trigger review if backlog rises"],
    infrastructureRequirements: ["Provider capacity reviewed"],
    primaryMetrics: ["Channel quality scorecards", "Concentration risk", "Net retained MRR"],
    guardrails: ["Do not diversify into weak channels for appearance"],
    stopConditions: [
      "Any critical reliability regression",
      "Affiliate fraud increase",
      "Support hiring trigger unmet with unsafe backlog",
    ],
    reviewCadence: "Weekly + monthly partner/content review",
    approvalRequired: true,
  },
  {
    stage: 4,
    key: "controlled_acceleration",
    name: "Controlled acceleration",
    entryCriteria: [
      "Multiple retained channels",
      "Predictable capacity",
      "Adequate support coverage",
      "Healthy contribution economics",
      "Hiring triggers reviewed",
      "Gate Eligible for accelerated scale",
    ],
    maxTraffic: "Approved multi-channel plan",
    maxBudget: "Quarterly growth plan with stop conditions",
    supportRequirements: ["Staffed for projected volume"],
    infrastructureRequirements: ["Scale thresholds owned with lead times"],
    primaryMetrics: ["Net retained MRR", "Contribution", "Payback", "Capacity headroom"],
    guardrails: ["No autonomous budget expansion", "Human approval for stage spend"],
    stopConditions: [
      "Contribution turns negative without strategic exception",
      "Critical security or tenant isolation issue",
      "Provider hard-limit proximity without upgrade plan",
    ],
    reviewCadence: "Weekly + monthly + quarterly strategy",
    approvalRequired: true,
  },
];

export function getStageDefinition(key: ScaleStageKey): ScaleStageDefinition {
  const found = SCALE_STAGES.find((s) => s.key === key);
  if (!found) throw new Error(`Unknown scale stage: ${key}`);
  return found;
}

export interface CurrentScaleStage {
  stage: 0 | 1 | 2 | 3 | 4;
  key: ScaleStageKey;
  name: string;
  status: "active" | "blocked" | "paused";
  startedAt: string;
  owner: string;
  definition: ScaleStageDefinition;
  advanceBlockedReason: string | null;
}

export function getCurrentScaleStage(): CurrentScaleStage {
  const readiness = evaluateScaleReadiness();
  const definition = getStageDefinition("baseline");
  return {
    stage: 0,
    key: "baseline",
    name: definition.name,
    status: readiness.canAdvancePastStage0 ? "active" : "blocked",
    startedAt: "2026-07-17T00:00:00.000Z",
    owner: "founder",
    definition,
    advanceBlockedReason: readiness.canAdvancePastStage0
      ? null
      : readiness.authorizationSummary,
  };
}

export function canEnterStage(target: ScaleStageKey): {
  allowed: boolean;
  reason: string;
} {
  const readiness = evaluateScaleReadiness();
  if (target === "baseline") {
    return { allowed: true, reason: "Stage 0 is always the safe default." };
  }
  if (!readiness.canAdvancePastStage0) {
    return {
      allowed: false,
      reason: readiness.authorizationSummary,
    };
  }
  const def = getStageDefinition(target);
  return {
    allowed: false,
    reason: `Stage ${def.stage} (${def.name}) requires explicit approval after gate clears. Entry criteria: ${def.entryCriteria.join("; ")}`,
  };
}
