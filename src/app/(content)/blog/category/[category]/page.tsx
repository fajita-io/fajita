import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RelatedLinks } from "@/components/content/related";
import {
  BLOG_CATEGORY_META,
  orderedBlogCategories,
} from "@/lib/content/categories";
import { TOPIC_CLUSTERS } from "@/lib/content/clusters";
import { getTool } from "@/lib/content/registry";
import { articlesInCategory } from "@/lib/content/registry";
import type { BlogCategory } from "@/lib/content/schema";
import { getTerm } from "@/lib/glossary/registry";
import { buildMetadata } from "@/lib/site/metadata";

interface Params {
  category: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return orderedBlogCategories()
    .filter((c) => articlesInCategory(c.id).length > 0)
    .map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = BLOG_CATEGORY_META[category as BlogCategory];
  if (!meta) return {};
  return buildMetadata({
    title: `${meta.label} articles`,
    description: meta.introduction.slice(0, 160),
    path: `/blog/category/${meta.slug}`,
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  const meta = BLOG_CATEGORY_META[category as BlogCategory];
  if (!meta) notFound();

  const articles = articlesInCategory(meta.id);
  if (!articles.length) notFound();

  const featured = articles.find((a) => a.meta.deepGuide) ?? articles[0];
  const cluster = TOPIC_CLUSTERS.find((c) =>
    articles.some((a) => a.meta.topicCluster === c.id),
  );

  const relatedLinks = cluster
    ? [
        ...cluster.relatedGlossary.map((s) => {
          const term = getTerm(s);
          return {
            href: `/glossary/${s}`,
            label: term?.meta.term ?? s.replace(/-/g, " "),
          };
        }),
        ...cluster.relatedDocs,
        ...cluster.relatedTools.map((t) => {
          const tool = getTool(t);
          return {
            href: `/tools/${t}`,
            label: tool?.meta.title ?? t.replace(/-/g, " "),
          };
        }),
        ...(meta.productCapability
          ? [
              {
                href: meta.productCapability.href,
                label: meta.productCapability.label,
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="fj-content-index">
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">
          <Link href="/blog">Blog</Link>
        </p>
        <h1 className="fj-heading-1">{meta.label}</h1>
        <p className="fj-body-lg">{meta.introduction}</p>
      </header>

      <section aria-labelledby="foundational-heading">
        <h2 id="foundational-heading" className="fj-heading-2">
          Start here
        </h2>
        <Link href={`/blog/${featured.meta.slug}`} className="fj-content-card fj-content-card--featured">
          <p className="fj-content-card__meta">
            {featured.meta.readingMinutes} min read
          </p>
          <h3 className="fj-heading-3">{featured.meta.title}</h3>
          <p className="fj-content-card__desc">{featured.meta.description}</p>
        </Link>
      </section>

      {articles.length > 1 ? (
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="fj-heading-2">
            All articles
          </h2>
          <ul className="fj-content-grid">
            {articles.map((a) => (
              <li key={a.meta.slug}>
                <Link href={`/blog/${a.meta.slug}`} className="fj-content-card">
                  <p className="fj-content-card__meta">
                    {a.meta.publishedAt} · {a.meta.readingMinutes} min
                  </p>
                  <h3 className="fj-heading-3">{a.meta.title}</h3>
                  <p className="fj-content-card__desc">{a.meta.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedLinks.length > 0 ? (
        <RelatedLinks title="Related resources" links={relatedLinks} />
      ) : null}
    </div>
  );
}
