import { getArticle, publicArticles } from "@/lib/content/registry";
import { articleToPlainText } from "@/lib/content/serialize";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicArticles().map((a) => ({ slug: a.meta.slug }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const article = getArticle(slug);
  if (!article || article.meta.status !== "published" || article.meta.deprecated) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(articleToPlainText(article), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
