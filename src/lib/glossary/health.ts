import type { GlossaryCategory } from "./frontmatter";
import type { GlossaryTerm } from "./types";

/**
 * Review cadence and staleness detection for glossary terms.
 */

const QUARTERLY_CATEGORIES = new Set<GlossaryCategory>([
  "apis-webhooks",
  "teams-operations",
]);

const ANNUAL_HINTS = new Set([
  "api",
  "dns",
  "http-status-code",
  "json-response",
  "latency",
  "reliability",
]);

export type Cadence = "quarterly" | "semiannual" | "annual";

export function reviewCadence(term: GlossaryTerm): Cadence {
  if (
    term.meta.requiresLegalReview ||
    term.meta.requiresSecurityReview ||
    QUARTERLY_CATEGORIES.has(term.meta.category)
  ) {
    return "quarterly";
  }
  if (ANNUAL_HINTS.has(term.meta.slug)) return "annual";
  return "semiannual";
}

export function isStale(term: GlossaryTerm, today = new Date()): boolean {
  const due = new Date(`${term.meta.nextReviewDue}T00:00:00Z`);
  return due.getTime() < today.getTime();
}

export interface QualityScore {
  /** Internal only. Never expose publicly. */
  total: number;
  dimensions: Record<string, number>;
}

/** Heuristic editorial quality score (0–100). Does not publish content. */
export function qualityScore(term: GlossaryTerm): QualityScore {
  const dimensions: Record<string, number> = {};
  const bodyText = term.body
    .map((b) => ("text" in b ? String(b.text) : ""))
    .join(" ");
  const words = bodyText.split(/\s+/).filter(Boolean).length;

  dimensions.definitionClarity = term.meta.shortDefinition.length >= 60 ? 10 : 5;
  dimensions.shortAnswer =
    term.meta.shortAnswer.split(/\s+/).length >= 35 &&
    term.meta.shortAnswer.split(/\s+/).length <= 70
      ? 10
      : 4;
  dimensions.depth = words >= 450 ? 10 : words >= 300 ? 6 : 2;
  dimensions.relatedTerms = term.meta.relatedTerms.length >= 2 ? 10 : 3;
  dimensions.documentation =
    term.meta.documentationLinks.length > 0 || term.meta.cta === "none" ? 10 : 4;
  dimensions.metadata =
    term.meta.owner && term.meta.lastReviewedAt && term.meta.contentVersion
      ? 10
      : 2;
  dimensions.freshness = isStale(term) ? 2 : 10;
  dimensions.intent = term.meta.searchIntent ? 10 : 0;
  dimensions.example = bodyText.toLowerCase().includes("example.com") ? 10 : 6;

  const total = Object.values(dimensions).reduce((a, b) => a + b, 0);
  return { total, dimensions };
}
