import Link from "next/link";

import { allTools } from "@/lib/content/registry";
import { DEFERRED_TOOLS } from "@/lib/content/tools";

export default function InternalToolsPage() {
  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <p>
        <Link href="/internal/content">Content ops</Link>
      </p>
      <h1 className="fj-heading-1">Tools</h1>
      <ul>
        {allTools.map((t) => (
          <li key={t.meta.slug}>
            <Link href={`/tools/${t.meta.slug}`}>{t.meta.title}</Link> · network={" "}
            {String(t.meta.networkAccess)} · security=
            {String(t.meta.securityReviewPassed)}
          </li>
        ))}
      </ul>
      <h2 className="fj-heading-2">Deferred</h2>
      <ul>
        {DEFERRED_TOOLS.map((t) => (
          <li key={t.slug}>
            {t.slug}: {t.reason}
          </li>
        ))}
      </ul>
    </main>
  );
}
