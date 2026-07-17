import { getTool, publicTools } from "@/lib/content/registry";
import { toolToPlainText } from "@/lib/content/serialize";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicTools().map((t) => ({ slug: t.meta.slug }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const tool = getTool(slug);
  if (!tool || tool.meta.status !== "published") {
    return new Response("Not found", { status: 404 });
  }
  return new Response(toolToPlainText(tool), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
