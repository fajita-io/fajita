import Link from "next/link";

import { TOPIC_CLUSTERS } from "@/lib/content/clusters";
import { allArticles } from "@/lib/content/registry";

/**
 * Lightweight editorial calendar view. Not a general project manager.
 * Auto-publish based on dates is forbidden.
 */
export default function InternalCalendarPage() {
  const published = allArticles.filter((a) => a.meta.status === "published");
  const planned = TOPIC_CLUSTERS.flatMap((c) =>
    c.supportingTitles
      .filter(
        (title) =>
          !published.some(
            (a) => a.meta.title.toLowerCase() === title.toLowerCase(),
          ),
      )
      .map((title) => ({
        cluster: c.id,
        title,
        status: "proposed" as const,
      })),
  );

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/content">Content ops</Link>
      </p>
      <h1 className="fj-heading-1">Editorial calendar</h1>
      <p>
        Published items have dates. Planned titles are proposals only. Nothing
        auto-publishes from this view.
      </p>
      <h2 className="fj-heading-2">Published</h2>
      <ul>
        {published.map((a) => (
          <li key={a.meta.slug}>
            {a.meta.publishedAt}: {a.meta.title}
          </li>
        ))}
      </ul>
      <h2 className="fj-heading-2">Proposed supporting titles</h2>
      <ul>
        {planned.slice(0, 40).map((p) => (
          <li key={`${p.cluster}-${p.title}`}>
            [{p.cluster}] {p.title} · {p.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
