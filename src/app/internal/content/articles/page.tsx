import Link from "next/link";

import { allArticles } from "@/lib/content/registry";

export default function InternalArticlesPage() {
  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/content">Content ops</Link>
      </p>
      <h1 className="fj-heading-1">Articles</h1>
      <table>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Reviewed</th>
            <th>Next review</th>
          </tr>
        </thead>
        <tbody>
          {allArticles.map((a) => (
            <tr key={a.meta.slug}>
              <td>
                <Link href={`/blog/${a.meta.slug}`}>{a.meta.slug}</Link>
              </td>
              <td>{a.meta.status}</td>
              <td>{a.meta.owner}</td>
              <td>{a.meta.lastReviewedAt}</td>
              <td>{a.meta.nextReviewDue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
