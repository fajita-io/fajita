import Link from "next/link";
import type { Metadata } from "next";

import { publicComparisons } from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Compare monitoring and status tools",
  description:
    "Fair, dated comparisons of uptime monitoring and status-page tools. Methodology, limitations, and correction path included.",
  path: "/compare",
});

export default function CompareIndexPage() {
  const pages = publicComparisons().filter(
    (c) => c.meta.slug !== "comparison-methodology",
  );
  const methodology = publicComparisons().find(
    (c) => c.meta.slug === "comparison-methodology",
  );

  return (
    <div className="fj-content-index">
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">Compare</p>
        <h1 className="fj-heading-1">Choose monitoring tools with clear eyes.</h1>
        <p className="fj-body-lg">
          Fajita authors these pages. We still require dated official sources,
          competitor strengths, our own limitations, and a public correction
          path. Fajita is not always the best fit.
        </p>
        {methodology ? (
          <div className="fj-content-index__actions">
            <Link
              href={`/compare/${methodology.meta.slug}`}
              className="fj-button fj-button--primary"
            >
              Read the methodology
            </Link>
          </div>
        ) : null}
      </header>

      <section aria-labelledby="uptime-heading">
        <h2 id="uptime-heading" className="fj-heading-2">
          Uptime monitoring comparisons
        </h2>
        <ul className="fj-content-grid">
          {pages
            .filter((p) =>
              ["versus", "category", "alternative"].includes(p.meta.comparisonType),
            )
            .filter((p) => p.meta.topicCluster !== "status-pages")
            .map((p) => (
              <li key={p.meta.slug}>
                <Link href={`/compare/${p.meta.slug}`} className="fj-content-card">
                  <p className="fj-content-card__meta">
                    Last reviewed {p.meta.lastReviewedAt}
                  </p>
                  <h3 className="fj-heading-3">{p.meta.title}</h3>
                  <p>{p.meta.description}</p>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="status-heading">
        <h2 id="status-heading" className="fj-heading-2">
          Status-page comparisons
        </h2>
        <ul className="fj-content-grid">
          {pages
            .filter(
              (p) =>
                p.meta.comparisonType === "status-page" ||
                p.meta.topicCluster === "status-pages",
            )
            .map((p) => (
              <li key={p.meta.slug}>
                <Link href={`/compare/${p.meta.slug}`} className="fj-content-card">
                  <p className="fj-content-card__meta">
                    Last reviewed {p.meta.lastReviewedAt}
                  </p>
                  <h3 className="fj-heading-3">{p.meta.title}</h3>
                  <p>{p.meta.description}</p>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
