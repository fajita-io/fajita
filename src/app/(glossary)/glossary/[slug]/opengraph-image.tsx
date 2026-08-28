import { getTerm, publicTerms } from "@/lib/glossary/registry";
import { contentOgContentType, contentOgImage, contentOgSize } from "@/lib/site/content-og";

export const size = contentOgSize;
export const contentType = contentOgContentType;
export const alt = "Glossary term";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicTerms()
    .filter((term) => !term.meta.deprecated && !term.meta.noindex)
    .map((term) => ({ slug: term.meta.slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = getTerm(slug);

  return contentOgImage({
    eyebrow: "Glossary",
    title: term?.meta.term ?? "Glossary",
    subtitle: term?.meta.shortDefinition,
  });
}
