import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RelatedLinks } from "@/components/content/related";
import {
  articlesInCluster,
  getCluster,
  plannedClusterTitles,
  publishedClusters,
} from "@/lib/content/clusters";
import { getTool } from "@/lib/content/registry";
import { getTerm } from "@/lib/glossary/registry";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  cluster: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedClusters().map((cluster) => ({ cluster: cluster.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { cluster: clusterId } = await params;
  const cluster = getCluster(clusterId);
  if (!cluster) return {};
  const articles = articlesInCluster(clusterId);
  if (articles.length === 0) return {};
  return buildMetadata({
    title: `${cluster.name} guides`,
    description: cluster.hubIntro,
    path: `/blog/topics/${cluster.id}`,
  });
}

export default async function TopicClusterHubPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { cluster: clusterId } = await params;
  const cluster = getCluster(clusterId);
  if (!cluster) notFound();

  const articles = articlesInCluster(clusterId);
  if (articles.length === 0) notFound();

  const pillar = cluster.pillarSlug
    ? articles.find((article) => article.meta.slug === cluster.pillarSlug)
    : undefined;
  const supporting = articles
    .filter((article) => article.meta.slug !== cluster.pillarSlug)
    .sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  const planned = plannedClusterTitles(cluster);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cluster.name} · Fajita`,
    description: cluster.hubIntro,
    url: `${siteUrl}/blog/topics/${cluster.id}`,
    hasPart: articles.map((article) => ({
      "@type": "TechArticle",
      name: article.meta.title,
      url: `${siteUrl}/blog/${article.meta.slug}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${siteUrl}/blog` },
      {
        "@type": "ListItem",
        position: 2,
        name: cluster.name,
        item: `${siteUrl}/blog/topics/${cluster.id}`,
      },
    ],
  };

  return (
    <article className="fj-content-index">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">
          <Link href="/blog">Blog</Link>
          {" · "}
          Topic hub
        </p>
        <h1 className="fj-heading-1">{cluster.name}</h1>
        <p className="fj-body-lg">{cluster.hubIntro}</p>
        <p className="fj-body-sm">
          {articles.length} published guide{articles.length === 1 ? "" : "s"}
          {cluster.pillarTitle && !pillar ? ` · Pillar planned: ${cluster.pillarTitle}` : ""}
        </p>
      </header>

      {pillar ? (
        <section aria-labelledby="pillar-heading">
          <h2 id="pillar-heading" className="fj-heading-2">
            Start here
          </h2>
          <Link href={`/blog/${pillar.meta.slug}`} className="fj-content-card fj-content-card--featured">
            <p className="fj-content-card__meta">
              Pillar guide · {pillar.meta.readingMinutes} min read
            </p>
            <h3 className="fj-heading-3">{pillar.meta.title}</h3>
            <p className="fj-content-card__desc">{pillar.meta.thesis}</p>
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="published-heading">
        <h2 id="published-heading" className="fj-heading-2">
          Published guides
        </h2>
        <ul className="fj-content-grid">
          {supporting.map((article) => (
            <li key={article.meta.slug}>
              <Link href={`/blog/${article.meta.slug}`} className="fj-content-card">
                <p className="fj-content-card__meta">
                  {article.meta.publishedAt} · {article.meta.readingMinutes} min read
                </p>
                <h3 className="fj-heading-3">{article.meta.title}</h3>
                <p className="fj-content-card__desc">{article.meta.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {planned.length > 0 ? (
        <section aria-labelledby="planned-heading">
          <h2 id="planned-heading" className="fj-heading-2">
            Coming next
          </h2>
          <ul className="fj-glossary-alpha-terms">
            {planned.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <RelatedLinks
        title="Glossary"
        links={cluster.relatedGlossary.map((slug) => {
          const term = getTerm(slug);
          return {
            href: `/glossary/${slug}`,
            label: term?.meta.term ?? slug.replace(/-/g, " "),
          };
        })}
      />
      <RelatedLinks title="Documentation" links={cluster.relatedDocs} />
      <RelatedLinks
        title="Tools"
        links={cluster.relatedTools.map((slug) => {
          const tool = getTool(slug);
          return {
            href: `/tools/${slug}`,
            label: tool?.meta.title ?? slug.replace(/-/g, " "),
          };
        })}
      />

      <section className="fj-content-related">
        <h2 className="fj-heading-2">In the product</h2>
        <p className="fj-body">
          <Link href={cluster.productHref}>{cluster.productLabel}</Link>
        </p>
      </section>
    </article>
  );
}
