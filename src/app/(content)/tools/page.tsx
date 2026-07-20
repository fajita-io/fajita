import Link from "next/link";
import type { Metadata } from "next";

import { publicTools } from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Free reliability tools",
  description:
    "Calculate downtime, explain cron schedules, verify webhook signatures, and prepare a status page without creating an account.",
  path: "/tools",
});

export default function ToolsIndexPage() {
  const tools = publicTools();

  return (
    <div className="fj-content-index">
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">Tools</p>
        <h1 className="fj-heading-1">Free tools for software reliability work.</h1>
        <p className="fj-body-lg">
          Calculate downtime, understand cron schedules, verify webhook
          signatures, and prepare a status page without creating an account.
        </p>
      </header>

      <ul className="fj-content-grid">
        {tools.map((t) => (
          <li key={t.meta.slug}>
            <Link href={`/tools/${t.meta.slug}`} className="fj-content-card">
              <h2 className="fj-heading-3">{t.meta.title}</h2>
              <p className="fj-content-card__desc">{t.meta.description}</p>
              {t.meta.clientSideOnly ? (
                <p className="fj-content-card__meta">Runs in your browser</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
