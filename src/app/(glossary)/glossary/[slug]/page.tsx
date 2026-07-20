import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { DocsBlocks } from "@/components/docs/blocks";
import { DocsToc } from "@/components/docs/toc";
import { GlossaryFeedback } from "@/components/glossary/feedback";
import {
  GlossaryBreadcrumbs,
  GlossaryDocLinks,
  GlossaryPrevNext,
  GlossaryProductCTA,
  GlossaryRelated,
} from "@/components/glossary/term-chrome";
import { tableOfContents } from "@/lib/docs/blocks";
import {
  GLOSSARY_REDIRECTS,
  resolveGlossaryRedirect,
} from "@/lib/glossary/redirects";
import {
  allTerms,
  breadcrumbs,
  getTerm,
  prevNext,
} from "@/lib/glossary/registry";
import { GLOSSARY_CATEGORY_META } from "@/lib/glossary/categories";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const published = allTerms().map((t) => ({ slug: t.meta.slug }));
  const redirects = Object.keys(GLOSSARY_REDIRECTS).map((slug) => ({ slug }));
  const seen = new Set<string>();
  return [...published, ...redirects].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const redirectTo = resolveGlossaryRedirect(slug);
  if (redirectTo) {
    const target = getTerm(redirectTo);
    if (target) {
      return buildMetadata({
        title: target.meta.title ?? `What Is ${target.meta.term}?`,
        description: target.meta.description ?? target.meta.shortDefinition.slice(0, 160),
        path: `/glossary/${target.meta.slug}`,
      });
    }
  }
  const term = getTerm(slug);
  if (!term) return {};
  const noindex =
    term.meta.noindex ||
    term.meta.status !== "published" ||
    term.meta.deprecated;
  return buildMetadata({
    title: term.meta.title ?? `What Is ${term.meta.term}?`,
    description: term.meta.description ?? term.meta.shortDefinition.slice(0, 160),
    path: `/glossary/${term.meta.slug}`,
    noindex,
  });
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const redirectTo = resolveGlossaryRedirect(slug);
  if (redirectTo) {
    permanentRedirect(`/glossary/${redirectTo}`);
  }

  const term = getTerm(slug);
  if (!term) notFound();

  if (term.meta.deprecated && term.meta.replacementSlug) {
    permanentRedirect(`/glossary/${term.meta.replacementSlug}`);
  }

  const { meta, body, faqs, formula } = term;
  const toc = tableOfContents(body);
  const { prev, next } = prevNext(meta.slug);
  const crumbs = breadcrumbs(meta.slug);
  const related = meta.relatedTerms
    .map((s) => getTerm(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({ slug: t.meta.slug, term: t.meta.term }));
  const cat = GLOSSARY_CATEGORY_META[meta.category];

  const definedTermLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: meta.term,
    description: meta.shortDefinition,
    url: `${siteUrl}/glossary/${meta.slug}`,
    inDefinedTermSet: `${siteUrl}/glossary`,
    alternateName: [
      ...(meta.acronym ? [meta.acronym] : []),
      ...meta.synonyms,
    ],
    dateModified: meta.lastReviewedAt,
    publisher: {
      "@type": "Organization",
      name: "Fajita",
      url: siteUrl,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${siteUrl}${c.href}`,
    })),
  };

  const faqLd =
    faqs && faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <div className="fj-glossary-term">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [definedTermLd, breadcrumbLd, faqLd].filter(Boolean),
          ),
        }}
      />
      <div className="fj-glossary-term__article">
        <GlossaryBreadcrumbs crumbs={crumbs} />
        <header className="fj-glossary-term__header">
          <p className="fj-eyebrow">
            <a href={`/glossary/category/${cat.slug}`}>{cat.label}</a>
            {meta.acronym ? ` · ${meta.acronym}` : ""}
          </p>
          <h1 className="fj-heading-1">{meta.term}</h1>
          <p className="fj-body-lg">{meta.shortDefinition}</p>
        </header>

        <section
          className="fj-glossary-short-answer"
          aria-labelledby="short-answer-heading"
        >
          <h2 id="short-answer-heading" className="fj-heading-2">
            What is {meta.term.toLowerCase()}?
          </h2>
          <blockquote className="fj-glossary-short-answer__quote">
            <p>{meta.shortAnswer}</p>
          </blockquote>
        </section>

        <article className="fj-docs-prose">
          <DocsBlocks blocks={body} />
          {formula ? (
            <section aria-labelledby="formula-heading">
              <h2 id="formula-heading">{formula.label}</h2>
              <pre className="fj-glossary-formula">
                <code>{formula.expression}</code>
              </pre>
              <ul>
                {formula.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {faqs && faqs.length > 0 ? (
            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading">Frequently asked questions</h2>
              {faqs.map((f) => (
                <div key={f.question} className="fj-glossary-faq">
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </section>
          ) : null}
        </article>

        <GlossaryRelated terms={related} />
        <GlossaryDocLinks links={meta.documentationLinks} />
        <GlossaryProductCTA variant={meta.cta} />

        <GlossaryFeedback slug={meta.slug} contentVersion={meta.contentVersion} />
        <GlossaryPrevNext prev={prev} next={next} />
      </div>
      <aside className="fj-glossary-term__toc">
        <DocsToc entries={toc} />
      </aside>
    </div>
  );
}
