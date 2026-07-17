/**
 * Phase 18 production-readiness governance types.
 * Source of truth for /internal/readiness and exported docs under docs/readiness/.
 */

export type ReadinessDomain =
  | "security"
  | "privacy"
  | "legal"
  | "reliability"
  | "performance"
  | "accessibility"
  | "operations"
  | "launch"
  | "transfer"
  | "billing"
  | "product";

export type GateStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "passed_with_condition"
  | "failed"
  | "blocked"
  | "not_applicable"
  | "accepted_risk";

export type GateSeverity = "critical" | "high" | "medium" | "low";

export type BlockerSeverity = "critical" | "high" | "medium" | "low";

export type BlockerStatus =
  | "open"
  | "mitigating"
  | "fixed"
  | "verified"
  | "accepted"
  | "closed";

export type ReadinessClassification =
  | "ready"
  | "conditionally_ready"
  | "not_ready";

export interface ReadinessGate {
  id: string;
  domain: ReadinessDomain;
  title: string;
  severity: GateSeverity;
  status: GateStatus;
  evidence: string;
  owner: string;
  lastTested: string | null;
  expiration: string | null;
  blocking: boolean;
  relatedIssue: string | null;
  relatedRunbook: string | null;
  requiredApproval: string | null;
  notes?: string;
}

export interface LaunchBlocker {
  id: string;
  title: string;
  domain: ReadinessDomain;
  severity: BlockerSeverity;
  description: string;
  customerImpact: string;
  businessImpact: string;
  securityImpact: string;
  reproduction: string;
  evidence: string;
  owner: string;
  targetDate: string | null;
  mitigation: string;
  verificationTest: string;
  status: BlockerStatus;
  acceptedRisk: boolean;
  approval: string | null;
  closedDate: string | null;
}

export interface AcceptedRisk {
  id: string;
  risk: string;
  severity: BlockerSeverity;
  evidence: string;
  whyNotFixed: string;
  mitigation: string;
  monitoring: string;
  owner: string;
  expiration: string;
  reviewDate: string;
  approver: string;
}

export interface KnownLimitation {
  id: string;
  limitation: string;
  productArea: string;
  impact: string;
  workaround: string;
  customerFacingDisclosure: string;
  owner: string;
  priority: "p0" | "p1" | "p2" | "p3";
  plannedReview: string;
  acceptedRisk: boolean;
  publicSafe: boolean;
}

export interface GoLiveApproval {
  classification: ReadinessClassification;
  decidedAt: string;
  decidedBy: string;
  launchStage: "none" | "stage_0" | "stage_1" | "stage_2" | "stage_3";
  launchDate: string | null;
  conditions: string[];
  stopConditionsOwner: string;
  rollbackOwner: string;
  observationPeriod: string;
  productOwner: "approved" | "rejected" | "pending";
  engineeringOwner: "approved" | "rejected" | "pending";
  securityOwner: "approved" | "rejected" | "pending";
  privacyOwner: "approved" | "rejected" | "pending";
  billingOwner: "approved" | "rejected" | "pending";
  operationsOwner: "approved" | "rejected" | "pending";
  rationale: string[];
  confirmationNoHiddenFailures: true;
  confirmationNoUnsupportedClaims: true;
}
