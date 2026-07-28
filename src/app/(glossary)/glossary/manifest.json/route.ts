import { createHash } from "node:crypto";

import { GLOSSARY_VERSION } from "@/lib/glossary/frontmatter";
import { llmTerms } from "@/lib/glossary/registry";
import { siteUrl } from "@/lib/site/site-config";

export const dynamic = "force-static";

export function GET() {
  const terms = llmTerms().map((term) => {
    const plain = [
      term.meta.term,
      term.meta.shortDefinition,
      term.meta.shortAnswer,
      term.meta.contentVersion,
      term.meta.lastReviewedAt,
    ].join("|");
    return {
      id: term.meta.id,
      term: term.meta.term,
      slug: term.meta.slug,
      canonicalUrl: `${siteUrl}/glossary/${term.meta.slug}`,
      shortDefinition: term.meta.shortDefinition,
      category: term.meta.category,
      synonyms: term.meta.synonyms,
      acronym: term.meta.acronym ?? null,
      relatedTerms: term.meta.relatedTerms,
      productAreas: term.meta.productAreas,
      lastReviewedAt: term.meta.lastReviewedAt,
      contentVersion: term.meta.contentVersion,
      plainTextUrl: `${siteUrl}/glossary/raw/${term.meta.slug}`,
      indexable: term.meta.indexable && !term.meta.noindex,
      deprecated: term.meta.deprecated,
      replacementUrl: term.meta.replacementSlug
        ? `${siteUrl}/glossary/${term.meta.replacementSlug}`
        : null,
      contentHash: createHash("sha256").update(plain).digest("hex").slice(0, 16),
    };
  });

  const body = {
    glossaryVersion: GLOSSARY_VERSION,
    generatedAt: new Date().toISOString().slice(0, 10),
    publisher: "Fajita",
    termCount: terms.length,
    terms,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
