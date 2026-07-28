import { z } from "zod";

/**
 * Frontmatter schema for a glossary term. One typed registry drives pages,
 * search, sitemap, AI files, redirects, and editorial health checks.
 */

export const GLOSSARY_VERSION = "2026-07-17";

export const GLOSSARY_CATEGORIES = [
  "monitoring",
  "incidents",
  "alerts",
  "status-pages",
  "apis-webhooks",
  "ssl-dns",
  "performance",
  "reliability-metrics",
  "scheduled-jobs",
  "teams-operations",
] as const;
export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export const GLOSSARY_STATUSES = [
  "proposed",
  "draft",
  "technical-review",
  "editorial-review",
  "approved",
  "published",
  "updating",
  "deprecated",
  "archived",
] as const;
export type GlossaryStatus = (typeof GLOSSARY_STATUSES)[number];

export const SEARCH_INTENTS = [
  "definition",
  "explanation",
  "calculation",
  "troubleshooting-concept",
  "implementation-concept",
  "reliability-metric",
  "security-concept",
  "operational-process",
] as const;
export type SearchIntent = (typeof SEARCH_INTENTS)[number];

export const CTA_VARIANTS = [
  "monitor",
  "alert",
  "status-page",
  "documentation",
  "none",
] as const;
export type CtaVariant = (typeof CTA_VARIANTS)[number];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const kebab = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");

export const termFrontmatterSchema = z.object({
  id: z.string().min(2).max(80),
  term: z.string().min(2).max(80),
  slug: kebab,
  /** One-sentence definition for cards, search, and structured data. */
  shortDefinition: z.string().min(40).max(280),
  /** Snippet-ready answer (35–70 words), shown near the top of the page. */
  shortAnswer: z.string().min(120).max(520),
  category: z.enum(GLOSSARY_CATEGORIES),
  secondaryCategories: z.array(z.enum(GLOSSARY_CATEGORIES)).default([]),
  acronym: z.string().optional(),
  expandedName: z.string().optional(),
  synonyms: z.array(z.string()).default([]),
  relatedTerms: z.array(kebab).default([]),
  broaderTerms: z.array(kebab).default([]),
  narrowerTerms: z.array(kebab).default([]),
  oppositeTerms: z.array(kebab).default([]),
  confusedWith: z.array(kebab).default([]),
  productAreas: z.array(z.string()).default([]),
  documentationLinks: z
    .array(
      z.object({
        href: z.string().regex(/^\/docs(?:\/[a-z0-9\-/]+)?(?:#[a-z0-9\-]+)?$/),
        label: z.string().min(2).max(80),
      }),
    )
    .default([]),
  productLinks: z
    .array(
      z.object({
        href: z.string().regex(/^\/(?:features|pricing|integrations|security|legal)(?:\/[a-z0-9\-/]+)?$/),
        label: z.string().min(2).max(80),
      }),
    )
    .default([]),
  searchIntent: z.enum(SEARCH_INTENTS),
  primaryQuery: z.string().min(3).max(120),
  secondaryQueries: z.array(z.string()).default([]),
  status: z.enum(GLOSSARY_STATUSES).default("published"),
  owner: z.string().min(2),
  reviewers: z.array(z.string()).default([]),
  lastReviewedAt: isoDate,
  nextReviewDue: isoDate,
  contentVersion: z.string().min(1),
  productVersion: z.string().min(1),
  glossaryVersion: z.string().default(GLOSSARY_VERSION),
  technicalStandardRefs: z.array(z.string()).default([]),
  structuredDataType: z
    .enum(["DefinedTerm", "Article"])
    .default("DefinedTerm"),
  featured: z.boolean().default(false),
  foundational: z.boolean().default(false),
  llmInclude: z.boolean().default(true),
  indexable: z.boolean().default(true),
  canonical: z.boolean().default(true),
  redirects: z.array(kebab).default([]),
  cta: z.enum(CTA_VARIANTS).default("none"),
  requiresLegalReview: z.boolean().default(false),
  requiresSecurityReview: z.boolean().default(false),
  searchBoost: z.number().min(-5).max(5).default(0),
  /** SEO title override; otherwise derived from the term. */
  title: z.string().min(10).max(70).optional(),
  /** Meta description; defaults to shortDefinition truncated. */
  description: z.string().min(40).max(160).optional(),
  noindex: z.boolean().default(false),
  deprecated: z.boolean().default(false),
  replacementSlug: kebab.optional(),
  cluster: z.string().optional(),
});

export type TermFrontmatter = z.infer<typeof termFrontmatterSchema>;
