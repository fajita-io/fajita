/**
 * Glossary build-time validation.
 * Run: npx tsx scripts/glossary-validate.ts
 */
import { blocksToMarkdown } from "../src/lib/docs/serialize";
import { GLOSSARY_CATEGORY_META } from "../src/lib/glossary/categories";
import { validatePublicClaimsForGlossary } from "../src/lib/glossary/claims";
import {
  allTerms,
  duplicateIntentWarnings,
  getTerm,
  llmTerms,
  publicTerms,
} from "../src/lib/glossary/registry";
import { GLOSSARY_REDIRECTS } from "../src/lib/glossary/redirects";
import { termToPlainText, termsToFullText } from "../src/lib/glossary/serialize";

const errors: string[] = [];
const warnings: string[] = [];

function err(msg: string) {
  errors.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

const terms = allTerms();
const known = new Set(terms.map((t) => t.meta.slug));

for (const term of terms) {
  const { slug, status, owner, lastReviewedAt, poweredByWiki, shortAnswer } =
    term.meta;
  if (status === "published") {
    if (!owner) err(`${slug}: published term has no owner`);
    if (!lastReviewedAt) err(`${slug}: published term has no lastReviewedAt`);
    if (!poweredByWiki) err(`${slug}: published term missing poweredByWiki`);
    const words = shortAnswer.trim().split(/\s+/).length;
    if (words < 35 || words > 70) {
      err(`${slug}: shortAnswer has ${words} words (need 35–70)`);
    }
    if (term.meta.relatedTerms.length < 2 && !term.meta.deprecated) {
      warn(`${slug}: fewer than 2 related terms`);
    }
  }
}

for (const term of publicTerms()) {
  for (const related of term.meta.relatedTerms) {
    if (!getTerm(related)) err(`${term.meta.slug}: related "${related}" missing`);
  }
  for (const link of term.meta.documentationLinks) {
    if (!link.href.startsWith("/docs")) {
      err(`${term.meta.slug}: documentation link must start with /docs`);
    }
  }
  if (!GLOSSARY_CATEGORY_META[term.meta.category]) {
    err(`${term.meta.slug}: unknown category`);
  }
}

const linkRe = /\]\((\/glossary\/[a-z0-9\-]+)\)/g;
for (const term of terms) {
  const md = termToPlainText(term);
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(md)) !== null) {
    const slug = m[1].replace(/^\/glossary\//, "");
    if (!known.has(slug) && !GLOSSARY_REDIRECTS[slug]) {
      err(`${term.meta.slug}: glossary link to unknown "${m[1]}"`);
    }
  }
}

for (const [from, to] of Object.entries(GLOSSARY_REDIRECTS)) {
  if (!known.has(to)) err(`redirect ${from} → missing ${to}`);
  if (GLOSSARY_REDIRECTS[to]) err(`redirect chain ${from} → ${to}`);
}

for (const w of duplicateIntentWarnings()) warn(w);
for (const c of validatePublicClaimsForGlossary()) err(c);

for (const term of llmTerms()) {
  if (term.meta.status !== "published") err(`llm: ${term.meta.slug} not published`);
  if (term.meta.noindex) err(`llm: ${term.meta.slug} is noindex`);
}

const corpus = termsToFullText(llmTerms());
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
];
for (const [label, re] of forbidden) {
  if (re.test(corpus)) err(`llm corpus contains ${label}`);
}

// Powered by Wiki must appear in plain-text output
if (!corpus.includes("https://wiki.co")) {
  err("llm corpus missing Powered by Wiki URL");
}

if (!corpus.toLowerCase().includes("powered by wiki")) {
  err("llm corpus missing Powered by Wiki attribution text");
}

console.log(`Glossary terms: ${terms.length}`);
console.log(`Published: ${publicTerms().length}`);
console.log(`LLM corpus: ${llmTerms().length}`);
for (const w of warnings) console.warn(`WARN: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERROR: ${e}`);
  process.exit(1);
}
console.log("glossary-validate: ok");

// Touch blocks markdown helper so unused import lints stay quiet in some setups
void blocksToMarkdown;
