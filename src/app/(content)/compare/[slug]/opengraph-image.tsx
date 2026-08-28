import { getComparison, publicComparisons } from "@/lib/content/registry";
import { contentOgContentType, contentOgImage, contentOgSize } from "@/lib/site/content-og";

export const size = contentOgSize;
export const contentType = contentOgContentType;
export const alt = "Comparison";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicComparisons().map((page) => ({ slug: page.meta.slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getComparison(slug);

  return contentOgImage({
    eyebrow: "Comparison",
    title: page?.meta.title ?? "Fajita comparison",
    subtitle: page?.meta.description,
  });
}
