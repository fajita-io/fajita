import { getDoc, publicDocs } from "@/lib/docs/registry";
import { contentOgContentType, contentOgImage, contentOgSize } from "@/lib/site/content-og";

export const size = contentOgSize;
export const contentType = contentOgContentType;
export const alt = "Documentation";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicDocs()
    .filter((page) => !page.meta.deprecated && !page.meta.noindex)
    .map((page) => ({ slug: page.meta.slug.split("/") }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = getDoc(slug.join("/"));

  return contentOgImage({
    eyebrow: "Documentation",
    title: page?.meta.title ?? "Fajita docs",
    subtitle: page?.meta.description,
  });
}
