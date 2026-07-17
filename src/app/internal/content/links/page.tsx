import Link from "next/link";

import { orphanArticles, publicArticles } from "@/lib/content/registry";

export default function InternalLinksPage() {
  const orphans = orphanArticles();
  const graph = publicArticles().map((a) => ({
    slug: a.meta.slug,
    outbound: a.meta.relatedContent,
  }));

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/content">Content ops</Link>
      </p>
      <h1 className="fj-heading-1">Internal link graph</h1>
      <h2 className="fj-heading-2">Orphans</h2>
      <ul>
        {orphans.length ? (
          orphans.map((a) => <li key={a.meta.slug}>{a.meta.slug}</li>)
        ) : (
          <li>None</li>
        )}
      </ul>
      <h2 className="fj-heading-2">Outbound relatedContent</h2>
      <ul>
        {graph.map((g) => (
          <li key={g.slug}>
            {g.slug} → {g.outbound.join(", ") || "(none)"}
          </li>
        ))}
      </ul>
    </main>
  );
}
