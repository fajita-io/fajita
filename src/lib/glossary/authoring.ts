import {
  callout,
  h2,
  h3,
  ol,
  p,
  table,
  ul,
  type ContentBlock,
} from "@/lib/docs/blocks";

/**
 * Assemble a standard glossary term body from unique section copy.
 * Every published term must pass through this shape so pages stay consistent
 * without becoming repetitive boilerplate.
 */
export function buildTermBody(sections: {
  whyItMatters: string[];
  howItWorks: string[];
  example: string[];
  misconception?: { title: string; body: string[] };
  commonlyConfused?: { title: string; body: string[] };
  fajita?: string[];
  checklist?: string[];
  extra?: ContentBlock[];
}): ContentBlock[] {
  const blocks: ContentBlock[] = [
    h2("Why it matters"),
    ...sections.whyItMatters.map(p),
    h2("How it works"),
    ...sections.howItWorks.map(p),
    h2("Practical example"),
    ...sections.example.map(p),
  ];

  if (sections.misconception) {
    blocks.push(h2("Common misconception"));
    blocks.push(h3(sections.misconception.title));
    blocks.push(...sections.misconception.body.map(p));
  }

  if (sections.commonlyConfused) {
    blocks.push(h2("Commonly confused with"));
    blocks.push(h3(sections.commonlyConfused.title));
    blocks.push(...sections.commonlyConfused.body.map(p));
  }

  if (sections.fajita?.length) {
    blocks.push(h2("How Fajita handles this"));
    blocks.push(...sections.fajita.map(p));
  }

  if (sections.checklist?.length) {
    blocks.push(h2("Operational checklist"));
    blocks.push(ul(sections.checklist));
  }

  if (sections.extra?.length) {
    blocks.push(...sections.extra);
  }

  blocks.push(
    callout("note", [
      p(
        "This glossary page explains the concept. Product steps live in the documentation links below. The applicable agreement controls Fajita’s contractual obligations when a topic touches billing, privacy, or service commitments.",
      ),
    ], "Reading tip"),
  );

  return blocks;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export { h2, h3, p, ul, ol, table, callout };
