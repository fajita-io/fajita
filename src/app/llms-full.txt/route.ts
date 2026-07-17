import {
  llmArticles,
  llmComparisons,
  llmTools,
  publicResearch,
} from "@/lib/content/registry";
import {
  articleToPlainText,
  comparisonToPlainText,
  researchToPlainText,
  toolToPlainText,
} from "@/lib/content/serialize";
import { DOCS_VERSION } from "@/lib/docs/frontmatter";
import { llmDocs } from "@/lib/docs/registry";
import { pagesToFullText } from "@/lib/docs/serialize";
import { GLOSSARY_VERSION } from "@/lib/glossary/frontmatter";
import { llmTerms } from "@/lib/glossary/registry";
import { termsToFullText } from "@/lib/glossary/serialize";

/**
 * Canonical full-text AI-readable file at the site root. Contains public
 * documentation, approved glossary content, and approved content-growth pages.
 */
export function GET() {
  const pages = llmDocs();
  const terms = llmTerms();
  const articles = llmArticles();
  const comparisons = llmComparisons();
  const tools = llmTools();
  const research = publicResearch().filter((r) => r.meta.llmInclude);

  const header = [
    "# Fajita documentation, glossary, and content (full text)",
    "",
    `Docs version: ${DOCS_VERSION}`,
    `Docs pages: ${pages.length}`,
    `Glossary version: ${GLOSSARY_VERSION}`,
    `Glossary terms: ${terms.length}`,
    `Blog articles: ${articles.length}`,
    `Comparisons: ${comparisons.length}`,
    `Tools: ${tools.length}`,
    `Research: ${research.length}`,
    "Complete public documentation, approved glossary, and approved editorial content.",
    "See /llms.txt for a shorter index.",
    "Glossary attribution: Powered by Wiki (https://wiki.co). Publisher: Fajita.",
    "",
    "=== DOCUMENTATION ===",
    "",
  ].join("\n");

  const glossaryHeader = ["", "=== GLOSSARY ===", ""].join("\n");
  const blogHeader = ["", "=== BLOG ===", ""].join("\n");
  const compareHeader = ["", "=== COMPARISONS ===", ""].join("\n");
  const toolsHeader = ["", "=== TOOLS ===", ""].join("\n");
  const researchHeader = ["", "=== RESEARCH ===", ""].join("\n");

  const blogText = articles.map(articleToPlainText).join("\n\n---\n\n");
  const compareText = comparisons.map(comparisonToPlainText).join("\n\n---\n\n");
  const toolsText = tools.map(toolToPlainText).join("\n\n---\n\n");
  const researchText = research.map(researchToPlainText).join("\n\n---\n\n");

  return new Response(
    `${header}${pagesToFullText(pages)}${glossaryHeader}${termsToFullText(terms)}${blogHeader}${blogText}${compareHeader}${compareText}${toolsHeader}${toolsText}${researchHeader}${researchText}`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
