import Link from "next/link";
import type { Metadata } from "next";

import { publicArticles } from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Blog updates",
  description:
    "Editorial changelog for Fajita blog articles: publications, corrections, and material revisions.",
  path: "/blog/updates",
});

export default function BlogUpdatesPage() {
  const articles = [...publicArticles()].sort((a, b) =>
    (b.meta.updatedAt ?? "").localeCompare(a.meta.updatedAt ?? ""),
  );

  return (
    <div>
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">
          <Link href="/blog">Blog</Link>
        </p>
        <h1 className="fj-heading-1">Blog updates</h1>
        <p className="fj-body-lg">
          Material changes bump the content version and updated date. Silent
          rewrites of research or competitor claims are not allowed.
        </p>
      </header>
      <ul className="fj-content-grid">
        {articles.map((a) => (
          <li key={a.meta.slug}>
            <Link href={`/blog/${a.meta.slug}`} className="fj-content-card">
              <p className="fj-content-card__meta">
                v{a.meta.contentVersion} · updated {a.meta.updatedAt}
                {a.meta.changeSummary ? ` · ${a.meta.changeSummary}` : ""}
              </p>
              {a.meta.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
