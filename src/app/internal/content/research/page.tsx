import Link from "next/link";

import { allResearch } from "@/lib/content/registry";

export default function InternalResearchPage() {
  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/content">Content ops</Link>
      </p>
      <h1 className="fj-heading-1">Research</h1>
      <ul>
        {allResearch.map((r) => (
          <li key={r.meta.slug}>
            {r.meta.title} · {r.meta.status} · cohort{" "}
            {r.meta.organizationCount ?? 0}/{r.meta.minimumCohort}
          </li>
        ))}
      </ul>
    </main>
  );
}
