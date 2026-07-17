import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BLOG_CATEGORY_META,
  orderedBlogCategories,
} from "@/lib/content/categories";
import { TOPIC_CLUSTERS } from "@/lib/content/clusters";
import { articlesInCategory } from "@/lib/content/registry";
import type { BlogCategory } from "@/lib/content/schema";
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

  return (
    <div>
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">
          <Link href="/blog">Blog</Link>
        </p>
        <h1 className="fj-heading-1">{meta.label}</h1>
        <p className="fj-body-lg">{meta.introduction}</p>
      </header>

      <section aria-labelledby="foundational-heading">
        <h2 id="foundational-heading" className="fj-heading-2">
          Foundational article
        </h2>
        <Link href={`/blog/${featured.meta.slug}`} className="fj-content-card">
          <h3 className="fj-heading-3">{featured.meta.title}</h3>
          <p>{featured.meta.description}</p>
        </Link>
      </section>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="fj-heading-2">
          Recent articles
        </h2>
        <ul className="fj-content-grid">
          {articles.map((a) => (
            <li key={a.meta.slug}>
              <Link href={`/blog/${a.meta.slug}`} className="fj-content-card">
                <p className="fj-content-card__meta">{a.meta.publishedAt}</p>
                {a.meta.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {cluster ? (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="fj-heading-2">
            Related resources
          </h2>
          <ul className="fj-content-grid">
            {cluster.relatedGlossary.map((s) => (
              <li key={s}>
                <Link href={`/glossary/${s}`}>Glossary: {s.replace(/-/g, " ")}</Link>
              </li>
            ))}
            {cluster.relatedDocs.map((d) => (
              <li key={d.href}>
                <Link href={d.href}>{d.label}</Link>
              </li>
            ))}
            {cluster.relatedTools.map((t) => (
              <li key={t}>
                <Link href={`/tools/${t}`}>Tool: {t.replace(/-/g, " ")}</Link>
              </li>
            ))}
            {meta.productCapability ? (
              <li>
                <Link href={meta.productCapability.href}>
                  {meta.productCapability.label}
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
