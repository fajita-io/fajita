import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Content lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContentLabPage() {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();

  const fixtures = [
    { href: "/blog", label: "Blog index" },
    { href: "/blog/category/monitoring", label: "Category: monitoring" },
    { href: "/blog/author/fajita-editorial", label: "Author: Fajita Editorial" },
    {
      href: "/blog/minimum-reliability-stack-solo-saas",
      label: "Long guide",
    },
    {
      href: "/blog/why-one-failed-check-is-not-downtime",
      label: "Short troubleshooting",
    },
    { href: "/compare", label: "Compare index" },
    { href: "/compare/fajita-vs-uptimerobot", label: "Fair comparison" },
    { href: "/compare/comparison-methodology", label: "Methodology" },
    { href: "/tools/uptime-calculator", label: "Uptime calculator" },
    {
      href: "/tools/webhook-signature-generator",
      label: "Webhook signature tool",
    },
    { href: "/tools/cron-expression-explainer", label: "Cron explainer" },
    { href: "/tools/status-page-checklist", label: "Status checklist" },
    { href: "/research", label: "Research index" },
    { href: "/research/methodology-template", label: "Methodology template" },
    { href: "/blog/rss.xml", label: "RSS" },
    { href: "/content/manifest.json", label: "Manifest" },
    { href: "/blog/raw/minimum-reliability-stack-solo-saas", label: "Plain text" },
  ];

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1 className="fj-heading-1">Content lab</h1>
      <p>
        Fixture routes for Phase 15 QA. Development or platform-admin only.
        Noindex. No production customer data.
      </p>
      <ul>
        {fixtures.map((f) => (
          <li key={f.href}>
            <Link href={f.href}>{f.label}</Link>
          </li>
        ))}
      </ul>
      <p className="fj-body-sm">
        HTTP status checker intentionally deferred (SSRF capacity separation).
        Network-tool blocked destinations are covered by monitor destination
        tests, not a public scanner.
      </p>
    </main>
  );
}
