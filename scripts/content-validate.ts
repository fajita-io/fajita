/**
 * Content-growth build-time validation.
 * Run: npx tsx scripts/content-validate.ts
 */
import { blocksToMarkdown } from "../src/lib/docs/serialize";
import { findForbiddenClaims } from "../src/lib/content/claims";
import { estimateWordCount, scanAntiAiSlop } from "../src/lib/content/quality";
import {
  allArticles,
  allComparisons,
  allTools,
  contentManifest,
  publicArticles,
  publicComparisons,
  publicTools,
} from "../src/lib/content/registry";
import {
  articleToPlainText,
  comparisonToPlainText,
  toolToPlainText,
} from "../src/lib/content/serialize";

const errors: string[] = [];
const warnings: string[] = [];

function err(msg: string) {
  errors.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

for (const article of allArticles) {
  const corpus = `${article.meta.thesis}\n${blocksToMarkdown(article.body)}`;
  for (const f of scanAntiAiSlop(corpus, article.meta.slug)) {
    if (f.severity === "error") err(f.message);
    else warn(f.message);
  }
  for (const claim of findForbiddenClaims(corpus)) {
    err(`${article.meta.slug}: forbidden claim ${claim}`);
  }
  if (article.meta.status === "published") {
    const words = estimateWordCount(corpus);
    if (words < 700) {
      warn(`${article.meta.slug}: ${words} words (soft target ~700+)`);
    }
    if (!article.meta.originalContribution) {
      err(`${article.meta.slug}: missing original contribution`);
    }
  }
}

for (const page of publicComparisons()) {
  if (!page.meta.fajitaLimitations.length) {
    err(`${page.meta.slug}: missing Fajita limitations`);
  }
  if (page.meta.comparisonType === "versus" && !page.meta.competitorStrengths?.length) {
    err(`${page.meta.slug}: versus page missing competitor strengths`);
  }
}

for (const tool of publicTools()) {
  if (tool.meta.networkAccess) {
    err(`${tool.meta.slug}: networked tools require explicit SSRF approval`);
  }
  if (tool.meta.storesInput) {
    err(`${tool.meta.slug}: tools must not store input in Phase 15 launch set`);
  }
}

// Ensure plain-text serializers work
for (const a of publicArticles()) articleToPlainText(a);
for (const c of publicComparisons()) comparisonToPlainText(c);
for (const t of publicTools()) toolToPlainText(t);

const manifest = contentManifest();
if (manifest.entries.length < publicArticles().length) {
  err("manifest missing articles");
}

console.log(
  `Content validate: ${allArticles.length} articles, ${allComparisons.length} comparisons, ${allTools.length} tools`,
);
for (const w of warnings) console.warn(`WARN: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERROR: ${e}`);
  process.exit(1);
}
console.log("OK");
