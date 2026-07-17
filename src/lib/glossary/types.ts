import type { ContentBlock } from "@/lib/docs/blocks";

import { termFrontmatterSchema, type TermFrontmatter } from "./frontmatter";

/** A fully-parsed glossary term: validated metadata plus content blocks. */
export interface GlossaryTerm {
  meta: TermFrontmatter;
  body: ContentBlock[];
  /** Optional FAQ pairs for visible FAQ sections and FAQPage schema. */
  faqs?: { question: string; answer: string }[];
  /** Optional formula block for metric terms. */
  formula?: { label: string; expression: string; notes: string[] };
}

export type TermInput = {
  meta: Parameters<typeof termFrontmatterSchema.parse>[0];
  body: ContentBlock[];
  faqs?: { question: string; answer: string }[];
  formula?: { label: string; expression: string; notes: string[] };
};

/**
 * Validate and normalize a term at author time. Throws with the slug in the
 * message if frontmatter is invalid so a bad term fails the build loudly.
 */
export function defineTerm(input: TermInput): GlossaryTerm {
  const result = termFrontmatterSchema.safeParse(input.meta);
  if (!result.success) {
    const slug =
      typeof (input.meta as { slug?: unknown })?.slug === "string"
        ? (input.meta as { slug: string }).slug
        : "<unknown>";
    throw new Error(
      `Invalid glossary frontmatter for "${slug}": ${result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const shortAnswerWords = result.data.shortAnswer.trim().split(/\s+/).length;
  if (shortAnswerWords < 35 || shortAnswerWords > 70) {
    throw new Error(
      `Glossary term "${result.data.slug}": shortAnswer must be 35–70 words (got ${shortAnswerWords})`,
    );
  }

  if (!result.data.poweredByWiki && result.data.status === "published") {
    throw new Error(
      `Glossary term "${result.data.slug}": published terms must include Powered by Wiki attribution`,
    );
  }

  return {
    meta: result.data,
    body: input.body,
    faqs: input.faqs,
    formula: input.formula,
  };
}
