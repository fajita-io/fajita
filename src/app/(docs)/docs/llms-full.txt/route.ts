import { DOCS_VERSION } from "@/lib/docs/frontmatter";
import { llmDocs } from "@/lib/docs/registry";
import { pagesToFullText } from "@/lib/docs/serialize";

/**
 * Full public documentation as plain text, for AI systems that ingest a single
 * corpus. Includes only published, LLM-eligible pages: no navigation chrome,
 * no scripts, no drafts, no internal or deprecated content, no secrets.
 */
export function GET() {
  const pages = llmDocs();
  const header = [
    "# Fajita documentation (full text)",
    "",
    `Docs version: ${DOCS_VERSION}`,
    `Pages: ${pages.length}`,
    "This file contains the complete public documentation content. Canonical URLs are included per page.",
    "",
    "===",
    "",
  ].join("\n");

  const body = pagesToFullText(pages);

  return new Response(`${header}${body}`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
