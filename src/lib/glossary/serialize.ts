import { blocksToMarkdown } from "@/lib/docs/serialize";

import type { GlossaryTerm } from "./types";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

/** Self-contained plain-text document for raw routes and llms-full. */
export function termToPlainText(term: GlossaryTerm): string {
  const { meta } = term;
  const lines = [
    `# ${meta.term}`,
    "",
    meta.shortDefinition,
    "",
    `## What is ${meta.term}?`,
    "",
    meta.shortAnswer,
    "",
    `Canonical: ${siteUrl}/glossary/${meta.slug}`,
    `Category: ${meta.category}`,
    `Content version: ${meta.contentVersion}`,
    `Glossary version: ${meta.glossaryVersion}`,
    `Last reviewed: ${meta.lastReviewedAt}`,
  ];

  if (meta.acronym) {
    lines.push(`Acronym: ${meta.acronym}`);
  }
  if (meta.synonyms.length) {
    lines.push(`Synonyms: ${meta.synonyms.join("; ")}`);
  }
  if (meta.relatedTerms.length) {
    lines.push(`Related terms: ${meta.relatedTerms.join(", ")}`);
  }

  lines.push("", blocksToMarkdown(term.body));

  if (term.formula) {
    lines.push(
      "",
      `## ${term.formula.label}`,
      "",
      term.formula.expression,
      "",
      ...term.formula.notes.map((n) => `- ${n}`),
    );
  }

  if (term.faqs?.length) {
    lines.push("", "## Frequently asked questions", "");
    for (const faq of term.faqs) {
      lines.push(`### ${faq.question}`, "", faq.answer, "");
    }
  }

  lines.push("", `Publisher: Fajita (${siteUrl}).`);

  return `${lines.join("\n")}\n`;
}

export function termsToFullText(terms: GlossaryTerm[]): string {
  return terms.map(termToPlainText).join("\n\n---\n\n");
}

/** Citation-ready summary visible on the page and in the manifest. */
export function citationSummary(term: GlossaryTerm): {
  term: string;
  definition: string;
  keyFacts: string[];
  misconception?: string;
  relatedTerms: string[];
  lastReviewedAt: string;
  canonicalUrl: string;
  contentVersion: string;
} {
  return {
    term: term.meta.term,
    definition: term.meta.shortDefinition,
    keyFacts: [
      term.meta.shortAnswer,
      `Primary intent: ${term.meta.searchIntent}`,
      `Category: ${term.meta.category}`,
    ],
    misconception: undefined,
    relatedTerms: term.meta.relatedTerms,
    lastReviewedAt: term.meta.lastReviewedAt,
    canonicalUrl: `${siteUrl}/glossary/${term.meta.slug}`,
    contentVersion: term.meta.contentVersion,
  };
}
