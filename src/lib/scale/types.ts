/**
 * Phase 20 controlled-scale types.
 * Retained growth over vanity traffic. No second affiliate ledger.
 */

export type ScaleGateStatus =
  | "not_eligible"
  | "stabilizing"
  | "eligible_limited"
  | "eligible_channel_expansion"
  | "eligible_accelerated"
  | "paused"
  | "restricted";

export type ScaleStageKey =
  | "baseline"
  | "limited_validation"
  | "repeatable_acquisition"
  | "channel_expansion"
  | "controlled_acceleration";

export type ChannelType =
  | "organic_search"
  | "documentation"
  | "glossary"
  | "blog"
  | "comparison"
  | "free_tool"
  | "affiliate"
  | "customer_referral"
  | "partnership"
  | "marketplace"
  | "product_launch"
  | "founder_social"
  | "community"
  | "sponsorship"
  | "paid_search"
  | "paid_social"
  | "direct"
  | "unknown";

export type ChannelState =
  | "researching"
  | "preparing"
  | "limited_test"
  | "validating"
  | "repeatable"
  | "scaling"
  | "holding"
  | "paused"
  | "rejected"
  | "retired";

export type CampaignStatus =
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "stopped"
  | "archived";

export type PartnerStatus =
  | "proposed"
  | "diligence"
  | "legal_review"
  | "security_review"
  | "approved"
  | "active"
  | "paused"
  | "rejected"
  | "terminated";

export type PartnerModel =
  | "educational"
  | "referral"
  | "integration"
  | "agency"
  | "community";

export type DataCompleteness =
  | "complete"
  | "partial"
  | "delayed"
  | "rebuilding"
  | "unavailable"
  | "stale";

export type ForecastScenario = "conservative" | "base" | "accelerated";

export type HiringCategory =
  | "support"
  | "engineering"
  | "content"
  | "growth"
  | "operations";

export interface MetricMeta {
  calculationVersion: string;
  cohortDate: string | null;
  currency: string;
  billingStateFilter: string;
  activationDefinitionVersion: string;
  retentionDefinitionVersion: string;
  refundTreatment: string;
  cancellationTreatment: string;
  completeness: DataCompleteness;
  immatureCohort: boolean;
  label: string;
}

export interface ScaleBlocker {
  id: string;
  title: string;
  domain: "phase18" | "phase19" | "product" | "customer" | "economics" | "operations";
  severity: "critical" | "high" | "medium" | "low";
  link: string;
  status: "open" | "mitigating" | "resolved";
}

export interface ScaleStageDefinition {
  stage: 0 | 1 | 2 | 3 | 4;
  key: ScaleStageKey;
  name: string;
  entryCriteria: string[];
  maxTraffic: string;
  maxBudget: string;
  supportRequirements: string[];
  infrastructureRequirements: string[];
  primaryMetrics: string[];
  guardrails: string[];
  stopConditions: string[];
  reviewCadence: string;
  approvalRequired: boolean;
}

export interface ChannelRecord {
  key: string;
  name: string;
  type: ChannelType;
  state: ChannelState;
  decisionReason: string;
  owner: string;
  budgetCapCents: number | null;
  volumeCap: number | null;
  reviewDate: string;
  primaryMetric: string;
  guardrails: string[];
  stopConditions: string[];
}

export interface ChannelScorecard {
  channel: ChannelRecord;
  visitors: number | null;
  qualifiedVisitors: number | null;
  signups: number | null;
  paidOrganizations: number;
  activatedOrganizations: number;
  day7Retained: number;
  day30Retained: number | null;
  mrrCents: number;
  retainedMrrCents: number;
  refundsCents: number;
  chargebacks: number;
  supportContacts: number;
  securityAbuseEvents: number;
  costCents: number;
  activatedCacCents: number | null;
  retainedCacCents: number | null;
  paybackMonths: number | null;
  contributionCents: number | null;
  confidence: "low" | "medium" | "high";
  completeness: DataCompleteness;
  meta: MetricMeta;
}
