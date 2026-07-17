import Link from "next/link";

import { listRecentFeedback } from "@/lib/docs/feedback";

export default async function InternalDocsFeedback() {
  let rows: Awaited<ReturnType<typeof listRecentFeedback>> = [];
  try {
    rows = await listRecentFeedback(100);
  } catch {
    rows = [];
  }

  return (
    <div className="fj-container" style={{ paddingBlock: "var(--space-8)" }}>
      <h1 className="fj-heading-1">Documentation feedback</h1>
      <p className="fj-body">
        Anonymous, sanitized page feedback. No customer identity is stored. Resolve items by fixing
        the source page and updating its review date.
      </p>

      {rows.length === 0 ? (
        <p className="fj-body">No feedback yet, or the feedback store is not reachable.</p>
      ) : (
        <table className="fj-docs-table">
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col">Helpful</th>
              <th scope="col">Reason</th>
              <th scope="col">Detail</th>
              <th scope="col">State</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/docs/${r.slug}`}>{r.slug}</Link>
                </td>
                <td>{r.helpful ? "Yes" : "No"}</td>
                <td>{r.reason ?? "\u2014"}</td>
                <td>{r.comment ?? "\u2014"}</td>
                <td>{r.resolution_state}</td>
                <td>{new Date(r.created_at).toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
