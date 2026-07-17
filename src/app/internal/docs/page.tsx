import Link from "next/link";

import { DOC_CATEGORY_META } from "@/lib/docs/categories";
import { healthSummary } from "@/lib/docs/health";

export default function InternalDocsOverview() {
  const health = healthSummary();

  return (
    <div className="fj-container" style={{ paddingBlock: "var(--space-8)" }}>
      <h1 className="fj-heading-1">Documentation operations</h1>
      <p className="fj-body">
        Editorial content is source-controlled. This view surfaces health signals so stale or
        unowned pages are caught before a customer hits them.
      </p>

      <div className="fj-docs-ops-grid">
        <div className="fj-card">
          <p className="fj-metric__value fj-numeric">{health.total}</p>
          <p className="fj-metric__label">Pages</p>
        </div>
        <div className="fj-card">
          <p className="fj-metric__value fj-numeric">{health.published}</p>
          <p className="fj-metric__label">Published</p>
        </div>
        <div className="fj-card">
          <p className="fj-metric__value fj-numeric">{health.draft}</p>
          <p className="fj-metric__label">Draft</p>
        </div>
        <div className="fj-card">
          <p className="fj-metric__value fj-numeric">{health.stale.length}</p>
          <p className="fj-metric__label">Stale</p>
        </div>
      </div>

      <nav style={{ marginBlock: "var(--space-6)" }}>
        <Link href="/internal/docs/feedback">View feedback queue</Link>
      </nav>

      <h2 className="fj-heading-2">Stale pages</h2>
      {health.stale.length === 0 ? (
        <p className="fj-body">No pages exceed their review cadence.</p>
      ) : (
        <table className="fj-docs-table">
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col">Area</th>
              <th scope="col">Risk</th>
              <th scope="col">Last reviewed</th>
              <th scope="col">Age (days)</th>
            </tr>
          </thead>
          <tbody>
            {health.stale.map((s) => (
              <tr key={s.slug}>
                <td>
                  <Link href={`/docs/${s.slug}`}>{s.title}</Link>
                </td>
                <td>{DOC_CATEGORY_META[s.category].label}</td>
                <td>{s.risk}</td>
                <td>{s.lastReviewedAt}</td>
                <td>{s.ageDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
