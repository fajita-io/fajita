import { DOC_CATEGORY_META } from "./categories";
import { inlineToPlainText } from "./inline";
import { publicDocs } from "./registry";
import { blocksToMarkdown } from "./serialize";
import { expandWithSynonyms } from "./synonyms";
import type { ContentBlock } from "./blocks";
import { headingId } from "./blocks";

export interface SearchRecord {
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  pageType: string;
  headings: string[];
  keywords: string[];
  body: string;
  boost: number;
  deprecated: boolean;
}

function headingsOf(blocks: ContentBlock[]): string[] {
  return blocks
    .filter((b): b is Extract<ContentBlock, { kind: "heading" }> => b.kind === "heading")
    .map((b) => inlineToPlainText(b.text));
}

let INDEX: SearchRecord[] | null = null;

/** Build (and memoize) the search index from published pages only. */
export function buildSearchIndex(): SearchRecord[] {
  if (INDEX) return INDEX;
  INDEX = publicDocs().map((page) => ({
    slug: page.meta.slug,
    title: page.meta.title,
    description: page.meta.description,
    category: page.meta.category,
    categoryLabel: DOC_CATEGORY_META[page.meta.category].label,
    pageType: page.meta.pageType,
    headings: headingsOf(page.body),
    keywords: page.meta.keywords,
    body: blocksToMarkdown(page.body).toLowerCase(),
    boost: page.meta.searchBoost,
    deprecated: page.meta.deprecated,
  }));
  return INDEX;
}

export interface SearchHit {
  slug: string;
  title: string;
  description: string;
  categoryLabel: string;
  pageType: string;
  score: number;
  /** Best matching heading anchor, when a heading matched. */
  anchor?: string;
}

/** Cheap bounded Levenshtein for short-token typo tolerance. */
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

const STOP = new Set(["the", "a", "an", "to", "of", "and", "or", "how", "do", "i", "my", "is", "in", "for", "why", "did"]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Rank documentation records for a query. Ranking order (strongest first):
 * exact title, exact heading, keyword/error-code, title token, heading token,
 * body, then frontmatter boost. Typo tolerance applies to individual tokens.
 */
export function searchDocs(query: string, limit = 12): SearchHit[] {
  const index = buildSearchIndex();
  const raw = query.trim().toLowerCase();
  if (raw.length < 2) return [];

  const expansions = expandWithSynonyms(raw);
  const tokens = Array.from(new Set(expansions.flatMap(tokenize)));
  if (tokens.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const rec of index) {
    const title = rec.title.toLowerCase();
    const keywordText = rec.keywords.join(" ").toLowerCase();
    let score = 0;
    let anchor: string | undefined;

    // Whole-query signals.
    if (expansions.some((e) => title === e)) score += 120;
    else if (expansions.some((e) => title.includes(e))) score += 40;
    for (const h of rec.headings) {
      const hl = h.toLowerCase();
      if (expansions.some((e) => hl === e)) {
        score += 60;
        anchor = headingId({ kind: "heading", level: 2, text: h });
      } else if (expansions.some((e) => hl.includes(e))) {
        score += 20;
        anchor ??= headingId({ kind: "heading", level: 2, text: h });
      }
    }

    // Token signals with typo tolerance.
    const titleTokens = tokenize(rec.title);
    const keywordTokens = tokenize(keywordText);
    for (const tok of tokens) {
      if (keywordTokens.some((k) => k === tok || withinOneEdit(k, tok))) score += 18;
      if (titleTokens.some((t) => t === tok || withinOneEdit(t, tok))) score += 14;
      if (rec.description.toLowerCase().includes(tok)) score += 6;
      if (rec.body.includes(tok)) score += 3;
    }

    if (score <= 0) continue;

    // Frontmatter boost (weak) and page-type nudges.
    score += rec.boost * 4;
    if (rec.pageType === "task") score += 2;
    if (rec.pageType === "troubleshooting" && /error|fail|blocked|why|not/.test(raw)) score += 6;
    if (rec.deprecated) score -= 40;

    hits.push({
      slug: rec.slug,
      title: rec.title,
      description: rec.description,
      categoryLabel: rec.categoryLabel,
      pageType: rec.pageType,
      score,
      anchor,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Scrub a query before it is stored or sent to analytics. Redacts likely
 * secrets, tokens, emails, and URLs with query strings so sensitive input is
 * never retained. Only a bounded, sanitized string leaves this function.
 */
export function redactQuery(query: string): string {
  let q = query.slice(0, 120);
  q = q.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
  q = q.replace(/https?:\/\/\S+/g, "[url]");
  q = q.replace(/\b(?:whsec|whsk|sk|pk|bearer|token)[_\s-]?[A-Za-z0-9._-]{8,}/gi, "[secret]");
  q = q.replace(/\beyJ[A-Za-z0-9._-]{10,}/g, "[jwt]");
  q = q.replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[token]");
  return q.trim();
}
