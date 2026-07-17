import { featureOrder } from "@/lib/site/features";
import { ogContentType, ogSize, pageOgImage } from "@/lib/site/og";

export const alt = "Fajita";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return featureOrder.map((slug) => ({ slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const safeSlug = featureOrder.includes(slug as (typeof featureOrder)[number])
    ? slug
    : "features";
  return pageOgImage(safeSlug);
}
