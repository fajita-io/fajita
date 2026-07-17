import { getComparison, publicComparisons } from "@/lib/content/registry";
import { comparisonToPlainText } from "@/lib/content/serialize";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicComparisons().map((c) => ({ slug: c.meta.slug }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const page = getComparison(slug);
  if (!page || page.meta.status !== "published") {
    return new Response("Not found", { status: 404 });
  }
  return new Response(comparisonToPlainText(page), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
