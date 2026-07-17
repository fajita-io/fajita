import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsBlocks } from "@/components/docs/blocks";
import { DocsToc } from "@/components/docs/toc";
import { ContentProductCta } from "@/components/content/content-cta";
import { ContentFeedback } from "@/components/content/content-feedback";
import {
  AuthorByline,
  ContentBreadcrumbs,
  RelatedArticles,
  RelatedLinks,
} from "@/components/content/related";
import { tableOfContents } from "@/lib/docs/blocks";
import { BLOG_CATEGORY_META } from "@/lib/content/categories";
import {
  getArticle,
  publicArticles,
  relatedArticles,
} from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publicArticles().map((a) => ({ slug: a.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.meta.status !== "published") return {};
  return buildMetadata({
    title: article.meta.title,
    description: article.meta.description,
    path: `/blog/${article.meta.slug}`,
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.meta.status !== "published") notFound();

  const { meta, body } = article;
  const toc = tableOfContents(body);
  const related = relatedArticles(slug).map((a) => a.meta.slug);
  const category = BLOG_CATEGORY_META[meta.category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt,
    author: {
      "@type": "Organization",
      name: "Fajita",
    },
    publisher: {
      "@type": "Organization",
      name: "Fajita",
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/blog/${meta.slug}`,
    articleSection: category.label,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${siteUrl}/blog` },
      {
        "@type": "ListItem",
        position: 2,
        name: category.label,
        item: `${siteUrl}/blog/category/${meta.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: meta.title,
        item: `${siteUrl}/blog/${meta.slug}`,
      },
    ],
  };

  return (
    <article className="fj-content-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="fj-content-article__body">
        <ContentBreadcrumbs
          items={[
            { href: "/blog", label: "Blog" },
            { href: `/blog/category/${meta.category}`, label: category.label },
            { href: `/blog/${meta.slug}`, label: meta.title },
          ]}
        />
        <header>
          <h1 className="fj-heading-1">{meta.title}</h1>
          <AuthorByline authorSlug={meta.author} />
          <p className="fj-content-meta">
            Published {meta.publishedAt}
            {meta.updatedAt !== meta.publishedAt
              ? ` · Updated ${meta.updatedAt}`
              : ""}
            {" · "}
            {meta.readingMinutes} min read
            {" · "}
            Last reviewed {meta.lastReviewedAt}
          </p>
          <p className="fj-content-thesis">{meta.thesis}</p>
        </header>

        <DocsBlocks blocks={body} />

        <ContentProductCta variant={meta.productCta} contentSlug={meta.slug} />

        <RelatedLinks
          title="Glossary"
          links={meta.relatedGlossary.map((s) => ({
            href: `/glossary/${s}`,
            label: s.replace(/-/g, " "),
          }))}
        />
        <RelatedLinks title="Documentation" links={meta.relatedDocs} />
        <RelatedLinks
          title="Tools"
          links={meta.relatedTools.map((s) => ({
            href: `/tools/${s}`,
            label: s.replace(/-/g, " "),
          }))}
        />
        <RelatedArticles slugs={related} />

        <p className="fj-body-sm">
          <Link href={`/blog/raw/${meta.slug}`}>Plain-text version</Link>
          {" · "}
          <Link href={`/blog/category/${meta.category}`}>{category.label}</Link>
        </p>

        <ContentFeedback
          contentType="article"
          slug={meta.slug}
          prompt="Was this useful?"
        />
      </div>
      <aside className="fj-content-article__aside">
        {toc.length ? <DocsToc entries={toc} /> : null}
      </aside>
    </article>
  );
}
