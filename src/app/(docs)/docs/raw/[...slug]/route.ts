import { llmDocs, getDoc } from "@/lib/docs/registry";
import { pageToPlainText } from "@/lib/docs/serialize";

/**
 * Plain-text representation of a single documentation page. Only published,
 * LLM-eligible pages are exposed; everything else returns 404 so drafts,
 * internal, and deprecated pages never leak through the raw route.
 */
const ALLOWED = new Set(llmDocs().map((p) => p.meta.slug));

export function generateStaticParams() {
  return llmDocs().map((p) => ({ slug: p.meta.slug.split("/") }));
}

export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const key = slug.join("/");
  if (!ALLOWED.has(key)) {
    return new Response("Not found", { status: 404 });
  }
  const page = getDoc(key)!;
  return new Response(pageToPlainText(page), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Docs-Version": page.meta.docsVersion,
      "X-Robots-Tag": "noindex",
    },
  });
}
