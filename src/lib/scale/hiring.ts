import type { HiringCategory } from "./types";

export interface HiringTrigger {
  triggerKey: string;
  category: HiringCategory;
  label: string;
  satisfied: boolean;
  evidence: string[];
  fourWeekTrend: string;
  budgetAvailable: boolean;
  owner: string;
  reviewDate: string;
}

export const HIRING_TRIGGERS: HiringTrigger[] = [
  {
    triggerKey: "support_backlog_unsafe",
    category: "support",
    label: "Support backlog consistently exceeds safe threshold",
    satisfied: false,
    evidence: ["No four-week production trend yet (pre-launch / Stage 0)"],
    fourWeekTrend: "insufficient_data",
    budgetAvailable: false,
    owner: "founder",
    reviewDate: "2026-08-15",
  },
  {
    triggerKey: "engineering_reliability_overload",
    category: "engineering",
    label: "Monitoring reliability work exceeds founder capacity",
    satisfied: false,
    evidence: ["Phase 18 critical blockers still open; hire only with role evidence"],
    fourWeekTrend: "insufficient_data",
    budgetAvailable: false,
    owner: "founder",
    reviewDate: "2026-08-15",
  },
  {
    triggerKey: "content_decay",
    category: "content",
    label: "Strategic content decays without editorial capacity",
    satisfied: false,
    evidence: ["Organic retained channel not yet proven at scale"],
    fourWeekTrend: "insufficient_data",
    budgetAvailable: false,
    owner: "founder",
    reviewDate: "2026-09-01",
  },
  {
    triggerKey: "growth_ops_repeatable",
    category: "growth",
    label: "Repeatable retained channel consumes founder capacity",
    satisfied: false,
    evidence: ["No channel in repeatable state under Stage 0"],
    fourWeekTrend: "n/a",
    budgetAvailable: false,
    owner: "founder",
    reviewDate: "2026-09-01",
  },
  {
    triggerKey: "operations_billing_load",
    category: "operations",
    label: "Billing/affiliate ops consume material recurring time",
    satisfied: false,
    evidence: ["Volume still founder-scale"],
    fourWeekTrend: "insufficient_data",
    budgetAvailable: false,
    owner: "founder",
    reviewDate: "2026-09-01",
  },
];

export interface RoleScorecard {
  roleKey: string;
  mission: string;
  outcomes: string[];
  first30: string[];
  first60: string[];
  first90: string[];
  responsibilities: string[];
  nonResponsibilities: string[];
  requiredSkills: string[];
  securityRequirements: string[];
  accessLevel: string;
  metrics: string[];
  budgetCents: number | null;
  contractorVsEmployee: string;
  hiringTriggerKey: string;
  status: "draft" | "proposed" | "approved" | "hired" | "deferred" | "rejected";
}

export const ROLE_SCORECARDS: RoleScorecard[] = [
  {
    roleKey: "support_operator",
    mission: "Keep customer support response quality high as volume grows",
    outcomes: [
      "Open backlog within threshold",
      "Accurate product answers without inventing claims",
    ],
    first30: ["Shadow founder support", "Learn runbooks", "Document gaps"],
    first60: ["Own triage hours", "Escalate security/billing correctly"],
    first90: ["Independent coverage windows", "Improve macros"],
    responsibilities: ["Triage", "Handoffs", "Macro hygiene"],
    nonResponsibilities: [
      "Infrastructure capacity changes",
      "Pricing changes",
      "Public claims",
    ],
    requiredSkills: ["Clear writing", "Uptime product literacy", "Calm under load"],
    securityRequirements: ["MFA", "Least privilege", "No shared credentials"],
    accessLevel: "support role only",
    metrics: ["Median response time", "Reopen rate", "CSAT where measured"],
    budgetCents: null,
    contractorVsEmployee: "Contractor first for bounded hours",
    hiringTriggerKey: "support_backlog_unsafe",
    status: "draft",
  },
];

export function triggersByCategory(category: HiringCategory): HiringTrigger[] {
  return HIRING_TRIGGERS.filter((t) => t.category === category);
}

export function anyHiringTriggerSatisfied(): boolean {
  return HIRING_TRIGGERS.some((t) => t.satisfied && t.budgetAvailable);
}
