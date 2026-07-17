import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";
import { DOC_CATEGORY_META } from "@/lib/docs/categories";
import { getDoc } from "@/lib/docs/registry";

export const metadata: Metadata = buildMetadata({
  title: "Documentation",
  description:
    "Create monitors, understand incidents, route alerts, publish status pages, and verify webhook events with task-focused documentation.",
  path: "/docs",
});

const QUICK_STARTS = [
  { title: "Monitor a website", slug: "monitors/website-monitoring" },
  { title: "Monitor an API", slug: "monitors/api-monitoring" },
  { title: "Monitor an SSL certificate", slug: "monitors/ssl-monitoring" },
  { title: "Monitor a cron job", slug: "monitors/heartbeat-monitoring" },
  { title: "Connect Slack", slug: "alerts/slack" },
  { title: "Publish a status page", slug: "getting-started/publish-a-status-page" },
];

const CORE_CATEGORIES: (keyof typeof DOC_CATEGORY_META)[] = [
  "monitors",
  "incidents",
  "alerts",
  "status-pages",
  "subscribers",
  "webhooks",
  "billing",
  "security",
];

const TROUBLESHOOTING = [
  { q: "Why was my check blocked?", slug: "troubleshooting/check-blocked" },
  { q: "Why did my alert fail?", slug: "troubleshooting/alert-not-delivered" },
  { q: "Why is my status page stale?", slug: "troubleshooting/status-page-stale" },
  { q: "Why didn't a subscriber get email?", slug: "troubleshooting/subscriber-email" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Fajita documentation",
  url: `${siteUrl}/docs`,
  description:
    "Task-focused documentation for Fajita monitoring, incidents, alerts, status pages, and webhooks.",
};

export default function DocsHome() {
  return (
    <div className="fj-docs-landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="fj-docs-landing__hero">
        <p className="fj-eyebrow">Documentation</p>
        <h1 className="fj-heading-1">
          Everything you need to monitor, alert, and communicate with confidence.
        </h1>
        <p className="fj-body-lg fj-docs-landing__lede">
          Create monitors, understand incidents, route alerts, publish status pages, and verify
          webhook events with clear, task-focused documentation.
        </p>
        <div className="fj-docs-landing__actions">
          <Link
            href="/docs/getting-started/create-your-first-monitor"
            className="fj-button fj-button--primary"
          >
            Start with your first monitor
          </Link>
          <Link
            href="/docs/getting-started/what-fajita-monitors"
            className="fj-button fj-button--secondary"
          >
            What Fajita monitors
          </Link>
        </div>
      </header>

      <section className="fj-docs-landing__section" aria-labelledby="quick-starts">
        <h2 id="quick-starts" className="fj-heading-2">
          Quick starts
        </h2>
        <ul className="fj-docs-landing__grid">
          {QUICK_STARTS.map((q) => (
            <li key={q.slug}>
              <Link href={`/docs/${q.slug}`} className="fj-docs-landing__card">
                {q.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="fj-docs-landing__section" aria-labelledby="categories">
        <h2 id="categories" className="fj-heading-2">
          Browse by area
        </h2>
        <ul className="fj-docs-landing__grid">
          {CORE_CATEGORIES.map((id) => {
            const cat = DOC_CATEGORY_META[id];
            return (
              <li key={id}>
                <Link href={`/docs#${id}`} className="fj-docs-landing__card">
                  <span className="fj-docs-landing__card-title">{cat.label}</span>
                  <span className="fj-docs-landing__card-desc">{cat.description}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="fj-docs-landing__section" aria-labelledby="troubleshooting">
        <h2 id="troubleshooting" className="fj-heading-2">
          Popular troubleshooting
        </h2>
        <ul className="fj-docs-landing__list">
          {TROUBLESHOOTING.map((t) => {
            const page = getDoc(t.slug);
            if (!page) return null;
            return (
              <li key={t.slug}>
                <Link href={`/docs/${t.slug}`}>{t.q}</Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
