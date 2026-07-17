import Link from "next/link";

import { publicTerms } from "@/lib/glossary/registry";
import { isStale, reviewCadence } from "@/lib/glossary/health";

export default function InternalGlossaryStalePage() {
  const stale = publicTerms().filter((t) => isStale(t));

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/glossary">← Glossary ops</Link>
      </p>
      <h1>Stale glossary terms</h1>
      <p>{stale.length} published terms past next review due.</p>
      <ul>
        {stale.map((t) => (
          <li key={t.meta.slug}>
            <Link href={`/glossary/${t.meta.slug}`}>{t.meta.term}</Link> · due{" "}
            {t.meta.nextReviewDue} · cadence {reviewCadence(t)}
          </li>
        ))}
      </ul>
    </main>
  );
}
