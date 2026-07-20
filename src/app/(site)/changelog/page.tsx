import type { Metadata } from "next";

import { changelog, changeTagLabels } from "@/lib/site/changelog";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Changelog",
  description:
    "What shipped in Fajita, in plain language. Customer-visible progress only: no invented releases, no internal engineering noise.",
  path: "/changelog",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default function ChangelogPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Changelog
          </p>
          <h1 className="fj-display-2">What shipped.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Every entry here describes something you can see or use. We do
            not backfill history and we do not announce work twice.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-article-list">
            {changelog.map((entry) => (
              <article key={entry.id} id={entry.id} className="fj-entry">
                <div className="fj-entry__meta">
                  <time className="fj-entry__date" dateTime={entry.date}>
                    {dateFormatter.format(new Date(`${entry.date}T00:00:00Z`))}
                  </time>
                  <span className="fj-tag">{changeTagLabels[entry.tag]}</span>
                </div>
                <h2 className="fj-heading-2">{entry.title}</h2>
                {entry.body.map((paragraph, i) => (
                  <p key={i} className="fj-body">
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
