import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsBlocks } from "@/components/docs/blocks";
import { ContentProductCta } from "@/components/content/content-cta";
import { ContentFeedback } from "@/components/content/content-feedback";
import { ComparisonCorrectionForm } from "@/components/content/correction-form";
import {
  ContentBreadcrumbs,
  RelatedLinks,
} from "@/components/content/related";
import { factsForPage } from "@/lib/content/comparisons";
import {
  getComparison,
  publicComparisons,
} from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publicComparisons().map((c) => ({ slug: c.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparison(slug);
  if (!page || page.meta.status !== "published") return {};
  return buildMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: `/compare/${page.meta.slug}`,
  });
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = getComparison(slug);
  if (!page || page.meta.status !== "published") notFound();
  const { meta, body } = page;
  const facts = factsForPage(meta.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt,
    author: { "@type": "Organization", name: "Fajita" },
    publisher: { "@type": "Organization", name: "Fajita", url: siteUrl },
    mainEntityOfPage: `${siteUrl}/compare/${meta.slug}`,
  };

  return (
    <article className="fj-content-article__body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentBreadcrumbs
        items={[
          { href: "/compare", label: "Compare" },
          { href: `/compare/${meta.slug}`, label: meta.title },
        ]}
      />
      <header>
        <h1 className="fj-heading-1">{meta.title}</h1>
        <p className="fj-content-meta">
          Last reviewed {meta.lastReviewedAt} · Version {meta.contentVersion} ·
          Pricing status: {meta.pricingStatus}
        </p>
        <p className="fj-content-thesis">{meta.summary}</p>
        <p className="fj-body-sm">
          <Link href={`/compare/${meta.methodologySlug}`}>Research methodology</Link>
        </p>
      </header>

      <section aria-labelledby="fit-heading">
        <h2 id="fit-heading" className="fj-heading-2">
          Best fit
        </h2>
        <p>
          <strong>Fajita:</strong> {meta.fajitaBestFor}
        </p>
        {meta.competitorBestFor ? (
          <p>
            <strong>Other product:</strong> {meta.competitorBestFor}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="limits-heading">
        <h2 id="limits-heading" className="fj-heading-2">
          Fajita limitations
        </h2>
        <ul>
          {meta.fajitaLimitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {meta.competitorStrengths?.length ? (
          <>
            <h3 className="fj-heading-3">Competitor strengths</h3>
            <ul>
              {meta.competitorStrengths.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <div className="fj-compare-table-wrap">
        <DocsBlocks blocks={body} />
      </div>

      {facts.length ? (
        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="fj-heading-2">
            Source notes
          </h2>
          <ul>
            {facts.map((f) => (
              <li key={f.id}>
                {f.fact}{" "}
                <a href={f.sourceUrl} rel="noopener noreferrer">
                  Source
                </a>{" "}
                (verified {f.dateVerified})
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="fj-body-sm">{meta.trademarkNotice}</p>

      <ContentProductCta variant={meta.productCta} contentSlug={meta.slug} />
      <RelatedLinks title="Documentation" links={meta.relatedDocs} />
      <RelatedLinks
        title="Glossary"
        links={meta.relatedGlossary.map((s) => ({
          href: `/glossary/${s}`,
          label: s.replace(/-/g, " "),
        }))}
      />

      {meta.slug !== "comparison-methodology" ? (
        <ComparisonCorrectionForm slug={meta.slug} />
      ) : null}

      <ContentFeedback
        contentType="comparison"
        slug={meta.slug}
        prompt="Was this comparison accurate and fair?"
      />
      <p className="fj-body-sm">
        <Link href={`/compare/raw/${meta.slug}`}>Plain-text version</Link>
      </p>
    </article>
  );
}
