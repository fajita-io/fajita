import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";
import { tableOfContents } from "@/lib/docs/blocks";
import {
  allDocs,
  breadcrumbs,
  getDoc,
  prevNext,
} from "@/lib/docs/registry";
import { DocsBlocks } from "@/components/docs/blocks";
import { DocsFeedback } from "@/components/docs/feedback";
import {
  DocsRequirements,
  DocsDeprecatedBanner,
  DocsPageMeta,
  DocsPrerequisites,
} from "@/components/docs/page-meta";
import {
  DocsBreadcrumbs,
  DocsPrevNext,
  DocsRelated,
  DocsToc,
} from "@/components/docs/toc";

interface Params {
  slug: string[];
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return allDocs().map((doc) => ({ slug: doc.meta.slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getDoc(slug.join("/"));
  if (!page) return {};
  const noindex = page.meta.noindex || page.meta.status !== "published" || page.meta.deprecated;
  return buildMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: `/docs/${page.meta.slug}`,
    noindex,
  });
}

export default async function DocsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const key = slug.join("/");
  const page = getDoc(key);
  if (!page) notFound();

  // A deprecated page with a replacement redirects, preserving inbound links.
  if (page.meta.deprecated && page.meta.replacementSlug) {
    permanentRedirect(`/docs/${page.meta.replacementSlug}`);
  }

  const { meta, body } = page;
  const toc = tableOfContents(body);
  const { prev, next } = prevNext(meta.slug);
  const crumbs = breadcrumbs(meta.slug);
  const related = meta.relatedPages
    .map((s) => getDoc(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ slug: p.meta.slug, title: p.meta.title }));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: meta.title,
    description: meta.description,
    url: `${siteUrl}/docs/${meta.slug}`,
    dateModified: meta.lastReviewedAt,
    inLanguage: "en",
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${siteUrl}${c.href}`,
    })),
  };

  return (
    <div className="fj-docs-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]) }}
      />
      <div className="fj-docs-page__article">
        <DocsBreadcrumbs crumbs={crumbs} />
        <DocsDeprecatedBanner meta={meta} />
        <header className="fj-docs-page__header">
          <h1 className="fj-heading-1">{meta.title}</h1>
          <p className="fj-body-lg fj-docs-page__desc">{meta.description}</p>
          <DocsPageMeta meta={meta} />
          <DocsRequirements meta={meta} />
        </header>
        <DocsPrerequisites items={meta.prerequisites} />
        <article className="fj-docs-prose">
          <DocsBlocks blocks={body} />
        </article>
        <DocsFeedback slug={meta.slug} docsVersion={meta.docsVersion} />
        <DocsRelated pages={related} />
        <DocsPrevNext prev={prev} next={next} />
      </div>
      <aside className="fj-docs-page__toc">
        <DocsToc entries={toc} />
      </aside>
    </div>
  );
}
