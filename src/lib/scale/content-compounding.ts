export type ContentClassification =
  | "foundational"
  | "high_intent"
  | "educational"
  | "comparison"
  | "tool"
  | "research"
  | "supporting"
  | "underperforming"
  | "decaying"
  | "updating"
  | "merging"
  | "retiring";

export type ContentTier = 1 | 2 | 3 | 4 | 5;

export interface ContentInvestmentRecord {
  contentKey: string;
  path: string;
  tier: ContentTier;
  classification: ContentClassification;
  owner: string;
  nextReviewDate: string;
  notes: string;
}

export const CONTENT_TIER_LABELS: Record<ContentTier, string> = {
  1: "Strategic pillars",
  2: "High-intent supporting",
  3: "Authority and education",
  4: "Experimental",
  5: "Retire or consolidate",
};

export const CONTENT_REFRESH_TRIGGERS = [
  "Ranking decline",
  "CTR decline",
  "Product behavior change",
  "Pricing change",
  "Documentation change",
  "Competitor fact change",
  "Broken links",
  "Negative feedback",
  "AI citation inaccuracy",
  "Search-intent drift",
  "Conversion decline",
  "Retention-quality decline",
];

export const CLUSTER_EXPANSION_RULES = [
  "Existing pillar is strong",
  "Supporting intent is distinct",
  "Product relationship is clear",
  "Internal-link plan exists",
  "Quality resources exist",
  "No cannibalization",
  "Editorial capacity exists",
  "Customer evidence supports the topic",
];

export const CONTENT_INVESTMENT_SEED: ContentInvestmentRecord[] = [
  {
    contentKey: "home",
    path: "/",
    tier: 1,
    classification: "foundational",
    owner: "founder",
    nextReviewDate: "2026-08-01",
    notes: "Primary conversion corridor; not an article farm",
  },
  {
    contentKey: "pricing",
    path: "/pricing",
    tier: 1,
    classification: "high_intent",
    owner: "founder",
    nextReviewDate: "2026-08-01",
    notes: "Claims and plan truth must stay current",
  },
  {
    contentKey: "docs_index",
    path: "/docs",
    tier: 2,
    classification: "supporting",
    owner: "founder",
    nextReviewDate: "2026-08-15",
    notes: "Activation and support burden reduction",
  },
];
