import Link from "next/link";

import { allTerms } from "@/lib/glossary/registry";
import { isStale, qualityScore } from "@/lib/glossary/health";

export default function InternalGlossaryTermsPage() {
  const terms = [...allTerms()].sort((a, b) =>
    a.meta.term.localeCompare(b.meta.term),
  );

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/glossary">← Glossary ops</Link>
      </p>
      <h1>Glossary terms</h1>
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Status</th>
            <th>Category</th>
            <th>Owner</th>
            <th>Reviewed</th>
            <th>Next</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((t) => (
            <tr key={t.meta.slug}>
              <td>
                <Link href={`/glossary/${t.meta.slug}`}>{t.meta.term}</Link>
              </td>
              <td>
                {t.meta.status}
                {isStale(t) ? " · stale" : ""}
              </td>
              <td>{t.meta.category}</td>
              <td>{t.meta.owner}</td>
              <td>{t.meta.lastReviewedAt}</td>
              <td>{t.meta.nextReviewDue}</td>
              <td>{qualityScore(t).total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
