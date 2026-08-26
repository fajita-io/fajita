import { DOC_CATEGORY_META, MODEL_ORDER } from "./categories";
import type { DocCategory, DocModel } from "./frontmatter";
import type { DocPage } from "./types";

import { gettingStartedPages } from "./content/getting-started";
import { monitorsPages } from "./content/monitors";
import { assertionsPages } from "./content/assertions";
import { incidentsPages } from "./content/incidents";
import { alertsPages } from "./content/alerts";
import { webhooksPages } from "./content/webhooks";
import { statusAndSubscriberPages } from "./content/status-and-subscribers";
import { teamsBillingAffiliatePages } from "./content/teams-billing-affiliates";
import { securityPrivacyAccountPages } from "./content/security-privacy-account";
import { troubleshootingMigrationReferencePages } from "./content/troubleshooting-migrations-reference";
import { selfHostingPages } from "./content/self-hosting";
import { openSourcePages } from "./content/open-source";

/**
 * Single source of truth for the documentation platform. Navigation, search,
 * the sitemap, raw routes, and the AI-readable files are all generated from
 * this array. Adding a page is one import plus one push.
 */
const ALL_PAGES: DocPage[] = [
  ...gettingStartedPages,
  ...monitorsPages,
  ...assertionsPages,
  ...incidentsPages,
  ...alertsPages,
  ...webhooksPages,
  ...statusAndSubscriberPages,
  ...teamsBillingAffiliatePages,
  ...securityPrivacyAccountPages,
  ...troubleshootingMigrationReferencePages,
  ...selfHostingPages,
  ...openSourcePages,
];

/* ------------------------------------------------------------------ */
/* Integrity checks (run once at module load; fail the build loudly)   */
/* ------------------------------------------------------------------ */

function assertIntegrity(pages: DocPage[]): void {
  const seen = new Set<string>();
  for (const page of pages) {
    const slug = page.meta.slug;
    if (seen.has(slug)) {
      throw new Error(`Duplicate docs slug: "${slug}"`);
    }
    seen.add(slug);
  }
  // Drop related-page references that do not resolve yet, so incomplete
  // content never dead-ends navigation or fails the production build.
  const missingRelated: string[] = [];
  for (const page of pages) {
    const valid = page.meta.relatedPages.filter((related) => {
      if (seen.has(related)) return true;
      missingRelated.push(`${page.meta.slug} -> ${related}`);
      return false;
    });
    if (valid.length !== page.meta.relatedPages.length) {
      page.meta.relatedPages = valid;
    }
    if (
      page.meta.deprecated &&
      page.meta.replacementSlug &&
      !seen.has(page.meta.replacementSlug)
    ) {
      throw new Error(
        `Deprecated page "${page.meta.slug}" points to missing replacement "${page.meta.replacementSlug}"`,
      );
    }
  }
  if (missingRelated.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn(
      `[docs] ${missingRelated.length} related-page reference(s) skipped:\n  ${missingRelated.join("\n  ")}`,
    );
  }
}

assertIntegrity(ALL_PAGES);

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

const BY_SLUG = new Map(ALL_PAGES.map((p) => [p.meta.slug, p]));

export function allDocs(): DocPage[] {
  return ALL_PAGES;
}

/** Public, indexable, published pages (excludes drafts and deprecated). */
export function publicDocs(): DocPage[] {
  return ALL_PAGES.filter((p) => p.meta.status === "published");
}

/** Pages eligible for AI-readable output (llms-full, raw, manifest). */
export function llmDocs(): DocPage[] {
  return ALL_PAGES.filter(
    (p) => p.meta.llmInclude && p.meta.status === "published" && !p.meta.noindex,
  );
}

export function getDoc(slug: string): DocPage | undefined {
  return BY_SLUG.get(slug);
}

export function docsInCategory(category: DocCategory): DocPage[] {
  return ALL_PAGES.filter((p) => p.meta.category === category).sort(
    (a, b) => a.meta.order - b.meta.order,
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface NavLink {
  slug: string;
  title: string;
  deprecated: boolean;
}

export interface NavCategory {
  id: DocCategory;
  label: string;
  links: NavLink[];
}

export interface NavModel {
  model: DocModel;
  categories: NavCategory[];
}

/**
 * Sidebar tree grouped by mental model, then category, then page. Drafts are
 * excluded; deprecated pages are kept but flagged so they can be de-emphasized.
 */
export function buildNavigation(): NavModel[] {
  const models: NavModel[] = [];
  for (const model of MODEL_ORDER) {
    const categories = Object.values(DOC_CATEGORY_META)
      .filter((c) => c.model === model)
      .sort((a, b) => a.order - b.order)
      .map<NavCategory>((c) => ({
        id: c.id,
        label: c.label,
        links: docsInCategory(c.id)
          .filter((p) => p.meta.status !== "draft")
          .map((p) => ({
            slug: p.meta.slug,
            title: p.meta.title,
            deprecated: p.meta.deprecated,
          })),
      }))
      .filter((c) => c.links.length > 0);
    if (categories.length > 0) models.push({ model, categories });
  }
  return models;
}

/** Flat, ordered list of published pages for previous/next navigation. */
export function orderedPublicSlugs(): string[] {
  const slugs: string[] = [];
  for (const nav of buildNavigation()) {
    for (const cat of nav.categories) {
      for (const link of cat.links) {
        const page = BY_SLUG.get(link.slug);
        if (page && page.meta.status === "published") slugs.push(link.slug);
      }
    }
  }
  return slugs;
}

export function prevNext(slug: string): { prev?: NavLink; next?: NavLink } {
  const order = orderedPublicSlugs();
  const idx = order.indexOf(slug);
  if (idx === -1) return {};
  const toLink = (s?: string): NavLink | undefined => {
    if (!s) return undefined;
    const page = BY_SLUG.get(s)!;
    return { slug: s, title: page.meta.title, deprecated: page.meta.deprecated };
  };
  return { prev: toLink(order[idx - 1]), next: toLink(order[idx + 1]) };
}

export function breadcrumbs(slug: string): { label: string; href: string }[] {
  const page = BY_SLUG.get(slug);
  const crumbs = [{ label: "Docs", href: "/docs" }];
  if (!page) return crumbs;
  const cat = DOC_CATEGORY_META[page.meta.category];
  crumbs.push({ label: cat.label, href: `/docs#${cat.id}` });
  crumbs.push({ label: page.meta.title, href: `/docs/${page.meta.slug}` });
  return crumbs;
}
