import { getResearch, publicResearch } from "@/lib/content/registry";
import { researchToPlainText } from "@/lib/content/serialize";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicResearch().map((r) => ({ slug: r.meta.slug }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const item = getResearch(slug);
  if (!item || item.meta.status !== "published") {
    return new Response("Not found", { status: 404 });
  }
  return new Response(researchToPlainText(item), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
