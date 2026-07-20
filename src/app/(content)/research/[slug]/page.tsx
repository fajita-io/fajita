import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsBlocks } from "@/components/docs/blocks";
import { ContentFeedback } from "@/components/content/content-feedback";
import { ContentBreadcrumbs } from "@/components/content/related";
import { getResearch, publicResearch } from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publicResearch().map((r) => ({ slug: r.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getResearch(slug);
  if (!item || item.meta.status !== "published") return {};
  return buildMetadata({
    title: item.meta.title,
    description: item.meta.description,
    path: `/research/${item.meta.slug}`,
  });
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const item = getResearch(slug);
  // Only published research is routable; data-insufficient records stay internal.
  if (!item || item.meta.status !== "published") notFound();

  const { meta, body } = item;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt,
    author: { "@type": "Organization", name: "Fajita Research" },
    publisher: { "@type": "Organization", name: "Fajita", url: siteUrl },
  };

  return (
    <article className="fj-content-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="fj-content-article__body">
      <ContentBreadcrumbs
        items={[
          { href: "/blog", label: "Blog" },
          { href: `/research/${meta.slug}`, label: meta.title },
        ]}
      />
      <header>
        <h1 className="fj-heading-1">{meta.title}</h1>
        <p className="fj-content-meta">
          Published {meta.publishedAt}
          {meta.updatedAt !== meta.publishedAt
            ? ` · Updated ${meta.updatedAt}`
            : ""}
        </p>
        <p className="fj-content-thesis">{meta.researchQuestion}</p>
      </header>
      <div className="fj-docs-prose">
        <DocsBlocks blocks={body} />
      </div>
      <ContentFeedback
        contentType="research"
        slug={meta.slug}
        prompt="Was the methodology clear?"
      />
      <p className="fj-body-sm">
        <Link href={`/research/raw/${meta.slug}`}>Plain-text version</Link>
      </p>
      </div>
    </article>
  );
}
