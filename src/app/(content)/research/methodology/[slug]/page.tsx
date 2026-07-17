import { permanentRedirect } from "next/navigation";

import { publicResearch } from "@/lib/content/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicResearch()
    .filter((r) => r.meta.slug.includes("methodology"))
    .map((r) => ({ slug: r.meta.slug }));
}

/** Methodology lives at /research/[slug]; keep alias stable. */
export default async function ResearchMethodologyAlias({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/research/${slug}`);
}
