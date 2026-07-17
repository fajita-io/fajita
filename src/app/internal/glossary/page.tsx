import Link from "next/link";

import {
  allTerms,
  duplicateIntentWarnings,
  publicTerms,
} from "@/lib/glossary/registry";
import { isStale, qualityScore, reviewCadence } from "@/lib/glossary/health";
import { listRecentGlossaryFeedback } from "@/lib/glossary/feedback";

export default async function InternalGlossaryPage() {
  const terms = allTerms();
  const published = publicTerms();
  const stale = published.filter((t) => isStale(t));
  const warnings = duplicateIntentWarnings();
  let feedbackCount = 0;
  try {
    const feedback = await listRecentGlossaryFeedback(50);
    feedbackCount = feedback.length;
  } catch {
    feedbackCount = -1;
  }

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1>Glossary operations</h1>
      <p>Internal only. Platform admin or development.</p>
      <ul>
        <li>Total terms: {terms.length}</li>
        <li>Published: {published.length}</li>
        <li>Stale (review due): {stale.length}</li>
        <li>Duplicate-intent warnings: {warnings.length}</li>
        <li>
          Recent feedback rows:{" "}
          {feedbackCount < 0 ? "unavailable" : feedbackCount}
        </li>
      </ul>
      <nav>
        <ul>
          <li>
            <Link href="/internal/glossary/terms">Terms</Link>
          </li>
          <li>
            <Link href="/internal/glossary/feedback">Feedback</Link>
          </li>
          <li>
            <Link href="/internal/glossary/stale">Stale terms</Link>
          </li>
          <li>
            <Link href="/internal/glossary-lab">Glossary lab</Link>
          </li>
          <li>
            <Link href="/glossary">Public glossary</Link>
          </li>
        </ul>
      </nav>
      <h2>Sample quality scores (internal)</h2>
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Cadence</th>
            <th>Score</th>
            <th>Stale</th>
          </tr>
        </thead>
        <tbody>
          {published.slice(0, 20).map((t) => (
            <tr key={t.meta.slug}>
              <td>{t.meta.term}</td>
              <td>{reviewCadence(t)}</td>
              <td>{qualityScore(t).total}</td>
              <td>{isStale(t) ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
