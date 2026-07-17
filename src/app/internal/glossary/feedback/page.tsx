import Link from "next/link";

import { listRecentGlossaryFeedback } from "@/lib/glossary/feedback";

export default async function InternalGlossaryFeedbackPage() {
  let rows: Awaited<ReturnType<typeof listRecentGlossaryFeedback>> = [];
  let error: string | null = null;
  try {
    rows = await listRecentGlossaryFeedback(100);
  } catch (e) {
    error = e instanceof Error ? e.message : "unavailable";
  }

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/glossary">← Glossary ops</Link>
      </p>
      <h1>Glossary feedback</h1>
      {error ? <p>Could not load feedback: {error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Term</th>
            <th>Helpful</th>
            <th>Reason</th>
            <th>Comment</th>
            <th>Version</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.created_at}</td>
              <td>
                <Link href={`/glossary/${r.slug}`}>{r.slug}</Link>
              </td>
              <td>{r.helpful ? "yes" : "no"}</td>
              <td>{r.reason ?? ""}</td>
              <td>{r.comment ?? ""}</td>
              <td>{r.content_version}</td>
              <td>{r.resolution_state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
