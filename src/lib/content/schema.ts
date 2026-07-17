import { z } from "zod";

/**
 * Shared content-growth schema (Phase 15). One typed registry drives blog
 * articles, comparisons, free tools, research, search, sitemaps, AI files,
 * and editorial health checks.
 */

export const CONTENT_VERSION = "2026-07-17";

export const CONTENT_TYPES = [
  "article",
  "comparison",
  "tool",
  "research",
  "topic-hub",
  "methodology",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_STATUSES = [
  "proposed",
  "prioritized",
  "researching",
  "outlining",
  "drafting",
  "technical-review",
  "editorial-review",
  "product-review",
  "security-review",
  "legal-review",
  "comparison-fact-review",
  "tool-qa",
  "research-privacy-review",
  "approved",
  "scheduled",
  "published",
  "updating",
  "corrected",
  "data-insufficient",
  "collecting",
  "analysis",
  "deprecated",
  "archived",
  "retracted",
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const ARTICLE_TYPES = [
  "definitive-guide",
  "operating-framework",
  "technical-tutorial",
  "troubleshooting",
  "incident-communication",
  "founder-operations",
  "research",
  "product-update",
] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

export const BLOG_CATEGORIES = [
  "monitoring",
  "incident-response",
  "status-pages",
  "alerts-integrations",
  "apis-webhooks",
  "ssl-dns",
  "cron-scheduled-jobs",
  "reliability-metrics",
  "founder-operations",
  "research",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const SEARCH_INTENTS = [
  "learn",
  "how-to",
  "troubleshoot",
  "compare",
  "calculate",
  "choose",
  "research",
  "reference",
] as const;
export type ContentSearchIntent = (typeof SEARCH_INTENTS)[number];

export const FUNNEL_STAGES = [
  "awareness",
  "education",
  "evaluation",
  "activation",
  "retention",
] as const;
export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const CTA_VARIANTS = [
  "start-monitoring",
  "publish-status-page",
  "create-heartbeat",
  "review-documentation",
  "use-free-tool",
  "compare-plans",
  "none",
] as const;
export type ContentCtaVariant = (typeof CTA_VARIANTS)[number];

export const COMPARISON_TYPES = [
  "versus",
  "alternative",
  "category",
  "status-page",
] as const;
export type ComparisonType = (typeof COMPARISON_TYPES)[number];

export const RESEARCH_TYPES = [
  "benchmark",
  "state-of-reliability",
  "technical-experiment",
  "survey",
  "dataset",
] as const;
export type ResearchType = (typeof RESEARCH_TYPES)[number];

export const FACT_CONFIDENCE = ["high", "medium", "low", "unknown"] as const;
export type FactConfidence = (typeof FACT_CONFIDENCE)[number];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const kebab = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");

const internalHref = z
  .string()
  .regex(/^\/[a-z0-9\-/#]+$/);

export const relatedLinkSchema = z.object({
  href: internalHref,
  label: z.string().min(2).max(100),
});

export const citationSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(160),
  href: z.string().url().or(z.string().regex(/^https?:\/\//)),
  accessedAt: isoDate,
  note: z.string().max(400).optional(),
});

export const claimSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(4).max(400),
  classification: z.enum([
    "stable-fact",
    "product-fact",
    "competitor-fact",
    "calculation",
    "opinion",
    "recommendation",
    "inference",
    "research-finding",
  ]),
  citationIds: z.array(z.string()).default([]),
  verifiedAt: isoDate.optional(),
});

const baseContentFields = {
  id: z.string().min(2).max(80),
  slug: kebab,
  title: z.string().min(8).max(120),
  description: z.string().min(40).max(160),
  status: z.enum(CONTENT_STATUSES),
  topicCluster: z.string().min(2).max(80),
  primaryQuery: z.string().min(3).max(120),
  secondaryQueries: z.array(z.string()).default([]),
  searchIntent: z.enum(SEARCH_INTENTS),
  audience: z.string().min(2).max(120),
  funnelStage: z.enum(FUNNEL_STAGES),
  author: kebab,
  owner: z.string().min(2),
  reviewers: z.array(z.string()).default([]),
  publishedAt: isoDate.optional(),
  updatedAt: isoDate,
  lastReviewedAt: isoDate,
  nextReviewDue: isoDate,
  contentVersion: z.string().min(1),
  productVersion: z.string().min(1),
  canonical: z.boolean().default(true),
  redirects: z.array(kebab).default([]),
  indexable: z.boolean().default(true),
  featured: z.boolean().default(false),
  relatedContent: z.array(kebab).default([]),
  relatedDocs: z.array(relatedLinkSchema).default([]),
  relatedGlossary: z.array(kebab).default([]),
  relatedTools: z.array(kebab).default([]),
  relatedComparisons: z.array(kebab).default([]),
  productCta: z.enum(CTA_VARIANTS).default("none"),
  claims: z.array(claimSchema).default([]),
  citations: z.array(citationSchema).default([]),
  llmInclude: z.boolean().default(true),
  noindex: z.boolean().default(false),
  deprecated: z.boolean().default(false),
  replacementSlug: kebab.optional(),
  originalContribution: z.string().min(20).max(400),
  changeSummary: z.string().max(400).optional(),
};

export const articleFrontmatterSchema = z.object({
  ...baseContentFields,
  contentType: z.literal("article"),
  articleType: z.enum(ARTICLE_TYPES),
  category: z.enum(BLOG_CATEGORIES),
  readingMinutes: z.number().int().min(2).max(60),
  thesis: z.string().min(40).max(600),
  deepGuide: z.boolean().default(false),
  requiresSecurityReview: z.boolean().default(false),
  requiresLegalReview: z.boolean().default(false),
  requiresProductReview: z.boolean().default(true),
  technicalReviewPassed: z.boolean().default(false),
  editorialReviewPassed: z.boolean().default(false),
  productReviewPassed: z.boolean().default(false),
  securityReviewPassed: z.boolean().default(false),
  originalityReviewPassed: z.boolean().default(false),
  antiAiSlopPassed: z.boolean().default(false),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export const comparisonFrontmatterSchema = z.object({
  ...baseContentFields,
  contentType: z.literal("comparison"),
  comparisonType: z.enum(COMPARISON_TYPES),
  competitorName: z.string().min(2).max(80).optional(),
  competitorSlug: kebab.optional(),
  summary: z.string().min(40).max(600),
  fajitaBestFor: z.string().min(20).max(400),
  competitorBestFor: z.string().min(20).max(400).optional(),
  fajitaLimitations: z.array(z.string()).min(1),
  competitorStrengths: z.array(z.string()).min(1).optional(),
  methodologySlug: kebab.default("comparison-methodology"),
  pricingStatus: z.enum(["verified", "unknown", "link-only"]).default("unknown"),
  trademarkNotice: z.string().min(20).max(400),
  factIds: z.array(z.string()).default([]),
  technicalReviewPassed: z.boolean().default(false),
  editorialReviewPassed: z.boolean().default(false),
  productReviewPassed: z.boolean().default(false),
  comparisonFactReviewPassed: z.boolean().default(false),
  originalityReviewPassed: z.boolean().default(false),
  antiAiSlopPassed: z.boolean().default(false),
});

export type ComparisonFrontmatter = z.infer<typeof comparisonFrontmatterSchema>;

export const toolFrontmatterSchema = z.object({
  ...baseContentFields,
  contentType: z.literal("tool"),
  toolId: kebab,
  networkAccess: z.boolean(),
  storesInput: z.boolean(),
  clientSideOnly: z.boolean(),
  privacySummary: z.string().min(40).max(400),
  methodologySummary: z.string().min(40).max(600),
  limitations: z.array(z.string()).min(1),
  securityReviewPassed: z.boolean().default(false),
  privacyReviewPassed: z.boolean().default(false),
  calculationTestsPassed: z.boolean().default(false),
  accessibilityReviewPassed: z.boolean().default(false),
  antiAiSlopPassed: z.boolean().default(false),
});

export type ToolFrontmatter = z.infer<typeof toolFrontmatterSchema>;

export const researchFrontmatterSchema = z.object({
  ...baseContentFields,
  contentType: z.literal("research"),
  researchType: z.enum(RESEARCH_TYPES),
  researchQuestion: z.string().min(20).max(400),
  dateRangeStart: isoDate.optional(),
  dateRangeEnd: isoDate.optional(),
  organizationCount: z.number().int().min(0).optional(),
  minimumCohort: z.number().int().min(1).default(50),
  privacyReviewPassed: z.boolean().default(false),
  methodologyComplete: z.boolean().default(false),
  limitations: z.array(z.string()).default([]),
  retractionNotice: z.string().max(800).optional(),
});

export type ResearchFrontmatter = z.infer<typeof researchFrontmatterSchema>;

export const competitorFactSchema = z.object({
  id: z.string().min(2),
  competitor: z.string().min(2).max(80),
  productArea: z.string().min(2).max(80),
  fact: z.string().min(4).max(400),
  sourceUrl: z.string().url(),
  sourceType: z.enum([
    "official-pricing",
    "official-docs",
    "official-marketing",
    "official-changelog",
    "other-primary",
  ]),
  dateVerified: isoDate,
  reviewer: z.string().min(2),
  confidence: z.enum(FACT_CONFIDENCE),
  effectiveDate: isoDate.optional(),
  expirationReviewDate: isoDate,
  notes: z.string().max(400).optional(),
  public: z.boolean().default(true),
  usedByPages: z.array(kebab).default([]),
});

export type CompetitorFact = z.infer<typeof competitorFactSchema>;

export const authorSchema = z.object({
  slug: kebab,
  name: z.string().min(2).max(80),
  role: z.string().min(2).max(80),
  bio: z.string().min(40).max(400),
  expertise: z.array(z.string()).min(1),
  organizationAuthor: z.boolean().default(true),
  socialUrl: z.string().url().optional(),
});

export type ContentAuthor = z.infer<typeof authorSchema>;
