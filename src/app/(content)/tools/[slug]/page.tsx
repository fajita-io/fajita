import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsBlocks } from "@/components/docs/blocks";
import { ContentProductCta } from "@/components/content/content-cta";
import { ContentFeedback } from "@/components/content/content-feedback";
import {
  ContentBreadcrumbs,
  RelatedLinks,
} from "@/components/content/related";
import { CronExplainerTool } from "@/components/content/tools/cron-explainer";
import { StatusChecklistTool } from "@/components/content/tools/status-checklist";
import { UptimeCalculatorTool } from "@/components/content/tools/uptime-calculator";
import { WebhookSignatureTool } from "@/components/content/tools/webhook-signature";
import { getTool, publicTools } from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publicTools().map((t) => ({ slug: t.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || tool.meta.status !== "published") return {};
  return buildMetadata({
    title: tool.meta.title,
    description: tool.meta.description,
    path: `/tools/${tool.meta.slug}`,
  });
}

function ToolInterface({ slug }: { slug: string }) {
  switch (slug) {
    case "uptime-calculator":
      return <UptimeCalculatorTool />;
    case "webhook-signature-generator":
      return <WebhookSignatureTool />;
    case "cron-expression-explainer":
      return <CronExplainerTool />;
    case "status-page-checklist":
      return <StatusChecklistTool />;
    default:
      return null;
  }
}

export default async function ToolPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || tool.meta.status !== "published") notFound();
  const { meta, body } = tool;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: meta.title,
    description: meta.description,
    url: `${siteUrl}/tools/${meta.slug}`,
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@type": "Organization", name: "Fajita", url: siteUrl },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentBreadcrumbs
        items={[
          { href: "/tools", label: "Tools" },
          { href: `/tools/${meta.slug}`, label: meta.title },
        ]}
      />
      <header className="fj-content-index__hero">
        <h1 className="fj-heading-1">{meta.title}</h1>
        <p className="fj-body-lg">{meta.description}</p>
        <p className="fj-content-meta">
          Last reviewed {meta.lastReviewedAt} · Network:{" "}
          {meta.networkAccess ? "yes" : "no"} · Storage:{" "}
          {meta.storesInput ? "yes" : "no"}
        </p>
      </header>

      <ToolInterface slug={meta.slug} />

      <section aria-labelledby="privacy-heading">
        <h2 id="privacy-heading" className="fj-heading-2">
          Input privacy
        </h2>
        <p>{meta.privacySummary}</p>
      </section>

      <section aria-labelledby="method-heading">
        <h2 id="method-heading" className="fj-heading-2">
          Methodology
        </h2>
        <p>{meta.methodologySummary}</p>
      </section>

      <DocsBlocks blocks={body} />

      <section aria-labelledby="limits-heading">
        <h2 id="limits-heading" className="fj-heading-2">
          Limitations
        </h2>
        <ul>
          {meta.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <ContentProductCta variant={meta.productCta} contentSlug={meta.slug} />
      <RelatedLinks title="Documentation" links={meta.relatedDocs} />
      <RelatedLinks
        title="Glossary"
        links={meta.relatedGlossary.map((s) => ({
          href: `/glossary/${s}`,
          label: s.replace(/-/g, " "),
        }))}
      />
      <ContentFeedback
        contentType="tool"
        slug={meta.slug}
        prompt="Did this tool give you what you needed?"
      />
      <p className="fj-body-sm">
        <Link href={`/tools/raw/${meta.slug}`}>Plain-text version</Link>
      </p>
    </article>
  );
}
