import Link from "next/link";
import type { Metadata } from "next";

import { allResearch, publicResearch } from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Original research",
  description:
    "Privacy-safe reliability research from Fajita. Methodology first. Findings only when cohort thresholds are met.",
  path: "/research",
});

export default function ResearchIndexPage() {
  const published = publicResearch();
  const insufficient = allResearch.filter((r) => r.meta.status === "data-insufficient");

  return (
    <div>
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">Research</p>
        <h1 className="fj-heading-1">Original research, only when the data is real.</h1>
        <p className="fj-body-lg">
          Fajita publishes aggregated, privacy-reviewed findings after methodology
          and minimum cohort thresholds are met. Data-insufficient is a valid
          public state. No fabricated benchmarks.
        </p>
      </header>

      <section aria-labelledby="published-heading">
        <h2 id="published-heading" className="fj-heading-2">
          Published
        </h2>
        <ul className="fj-content-grid">
          {published.map((r) => (
            <li key={r.meta.slug}>
              <Link href={`/research/${r.meta.slug}`} className="fj-content-card">
                <h3 className="fj-heading-3">{r.meta.title}</h3>
                <p>{r.meta.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="insufficient-heading">
        <h2 id="insufficient-heading" className="fj-heading-2">
          Data insufficient
        </h2>
        <ul className="fj-content-grid">
          {insufficient.map((r) => (
            <li key={r.meta.slug} className="fj-content-card">
              <h3 className="fj-heading-3">{r.meta.title}</h3>
              <p>{r.meta.description}</p>
              <p className="fj-content-card__meta">Status: data-insufficient</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
