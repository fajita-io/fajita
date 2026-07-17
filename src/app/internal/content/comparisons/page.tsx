import Link from "next/link";

import { allComparisons } from "@/lib/content/registry";
import { COMPETITOR_FACTS } from "@/lib/content/comparisons";

export default function InternalComparisonsPage() {
  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/content">Content ops</Link>
      </p>
      <h1 className="fj-heading-1">Comparisons</h1>
      <ul>
        {allComparisons.map((c) => (
          <li key={c.meta.slug}>
            <Link href={`/compare/${c.meta.slug}`}>{c.meta.title}</Link> ·{" "}
            {c.meta.status} · reviewed {c.meta.lastReviewedAt} · pricing{" "}
            {c.meta.pricingStatus}
          </li>
        ))}
      </ul>
      <h2 className="fj-heading-2">Competitor facts</h2>
      <ul>
        {COMPETITOR_FACTS.map((f) => (
          <li key={f.id}>
            {f.competitor}: {f.fact} (verified {f.dateVerified}, expires{" "}
            {f.expirationReviewDate})
          </li>
        ))}
      </ul>
    </main>
  );
}
