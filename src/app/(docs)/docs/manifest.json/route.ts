import { createHash } from "node:crypto";

import { DOCS_VERSION } from "@/lib/docs/frontmatter";
import { llmDocs } from "@/lib/docs/registry";
import { pageToPlainText } from "@/lib/docs/serialize";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

/**
 * Machine-readable documentation manifest. Lists every public page with its
 * canonical URL, plain-text URL, content type, and a content hash. Never
 * exposes repository paths or internal owner emails.
 */
export function GET() {
  const pages = llmDocs().map((page) => {
    const hash = createHash("sha256").update(pageToPlainText(page)).digest("hex").slice(0, 16);
    return {
      title: page.meta.title,
      canonicalUrl: `${siteUrl}/docs/${page.meta.slug}`,
      plainTextUrl: `${siteUrl}/docs/raw/${page.meta.slug}`,
      description: page.meta.description,
      productArea: page.meta.productArea,
      contentType: page.meta.pageType,
      lastReviewed: page.meta.lastReviewedAt,
      productVersion: page.meta.productVersion,
      deprecated: page.meta.deprecated,
      sourceHash: hash,
    };
  });

  const manifest = {
    product: "Fajita",
    docsVersion: DOCS_VERSION,
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages,
  };

  return Response.json(manifest, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
