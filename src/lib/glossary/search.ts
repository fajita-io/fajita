import { headingId } from "@/lib/docs/blocks";
import type { ContentBlock } from "@/lib/docs/blocks";
import { inlineToPlainText } from "@/lib/docs/inline";
import { blocksToMarkdown } from "@/lib/docs/serialize";
import { redactQuery } from "@/lib/docs/search";

import { GLOSSARY_CATEGORY_META } from "./categories";
import { expandWithGlossarySynonyms, resolveSynonymSlug } from "./synonyms";
import { publicTerms } from "./registry";

export interface GlossarySearchRecord {
  slug: string;
  term: string;
  shortDefinition: string;
  category: string;
  categoryLabel: string;
  acronym?: string;
  synonyms: string[];
  headings: string[];
  body: string;
  boost: number;
  foundational: boolean;
  deprecated: boolean;
}

function headingsOf(blocks: ContentBlock[]): string[] {
  return blocks
    .filter((b): b is Extract<ContentBlock, { kind: "heading" }> => b.kind === "heading")
    .map((b) => inlineToPlainText(b.text));
}

let INDEX: GlossarySearchRecord[] | null = null;

export function buildGlossarySearchIndex(): GlossarySearchRecord[] {
  if (INDEX) return INDEX;
  INDEX = publicTerms().map((term) => ({
    slug: term.meta.slug,
    term: term.meta.term,
    shortDefinition: term.meta.shortDefinition,
    category: term.meta.category,
    categoryLabel: GLOSSARY_CATEGORY_META[term.meta.category].label,
    acronym: term.meta.acronym,
    synonyms: term.meta.synonyms,
    headings: headingsOf(term.body),
    body: blocksToMarkdown(term.body).toLowerCase(),
    boost: term.meta.searchBoost + (term.meta.foundational ? 2 : 0),
    foundational: term.meta.foundational,
    deprecated: term.meta.deprecated,
  }));
  return INDEX;
}

export interface GlossarySearchHit {
  slug: string;
  term: string;
  shortDefinition: string;
  categoryLabel: string;
  score: number;
  anchor?: string;
}

function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

const STOP = new Set([
  "the", "a", "an", "to", "of", "and", "or", "how", "do", "i", "my", "is", "in",
  "for", "why", "did", "what", "does",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Rank glossary terms. Order (strongest first): exact canonical term, exact
 * acronym, exact synonym, title prefix, short definition, heading, body,
 * related. Foundational terms get a small editorial boost.
 */
export function searchGlossary(
  query: string,
  options: { limit?: number; category?: string } = {},
): GlossarySearchHit[] {
  const limit = options.limit ?? 12;
  const index = buildGlossarySearchIndex();
  const raw = query.trim().toLowerCase();
  if (raw.length < 2) return [];

  const synonymSlug = resolveSynonymSlug(raw);
  const expansions = expandWithGlossarySynonyms(raw);
  const tokens = Array.from(new Set(expansions.flatMap(tokenize)));
  if (tokens.length === 0 && !synonymSlug) return [];

  const hits: GlossarySearchHit[] = [];

  for (const rec of index) {
    if (options.category && rec.category !== options.category) continue;

    const termLower = rec.term.toLowerCase();
    const slugAsWords = rec.slug.replace(/-/g, " ");
    let score = 0;
    let anchor: string | undefined;

    if (termLower === raw || slugAsWords === raw) score += 140;
    else if (synonymSlug === rec.slug) score += 120;
    else if (rec.acronym && rec.acronym.toLowerCase() === raw) score += 130;
    else if (rec.synonyms.some((s) => s.toLowerCase() === raw)) score += 110;
    else if (expansions.some((e) => termLower.startsWith(e) || slugAsWords.startsWith(e))) {
      score += 50;
    } else if (expansions.some((e) => termLower.includes(e))) {
      score += 35;
    }

    if (expansions.some((e) => rec.shortDefinition.toLowerCase().includes(e))) {
      score += 18;
    }

    for (const h of rec.headings) {
      const hl = h.toLowerCase();
      if (expansions.some((e) => hl === e || hl.includes(e))) {
        score += 22;
        anchor ??= headingId({ kind: "heading", level: 2, text: h });
      }
    }

    const termTokens = tokenize(rec.term);
    const synonymTokens = rec.synonyms.flatMap(tokenize);
    for (const tok of tokens) {
      if (termTokens.some((t) => t === tok || withinOneEdit(t, tok))) score += 16;
      if (synonymTokens.some((t) => t === tok || withinOneEdit(t, tok))) score += 12;
      if (rec.acronym && withinOneEdit(rec.acronym.toLowerCase(), tok)) score += 20;
      if (rec.body.includes(tok)) score += 3;
    }

    if (score <= 0) continue;
    score += rec.boost * 4;
    if (rec.foundational) score += 6;
    if (rec.deprecated) score -= 40;

    hits.push({
      slug: rec.slug,
      term: rec.term,
      shortDefinition: rec.shortDefinition,
      categoryLabel: rec.categoryLabel,
      score,
      anchor,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export { redactQuery };
