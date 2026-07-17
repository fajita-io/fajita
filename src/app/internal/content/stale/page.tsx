import Link from "next/link";

import { staleFacts } from "@/lib/content/comparisons";
import { staleContent } from "@/lib/content/registry";

export default function InternalStalePage() {
  const asOf = "2026-10-18";
  const stale = staleContent(asOf);
  const facts = staleFacts(asOf);

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/content">Content ops</Link>
      </p>
      <h1 className="fj-heading-1">Staleness</h1>
      <p>As of {asOf}. Overdue next-review dates and expired competitor facts.</p>
      <h2 className="fj-heading-2">Articles</h2>
      <ul>
        {stale.articles.map((a) => (
          <li key={a.meta.slug}>
            {a.meta.slug} due {a.meta.nextReviewDue}
          </li>
        ))}
      </ul>
      <h2 className="fj-heading-2">Comparisons</h2>
      <ul>
        {stale.comparisons.map((c) => (
          <li key={c.meta.slug}>
            {c.meta.slug} due {c.meta.nextReviewDue}
          </li>
        ))}
      </ul>
      <h2 className="fj-heading-2">Competitor facts</h2>
      <ul>
        {facts.map((f) => (
          <li key={f.id}>
            {f.id} expired {f.expirationReviewDate}
          </li>
        ))}
      </ul>
    </main>
  );
}
