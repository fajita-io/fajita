import Link from "next/link";
import type { Metadata } from "next";

import { publicTools } from "@/lib/content/registry";
import { DEFERRED_TOOLS } from "@/lib/content/tools";
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
    <div>
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
              <p>{t.meta.description}</p>
              <p className="fj-content-card__meta">
                Network access: {t.meta.networkAccess ? "yes" : "no"} · Stores
                input: {t.meta.storesInput ? "yes" : "no"} ·{" "}
                {t.meta.clientSideOnly ? "Runs in your browser" : "Server-assisted"}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="deferred-heading">
        <h2 id="deferred-heading" className="fj-heading-2">
          Intentionally deferred
        </h2>
        <ul>
          {DEFERRED_TOOLS.map((t) => (
            <li key={t.slug}>
              <strong>{t.slug}</strong>: {t.reason}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
