import type { DocCategory } from "./frontmatter";
import { allDocs } from "./registry";
import type { DocPage } from "./types";

/**
 * Review cadence by risk. High-risk areas are reviewed after every related
 * product change and at least quarterly; medium every six months; low yearly.
 * Content that exceeds its cadence is flagged stale for editorial review, not
 * auto-unpublished.
 */
const HIGH_RISK: DocCategory[] = ["billing", "webhooks", "subscribers", "affiliates", "security", "privacy"];
const MEDIUM_RISK: DocCategory[] = ["monitors", "alerts", "status-pages", "maintenance", "assertions", "incidents"];

const CADENCE_DAYS: Record<"high" | "medium" | "low", number> = {
  high: 92,
  medium: 183,
  low: 365,
};

export function riskLevel(category: DocCategory): "high" | "medium" | "low" {
  if (HIGH_RISK.includes(category)) return "high";
  if (MEDIUM_RISK.includes(category)) return "medium";
  return "low";
}

export function daysSince(dateIso: string, now = new Date()): number {
  const then = new Date(`${dateIso}T00:00:00Z`).getTime();
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export interface StalePage {
  slug: string;
  title: string;
  category: DocCategory;
  risk: "high" | "medium" | "low";
  lastReviewedAt: string;
  ageDays: number;
  cadenceDays: number;
}

/** Pages whose last review exceeds their risk-based cadence. */
export function stalePages(now = new Date()): StalePage[] {
  const stale: StalePage[] = [];
  for (const page of allDocs()) {
    const risk = riskLevel(page.meta.category);
    const cadenceDays = CADENCE_DAYS[risk];
    const ageDays = daysSince(page.meta.lastReviewedAt, now);
    if (ageDays > cadenceDays) {
      stale.push({
        slug: page.meta.slug,
        title: page.meta.title,
        category: page.meta.category,
        risk,
        lastReviewedAt: page.meta.lastReviewedAt,
        ageDays,
        cadenceDays,
      });
    }
  }
  return stale.sort((a, b) => b.ageDays - a.ageDays);
}

export interface HealthSummary {
  total: number;
  published: number;
  draft: number;
  deprecated: number;
  missingOwner: DocPage[];
  stale: StalePage[];
}

export function healthSummary(now = new Date()): HealthSummary {
  const docs = allDocs();
  return {
    total: docs.length,
    published: docs.filter((d) => d.meta.status === "published").length,
    draft: docs.filter((d) => d.meta.status === "draft").length,
    deprecated: docs.filter((d) => d.meta.deprecated).length,
    missingOwner: docs.filter((d) => !d.meta.owner),
    stale: stalePages(now),
  };
}
