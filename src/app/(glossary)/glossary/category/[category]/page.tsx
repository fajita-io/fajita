import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GlossaryBreadcrumbs } from "@/components/glossary/term-chrome";
import {
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
} from "@/lib/glossary/frontmatter";
import {
  categoryBreadcrumbs,
  getCategoryMeta,
  getTerm,
  termsInCategory,
} from "@/lib/glossary/registry";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  category: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return GLOSSARY_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!GLOSSARY_CATEGORIES.includes(category as GlossaryCategory)) return {};
  const meta = getCategoryMeta(category as GlossaryCategory);
  return buildMetadata({
    title: `${meta.label} Glossary`,
    description: meta.definition.slice(0, 160),
    path: `/glossary/category/${meta.slug}`,
  });
}

export default async function GlossaryCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category: raw } = await params;
  if (!GLOSSARY_CATEGORIES.includes(raw as GlossaryCategory)) notFound();
  const category = raw as GlossaryCategory;
  const meta = getCategoryMeta(category);
  const terms = termsInCategory(category);
  const crumbs = categoryBreadcrumbs(category);
  const foundational = meta.foundationalSlugs
    .map((s) => getTerm(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const advanced = meta.advancedSlugs
    .map((s) => getTerm(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const learning = meta.learningOrder
    .map((s) => getTerm(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${meta.label} · Fajita Glossary`,
    description: meta.definition,
    url: `${siteUrl}/glossary/category/${meta.slug}`,
  };

  return (
    <article className="fj-glossary-index">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GlossaryBreadcrumbs crumbs={crumbs} />
      <header className="fj-glossary-index__hero">
        <p className="fj-eyebrow">Category</p>
        <h1 className="fj-heading-1">{meta.label}</h1>
        <p className="fj-body-lg">{meta.definition}</p>
      </header>

      <section>
        <h2 className="fj-heading-2">Why this category matters</h2>
        <p className="fj-body">{meta.whyItMatters}</p>
      </section>

      <section>
        <h2 className="fj-heading-2">Recommended learning order</h2>
        <ol className="fj-glossary-learn">
          {learning.map((t) => (
            <li key={t.meta.slug}>
              <Link href={`/glossary/${t.meta.slug}`}>{t.meta.term}</Link>
              <span>{t.meta.shortDefinition}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="fj-heading-2">Foundational terms</h2>
        <ul className="fj-glossary-term-list">
          {foundational.map((t) => (
            <li key={t.meta.slug}>
              <Link href={`/glossary/${t.meta.slug}`}>
                <strong>{t.meta.term}</strong>
                <span>{t.meta.shortDefinition}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {advanced.length > 0 ? (
        <section>
          <h2 className="fj-heading-2">Advanced terms</h2>
          <ul className="fj-glossary-term-list">
            {advanced.map((t) => (
              <li key={t.meta.slug}>
                <Link href={`/glossary/${t.meta.slug}`}>
                  <strong>{t.meta.term}</strong>
                  <span>{t.meta.shortDefinition}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="fj-heading-2">All terms in {meta.label}</h2>
        <ul className="fj-glossary-alpha-terms">
          {terms.map((t) => (
            <li key={t.meta.slug}>
              <Link href={`/glossary/${t.meta.slug}`}>{t.meta.term}</Link>
            </li>
          ))}
        </ul>
      </section>

      {meta.documentationLinks.length > 0 ? (
        <section className="fj-content-related">
          <h2 className="fj-heading-2">Related documentation</h2>
          <ul>
            {meta.documentationLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {meta.productLinks.length > 0 ? (
        <section className="fj-content-related">
          <h2 className="fj-heading-2">In the product</h2>
          <ul>
            {meta.productLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
