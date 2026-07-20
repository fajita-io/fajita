import Link from "next/link";
import type { Metadata } from "next";

import { publicTerms } from "@/lib/glossary/registry";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Glossary Updates",
  description:
    "New and updated Fajita glossary definitions for software reliability terms.",
  path: "/glossary/updates",
});

export default function GlossaryUpdatesPage() {
  const terms = [...publicTerms()].sort((a, b) =>
    b.meta.lastReviewedAt.localeCompare(a.meta.lastReviewedAt),
  );

  const byDate = new Map<string, typeof terms>();
  for (const term of terms) {
    const list = byDate.get(term.meta.lastReviewedAt) ?? [];
    list.push(term);
    byDate.set(term.meta.lastReviewedAt, list);
  }

  return (
    <article className="fj-glossary-index">
      <header className="fj-glossary-index__hero">
        <p className="fj-eyebrow">
          <Link href="/glossary">Glossary</Link>
        </p>
        <h1 className="fj-heading-1">Recently updated terms</h1>
        <p className="fj-body-lg">
          New definitions and material revisions to the reliability glossary.
        </p>
      </header>
      {[...byDate.entries()].map(([date, list]) => (
        <section key={date}>
          <h2 className="fj-heading-2">{date}</h2>
          <ul className="fj-glossary-term-list">
            {list.map((t) => (
              <li key={t.meta.slug}>
                <Link href={`/glossary/${t.meta.slug}`}>
                  <strong>{t.meta.term}</strong>
                  <span>{t.meta.shortDefinition}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
