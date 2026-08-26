import { z } from "zod";

import type { OrgRole, Permission } from "@/lib/auth/roles";
import type { PlanId } from "@/lib/stripe/plans";

/**
 * Frontmatter schema for a documentation page. Validated at build time by
 * the registry so a page can never ship without an owner or review date, and
 * so navigation, search, sitemap, and AI-readable files can be generated from
 * one typed source of truth.
 */

export const DOCS_VERSION = "2026-07-17";

export const DOC_CATEGORIES = [
  "getting-started",
  "monitors",
  "assertions",
  "incidents",
  "alerts",
  "integrations",
  "status-pages",
  "subscribers",
  "maintenance",
  "teams",
  "billing",
  "affiliates",
  "security",
  "privacy",
  "webhooks",
  "troubleshooting",
  "migrations",
  "account",
  "reference",
  "self-hosting",
  "open-source",
] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

/** The four customer mental models used for top-level grouping. */
export const DOC_MODELS = ["learn", "build", "operate", "reference"] as const;
export type DocModel = (typeof DOC_MODELS)[number];

export const DOC_PAGE_TYPES = [
  "concept",
  "task",
  "reference",
  "troubleshooting",
  "policy",
  "migration",
  "overview",
] as const;
export type DocPageType = (typeof DOC_PAGE_TYPES)[number];

export const DOC_STATUSES = ["published", "draft", "deprecated"] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];

export const DOC_DIFFICULTIES = ["intro", "core", "advanced"] as const;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const frontmatterSchema = z.object({
  /** Route slug relative to /docs, e.g. "monitors/website-monitoring". */
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    "slug must be lowercase kebab-case, optionally nested with '/'"),
  title: z.string().min(3).max(80),
  description: z.string().min(20).max(200),
  category: z.enum(DOC_CATEGORIES),
  model: z.enum(DOC_MODELS),
  pageType: z.enum(DOC_PAGE_TYPES),
  /** Sort order within its category. */
  order: z.number().int().nonnegative(),
  status: z.enum(DOC_STATUSES).default("published"),
  difficulty: z.enum(DOC_DIFFICULTIES).default("core"),
  /** Human estimate, e.g. "4 min". Never claim a measured time we did not measure. */
  estimatedTime: z.string().optional(),
  productArea: z.array(z.string()).default([]),
  /** Minimum org role required for the described action, if any. */
  requiredRole: z.custom<OrgRole>().optional(),
  requiredPermission: z.custom<Permission>().optional(),
  /** Plans on which the described capability is available. */
  requiredPlans: z.array(z.custom<PlanId>()).optional(),
  prerequisites: z.array(z.string()).default([]),
  relatedPages: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  /** Manual ranking nudge (0 = neutral). Small values only. */
  searchBoost: z.number().min(-5).max(5).default(0),
  lastReviewedAt: isoDate,
  owner: z.string().min(2),
  reviewers: z.array(z.string()).default([]),
  productVersion: z.string(),
  docsVersion: z.string().default(DOCS_VERSION),
  deprecated: z.boolean().default(false),
  replacementSlug: z.string().optional(),
  noindex: z.boolean().default(false),
  /** Include this page in llms-full.txt / raw routes / manifest. */
  llmInclude: z.boolean().default(true),
});

export type DocFrontmatter = z.infer<typeof frontmatterSchema>;
