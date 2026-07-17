import Link from "next/link";

import {
  allArticles,
  allComparisons,
  allResearch,
  allTools,
  orphanArticles,
  staleContent,
} from "@/lib/content/registry";
import { COMPETITOR_FACTS, staleFacts } from "@/lib/content/comparisons";
import { CONVERSION_CORRIDORS } from "@/lib/content/corridors";
import { TOPIC_CLUSTERS } from "@/lib/content/clusters";

export default function InternalContentHome() {
  const stale = staleContent("2026-10-18");
  const orphans = orphanArticles();

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1 className="fj-heading-1">Content operations</h1>
      <p className="fj-body-lg">
        Internal view of publication state, staleness, orphans, corridors, and
        competitor facts. Noindex. Platform-admin or development only.
      </p>

      <ul>
        <li>
          <Link href="/internal/content/articles">Articles</Link> ({allArticles.length})
        </li>
        <li>
          <Link href="/internal/content/comparisons">Comparisons</Link> (
          {allComparisons.length})
        </li>
        <li>
          <Link href="/internal/content/tools">Tools</Link> ({allTools.length})
        </li>
        <li>
          <Link href="/internal/content/research">Research</Link> ({allResearch.length})
        </li>
        <li>
          <Link href="/internal/content/stale">Stale</Link>
        </li>
        <li>
          <Link href="/internal/content/links">Links</Link>
        </li>
        <li>
          <Link href="/internal/content/calendar">Calendar</Link>
        </li>
        <li>
          <Link href="/internal/content-lab">Content lab</Link>
        </li>
      </ul>

      <section>
        <h2 className="fj-heading-2">Snapshot</h2>
        <ul>
          <li>Published articles: {allArticles.filter((a) => a.meta.status === "published").length}</li>
          <li>Competitor facts: {COMPETITOR_FACTS.length}</li>
          <li>Facts due for review: {staleFacts("2026-10-18").length}</li>
          <li>Orphan articles: {orphans.length}</li>
          <li>Stale articles (next review before 2026-10-18): {stale.articles.length}</li>
          <li>Topic clusters: {TOPIC_CLUSTERS.length}</li>
          <li>Conversion corridors: {CONVERSION_CORRIDORS.length}</li>
        </ul>
      </section>
    </main>
  );
}
