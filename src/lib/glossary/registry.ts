import { allTermModules } from "./content";
import { GLOSSARY_CATEGORY_META, orderedCategories } from "./categories";
import type { GlossaryCategory } from "./frontmatter";
import { assertRedirectIntegrity, GLOSSARY_REDIRECTS } from "./redirects";
import type { GlossaryTerm } from "./types";
import { FORBIDDEN_PRODUCT_CLAIMS } from "./claims";
import { blocksToMarkdown } from "@/lib/docs/serialize";

/**
 * Single source of truth for the glossary platform. Pages, search, sitemap,
 * AI files, and editorial health checks all read from this registry.
 */
const ALL_TERMS: GlossaryTerm[] = [...allTermModules];

function assertIntegrity(terms: GlossaryTerm[]): void {
  const seen = new Set<string>();
  const ids = new Set<string>();

  for (const term of terms) {
    const { slug, id } = term.meta;
    if (seen.has(slug)) throw new Error(`Duplicate glossary slug: "${slug}"`);
    if (ids.has(id)) throw new Error(`Duplicate glossary id: "${id}"`);
    seen.add(slug);
    ids.add(id);

    // Only flag unsupported capabilities when claimed as Fajita features.
    const fajitaBlocks = term.body.filter(
      (b) =>
        b.kind === "paragraph" &&
        /fajita/i.test("text" in b ? b.text : ""),
    );
    const fajitaText = fajitaBlocks
      .map((b) => ("text" in b ? b.text : ""))
      .join(" ")
      .toLowerCase();
    for (const phrase of FORBIDDEN_PRODUCT_CLAIMS) {
      if (
        fajitaText.includes(phrase) &&
        !fajitaText.includes(`does not`) &&
        !fajitaText.includes("not capture") &&
        !fajitaText.includes("not install")
      ) {
        throw new Error(`Term "${slug}" claims unsupported capability: ${phrase}`);
      }
    }
    const corpus = `${blocksToMarkdown(term.body)}\n${term.meta.shortAnswer}\n${term.meta.shortDefinition}`;
    if (/\u2014/.test(corpus)) {
      throw new Error(`Term "${slug}" contains an em dash`);
    }
  }

  for (const term of terms) {
    term.meta.relatedTerms = term.meta.relatedTerms.filter((related) => {
      if (seen.has(related)) return true;
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[glossary] ${term.meta.slug} -> missing related "${related}"`);
      }
      return false;
    });
    if (
      term.meta.deprecated &&
      term.meta.replacementSlug &&
      !seen.has(term.meta.replacementSlug)
    ) {
      throw new Error(
        `Deprecated term "${term.meta.slug}" points to missing "${term.meta.replacementSlug}"`,
      );
    }
  }

  const published = new Set(
    terms.filter((t) => t.meta.status === "published" && !t.meta.deprecated).map((t) => t.meta.slug),
  );
  assertRedirectIntegrity(published);

  for (const from of Object.keys(GLOSSARY_REDIRECTS)) {
    if (seen.has(from) && !terms.find((t) => t.meta.slug === from)?.meta.deprecated) {
      // Redirect sources must not be living published pages.
    }
  }
}

assertIntegrity(ALL_TERMS);

const BY_SLUG = new Map(ALL_TERMS.map((t) => [t.meta.slug, t]));

export function allTerms(): GlossaryTerm[] {
  return ALL_TERMS;
}

export function publicTerms(): GlossaryTerm[] {
  return ALL_TERMS.filter(
    (t) => t.meta.status === "published" && !t.meta.deprecated && t.meta.indexable,
  );
}

export function llmTerms(): GlossaryTerm[] {
  return ALL_TERMS.filter(
    (t) =>
      t.meta.llmInclude &&
      t.meta.status === "published" &&
      !t.meta.noindex &&
      !t.meta.deprecated,
  );
}

export function getTerm(slug: string): GlossaryTerm | undefined {
  return BY_SLUG.get(slug);
}

export function termsInCategory(category: GlossaryCategory): GlossaryTerm[] {
  return publicTerms()
    .filter((t) => t.meta.category === category)
    .sort((a, b) => a.meta.term.localeCompare(b.meta.term));
}

export function featuredTerms(): GlossaryTerm[] {
  return publicTerms()
    .filter((t) => t.meta.featured)
    .sort((a, b) => a.meta.term.localeCompare(b.meta.term));
}

export function foundationalTerms(): GlossaryTerm[] {
  return publicTerms()
    .filter((t) => t.meta.foundational)
    .sort((a, b) => a.meta.term.localeCompare(b.meta.term));
}

export function recentlyUpdated(limit = 8): GlossaryTerm[] {
  return [...publicTerms()]
    .sort((a, b) => b.meta.lastReviewedAt.localeCompare(a.meta.lastReviewedAt))
    .slice(0, limit);
}

export function termsByLetter(letter: string): GlossaryTerm[] {
  const L = letter.toLowerCase();
  return publicTerms()
    .filter((t) => t.meta.term.toLowerCase().startsWith(L))
    .sort((a, b) => a.meta.term.localeCompare(b.meta.term));
}

export function alphabetAvailability(): { letter: string; count: number }[] {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  return letters.map((letter) => ({
    letter,
    count: termsByLetter(letter).length,
  }));
}

export function orderedPublicSlugs(): string[] {
  return publicTerms()
    .slice()
    .sort((a, b) => a.meta.term.localeCompare(b.meta.term))
    .map((t) => t.meta.slug);
}

export interface NavLink {
  slug: string;
  title: string;
  deprecated: boolean;
}

export function prevNext(slug: string): { prev?: NavLink; next?: NavLink } {
  const order = orderedPublicSlugs();
  const idx = order.indexOf(slug);
  if (idx === -1) return {};
  const toLink = (s?: string): NavLink | undefined => {
    if (!s) return undefined;
    const term = BY_SLUG.get(s)!;
    return {
      slug: s,
      title: term.meta.term,
      deprecated: term.meta.deprecated,
    };
  };
  return { prev: toLink(order[idx - 1]), next: toLink(order[idx + 1]) };
}

export function breadcrumbs(slug: string): { label: string; href: string }[] {
  const term = BY_SLUG.get(slug);
  const crumbs = [{ label: "Glossary", href: "/glossary" }];
  if (!term) return crumbs;
  const cat = GLOSSARY_CATEGORY_META[term.meta.category];
  crumbs.push({ label: cat.label, href: `/glossary/category/${cat.slug}` });
  crumbs.push({ label: term.meta.term, href: `/glossary/${term.meta.slug}` });
  return crumbs;
}

export function categoryBreadcrumbs(
  category: GlossaryCategory,
): { label: string; href: string }[] {
  const cat = GLOSSARY_CATEGORY_META[category];
  return [
    { label: "Glossary", href: "/glossary" },
    { label: cat.label, href: `/glossary/category/${cat.slug}` },
  ];
}

export function getCategoryMeta(category: GlossaryCategory) {
  return GLOSSARY_CATEGORY_META[category];
}

export { orderedCategories };

/** Detect near-duplicate primary queries for editorial review. */
export function duplicateIntentWarnings(): string[] {
  const byQuery = new Map<string, string[]>();
  for (const term of publicTerms()) {
    const q = term.meta.primaryQuery.toLowerCase().trim();
    const list = byQuery.get(q) ?? [];
    list.push(term.meta.slug);
    byQuery.set(q, list);
  }
  const warnings: string[] = [];
  for (const [query, slugs] of byQuery) {
    if (slugs.length > 1) {
      warnings.push(`Duplicate primary query "${query}": ${slugs.join(", ")}`);
    }
  }
  return warnings;
}
