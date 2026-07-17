import Link from "next/link";
import type { Metadata } from "next";

import { PoweredByWiki } from "@/components/glossary/powered-by-wiki";
import { GLOSSARY_VERSION } from "@/lib/glossary/frontmatter";
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
    <article className="fj-glossary-updates">
      <h1 className="fj-heading-1">Glossary updates</h1>
      <p className="fj-body">
        Material definition updates and new published terms. Glossary version{" "}
        {GLOSSARY_VERSION}.
      </p>
      {[...byDate.entries()].map(([date, list]) => (
        <section key={date}>
          <h2 className="fj-heading-2">{date}</h2>
          <ul className="fj-glossary-term-list">
            {list.map((t) => (
              <li key={t.meta.slug}>
                <Link href={`/glossary/${t.meta.slug}`}>
                  <strong>{t.meta.term}</strong>
                  <span>
                    {t.meta.contentVersion === "1" ? "Published" : "Updated"} ·
                    v{t.meta.contentVersion}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <PoweredByWiki />
    </article>
  );
}
