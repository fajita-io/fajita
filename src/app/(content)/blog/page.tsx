import Link from "next/link";
import type { Metadata } from "next";

import { publishedClusters } from "@/lib/content/clusters";
import { orderedBlogCategories } from "@/lib/content/categories";
import {
  deepGuides,
  featuredArticles,
  latestArticles,
  publicResearch,
  publicTools,
} from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reliability blog",
  description:
    "Practical reliability thinking for small software teams: monitoring guides, incident writing, status pages, and original frameworks.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const featured = featuredArticles()[0];
  const latest = latestArticles(8);
  const guides = deepGuides().slice(0, 4);
  const topicHubs = publishedClusters();
  const categories = orderedBlogCategories().filter((c) =>
    latest.some((a) => a.meta.category === c.id) ||
    featuredArticles().some((a) => a.meta.category === c.id),
  );
  const research = publicResearch();
  const tools = publicTools();

  return (
    <div className="fj-content-index">
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">Blog</p>
        <h1 className="fj-heading-1">
          Practical reliability thinking for small software teams.
        </h1>
        <p className="fj-body-lg">
          Clear guides, operating frameworks, technical explanations, and
          original research for teams that need to know when software fails and
          communicate what happens next.
        </p>
        <div className="fj-content-index__actions">
          <a href="#latest" className="fj-button fj-button--primary">
            Read the Latest
          </a>
          <Link href="/blog/category/monitoring" className="fj-button fj-button--secondary">
            Explore Monitoring Guides
          </Link>
        </div>
      </header>

      {featured ? (
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="fj-heading-2">
            Featured
          </h2>
          <Link
            href={`/blog/${featured.meta.slug}`}
            className="fj-content-card fj-content-card--featured"
          >
            <p className="fj-content-card__meta">
              {featured.meta.publishedAt} · {featured.meta.readingMinutes} min
            </p>
            <h3 className="fj-heading-3">{featured.meta.title}</h3>
            <p className="fj-content-card__desc">{featured.meta.description}</p>
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="fj-heading-2">
          Topic hubs
        </h2>
        <ul className="fj-content-grid fj-content-grid--topics">
          {topicHubs.map((cluster) => (
            <li key={cluster.id}>
              <Link href={`/blog/topics/${cluster.id}`} className="fj-content-card">
                <span className="fj-content-card__label">{cluster.name}</span>
                <p className="fj-content-card__desc">{cluster.hubIntro}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="fj-heading-2">
          Categories
        </h2>
        <ul className="fj-content-grid fj-content-grid--topics">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/blog/category/${cat.slug}`} className="fj-content-card">
                <span className="fj-content-card__label">{cat.label}</span>
                <p className="fj-content-card__desc">{cat.introduction}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="latest" aria-labelledby="latest-heading">
        <h2 id="latest-heading" className="fj-heading-2">
          Latest articles
        </h2>
        <ul className="fj-content-grid">
          {latest.map((a) => (
            <li key={a.meta.slug}>
              <Link href={`/blog/${a.meta.slug}`} className="fj-content-card">
                <p className="fj-content-card__meta">
                  {a.meta.publishedAt} · {a.meta.readingMinutes} min read
                </p>
                <h3 className="fj-heading-3">{a.meta.title}</h3>
                <p className="fj-content-card__desc">{a.meta.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guides-heading">
        <h2 id="guides-heading" className="fj-heading-2">
          Deep guides
        </h2>
        <ul className="fj-content-grid">
          {guides.map((a) => (
            <li key={a.meta.slug}>
              <Link href={`/blog/${a.meta.slug}`} className="fj-content-card">
                {a.meta.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="research-heading">
        <h2 id="research-heading" className="fj-heading-2">
          Original research
        </h2>
        {research.length ? (
          <ul className="fj-content-grid">
            {research.map((r) => (
              <li key={r.meta.slug}>
                <Link href={`/research/${r.meta.slug}`} className="fj-content-card">
                  {r.meta.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Methodology is published. Findings wait until privacy-safe cohorts
            exist.
          </p>
        )}
      </section>

      <section aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="fj-heading-2">
          Useful tools
        </h2>
        <ul className="fj-content-grid">
          {tools.map((t) => (
            <li key={t.meta.slug}>
              <Link href={`/tools/${t.meta.slug}`} className="fj-content-card">
                {t.meta.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
