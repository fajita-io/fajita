import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { SectionHeading } from "@/components/design-system/typography";
import { CtaButtons } from "@/components/site/cta-buttons";
import { FaqList } from "@/components/site/faq-list";
import { FeatureDemo } from "@/components/site/feature-demo";
import { buildMetadata } from "@/lib/site/metadata";
import { featureOrder, features, type FeatureSlug } from "@/lib/site/features";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return featureOrder.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = features[slug as FeatureSlug];
  if (!feature) return {};
  return buildMetadata({
    title: feature.metaTitle,
    description: feature.metaDescription,
    path: `/features/${feature.slug}`,
  });
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const feature = features[slug as FeatureSlug];
  if (!feature) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Features", item: `${siteUrl}/features` },
      {
        "@type": "ListItem",
        position: 2,
        name: feature.name,
        item: `${siteUrl}/features/${feature.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="fj-page-hero">
        <div className="fj-container">
          <nav aria-label="Breadcrumb">
            <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
              <Link href="/features" style={{ color: "inherit", textDecoration: "none" }}>
                Features
              </Link>{" "}
              / {feature.name}
            </p>
          </nav>
          <h1 className="fj-display-2">{feature.headline}</h1>
          <p className="fj-body-lg fj-page-hero__lede">{feature.lede}</p>
          <CtaButtons
            secondaryHref="/#how-it-works"
            secondaryLabel="Run the demo"
          />
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <FeatureDemo slug={feature.slug} />
          <div className="fj-facts">
            {feature.facts.map((fact) => (
              <div key={fact.label} className="fj-fact">
                <p className="fj-fact__label">{fact.label}</p>
                <p className="fj-body">{fact.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container" style={{ maxWidth: "56rem" }}>
          <SectionHeading eyebrow="In practice" title="Where this earns its keep." as="h2" />
          <ul className="fj-usecases">
            {feature.useCases.map((useCase) => (
              <li key={useCase} className="fj-body">
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container" style={{ maxWidth: "56rem" }}>
          <SectionHeading eyebrow="Fair questions" title="Before you commit." as="h2" />
          <FaqList items={feature.objections} />
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading eyebrow="Related" title="It works better together." as="h2" />
          <div className="fj-related">
            {feature.related.map((slug) => (
              <Link key={slug} href={`/features/${slug}`} className="fj-related__link">
                <BrandIcon name={features[slug].icon} size={16} />
                {features[slug].name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
