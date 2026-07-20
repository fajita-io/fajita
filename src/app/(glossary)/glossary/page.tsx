import Link from "next/link";
import type { Metadata } from "next";

import { GlossaryAlphabet } from "@/components/glossary/alphabet";
import { GlossarySearch } from "@/components/glossary/search";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";
import {
  alphabetAvailability,
  featuredTerms,
  foundationalTerms,
  orderedCategories,
  recentlyUpdated,
} from "@/lib/glossary/registry";
import { GLOSSARY_VERSION } from "@/lib/glossary/frontmatter";

export const metadata: Metadata = buildMetadata({
  title: "Software Reliability Glossary",
  description:
    "Clear definitions for uptime monitoring, API checks, incidents, alerts, status pages, webhooks, SSL certificates, and cron jobs.",
  path: "/glossary",
});

export default function GlossaryIndexPage() {
  const categories = orderedCategories();
  const featured = featuredTerms();
  const startHere = foundationalTerms().slice(0, 6);
  const updated = recentlyUpdated(8);
  const letters = alphabetAvailability();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Fajita Software Reliability Glossary",
    description:
      "Definitions for uptime monitoring, incidents, alerts, status pages, and related reliability concepts.",
    url: `${siteUrl}/glossary`,
    dateModified: GLOSSARY_VERSION,
    publisher: {
      "@type": "Organization",
      name: "Fajita",
      url: siteUrl,
    },
  };

  return (
    <div className="fj-glossary-index">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="fj-glossary-index__hero">
        <p className="fj-eyebrow">Glossary</p>
        <h1 className="fj-heading-1">The software reliability glossary.</h1>
        <p className="fj-body-lg">
          Clear definitions for uptime monitoring, API checks, incidents, alerts,
          status pages, webhooks, SSL certificates, cron jobs, and the systems
          that keep software dependable.
        </p>
        <div className="fj-glossary-index__actions">
          <a href="#glossary-search" className="fj-button fj-button--primary">
            Search the Glossary
          </a>
          <a href="#all-terms" className="fj-button fj-button--secondary">
            Browse All Terms
          </a>
        </div>
      </header>

      <section
        id="glossary-search"
        className="fj-glossary-index__search"
        aria-label="Search"
      >
        <GlossarySearch variant="inline" autoFocus={false} />
      </section>

      <section aria-labelledby="featured-categories-heading">
        <h2 id="featured-categories-heading" className="fj-heading-2">
          Featured categories
        </h2>
        <ul className="fj-glossary-cat-grid">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/glossary/category/${cat.slug}`}
                className="fj-glossary-cat-card"
              >
                <span className="fj-glossary-cat-card__label">{cat.label}</span>
                <span className="fj-glossary-cat-card__def">{cat.definition}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="featured-terms-heading">
        <h2 id="featured-terms-heading" className="fj-heading-2">
          Featured terms
        </h2>
        <ul className="fj-glossary-term-list">
          {featured.map((t) => (
            <li key={t.meta.slug}>
              <Link href={`/glossary/${t.meta.slug}`}>
                <strong>{t.meta.term}</strong>
                <span>{t.meta.shortDefinition}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="start-here-heading">
        <h2 id="start-here-heading" className="fj-heading-2">
          Start here
        </h2>
        <ul className="fj-glossary-pill-list">
          {startHere.map((t) => (
            <li key={t.meta.slug}>
              <Link href={`/glossary/${t.meta.slug}`}>{t.meta.term}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="all-terms" aria-labelledby="alpha-heading">
        <h2 id="alpha-heading" className="fj-heading-2">
          Alphabetical index
        </h2>
        <GlossaryAlphabet letters={letters} />
      </section>

      <section aria-labelledby="updated-heading">
        <h2 id="updated-heading" className="fj-heading-2">
          Recently updated
        </h2>
        <ul className="fj-glossary-term-list">
          {updated.map((t) => (
            <li key={t.meta.slug}>
              <Link href={`/glossary/${t.meta.slug}`}>
                <strong>{t.meta.term}</strong>
                <span>{t.meta.shortDefinition}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="fj-glossary-index__footer">
        <p className="fj-caption">
          <Link href="/glossary/updates">Recently updated terms</Link>
        </p>
      </footer>
    </div>
  );
}
