/**
 * Documentation build-time validation.
 *
 * Runs the guards that must never regress on customer-facing docs:
 *   - required frontmatter (owner, review date) on published pages
 *   - internal /docs links resolve to a real page
 *   - no secrets, em dashes, phase numbers, or internal terms in public output
 *   - screenshots carry alt text
 *   - AI-readable corpus contains only published, indexable pages
 *
 * Exits non-zero on any error so CI can block publication.
 *
 * Run: npx tsx scripts/docs-validate.ts
 */
import { allDocs, getDoc, llmDocs, publicDocs } from "../src/lib/docs/registry";
import { pageToPlainText, pagesToFullText } from "../src/lib/docs/serialize";
import type { ContentBlock } from "../src/lib/docs/blocks";

const errors: string[] = [];
const warnings: string[] = [];

function err(msg: string) {
  errors.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

const pages = allDocs();

/* 1. Required frontmatter on published pages. */
for (const page of pages) {
  const { slug, status, owner, lastReviewedAt, description } = page.meta;
  if (status === "published") {
    if (!owner) err(`${slug}: published page has no owner`);
    if (!lastReviewedAt) err(`${slug}: published page has no lastReviewedAt`);
    if (!description || description.length < 20) {
      err(`${slug}: description is missing or too short`);
    }
    if (description.length > 200) {
      warn(`${slug}: description is long (${description.length} chars)`);
    }
  }
}

/* 2. Related pages resolve (registry strips silently; re-assert here). */
for (const page of pages) {
  for (const related of page.meta.relatedPages) {
    if (!getDoc(related)) err(`${page.meta.slug}: related page "${related}" does not exist`);
  }
}

/* 3. Internal /docs links in prose resolve. */
const KNOWN = new Set(pages.map((p) => p.meta.slug));
const linkRe = /\]\((\/docs(?:\/[a-z0-9\-/]+)?(?:#[a-z0-9\-]+)?)\)/g;
for (const page of pages) {
  const md = pageToPlainText(page);
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(md)) !== null) {
    const href = m[1].split("#")[0];
    if (href === "/docs" || href.startsWith("/docs#")) continue;
    const slug = href.replace(/^\/docs\//, "");
    if (!KNOWN.has(slug)) err(`${page.meta.slug}: internal link to unknown page "${href}"`);
  }
}

/* 4. Screenshots carry alt text. */
function walk(blocks: ContentBlock[], slug: string) {
  for (const block of blocks) {
    if (block.kind === "screenshot" && !block.alt?.trim()) {
      err(`${slug}: screenshot without alt text`);
    }
    if (block.kind === "tabs") {
      for (const tab of block.items) walk(tab.body, slug);
    }
    if (block.kind === "steps") {
      for (const step of block.items) walk(step.body, slug);
    }
    if (block.kind === "callout") walk(block.body, slug);
  }
}
for (const page of pages) walk(page.body, page.meta.slug);

/* 5. AI-readable corpus is clean. */
for (const page of llmDocs()) {
  if (page.meta.status !== "published") err(`llm: ${page.meta.slug} is not published`);
  if (page.meta.noindex) err(`llm: ${page.meta.slug} is noindex`);
}

const corpus = pagesToFullText(llmDocs());
const forbidden: Array<[string, RegExp]> = [
  ["em dash", /\u2014/],
  ["phase number", /phase\s*\d+/i],
  ["internal term: cursor", /\bcursor\b/i],
  ["internal term: supabase", /\bsupabase\b/i],
  ["internal term: clerk", /\bclerk\b/i],
  ["stripe secret", /sk_(live|test)_[A-Za-z0-9]/],
  ["webhook signing secret", /whsec_[A-Za-z0-9]{8}/],
  ["service role", /SERVICE_ROLE/],
  ["private ip", /\b(10|127|192\.168)\.\d+\.\d+\.\d+\b/],
  ["localhost url", /https?:\/\/localhost/i],
];
for (const [label, re] of forbidden) {
  if (re.test(corpus)) err(`AI-readable corpus contains forbidden pattern: ${label}`);
}

/* Report. */
console.log(`Validated ${pages.length} documentation pages.`);
console.log(`  published: ${publicDocs().length}`);
console.log(`  ai-readable: ${llmDocs().length}`);
for (const w of warnings) console.warn(`WARN  ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error(`\nDocumentation validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log("Documentation validation passed.");
