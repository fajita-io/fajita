import { getDoc, publicDocs } from "@/lib/docs/registry";
import { contentOgImage } from "@/lib/site/content-og";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicDocs()
    .filter((page) => !page.meta.deprecated && !page.meta.noindex)
    .map((page) => ({ slug: page.meta.slug.split("/") }));
}

/**
 * Docs Open Graph images live outside `docs/[...slug]` on purpose.
 * Nesting `opengraph-image.tsx` under a catch-all makes Next register
 * `/docs/[...slug]/opengraph-image-*`, which throws
 * "Catch-all must be the last part of the URL" in SortedRoutes (Sentry
 * b69f60d2387d4c878c997588c56c7915).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await context.params;
  const page = getDoc(slug.join("/"));

  return contentOgImage({
    eyebrow: "Documentation",
    title: page?.meta.title ?? "Fajita docs",
    subtitle: page?.meta.description,
  });
}
