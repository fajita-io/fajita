import { getArticle, publicArticles } from "@/lib/content/registry";
import { contentOgContentType, contentOgImage, contentOgSize } from "@/lib/site/content-og";

export const size = contentOgSize;
export const contentType = contentOgContentType;
export const alt = "Article";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicArticles().map((article) => ({ slug: article.meta.slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  return contentOgImage({
    eyebrow: "Blog",
    title: article?.meta.title ?? "Fajita blog",
    subtitle: article?.meta.description,
  });
}
