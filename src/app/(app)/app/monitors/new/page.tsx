import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon, type BrandIconName } from "@/components/design-system/icons";
import { PageHeader } from "@/components/app/ui";
import { requireMonitorPage } from "@/lib/app/monitor-page";

export const metadata: Metadata = {
  title: "New monitor",
  robots: { index: false, follow: false },
};

interface TypeCard {
  segment: string;
  icon: BrandIconName;
  title: string;
  desc: string;
  facts: Array<{ label: string; value: string }>;
  recommended?: boolean;
}

const TYPES: TypeCard[] = [
  {
    segment: "website",
    icon: "monitor-http",
    title: "Website",
    desc: "Watch a public site or web app and know the moment it stops answering.",
    recommended: true,
    facts: [
      { label: "Best for", value: "Marketing sites, apps, landing pages" },
      { label: "Checks", value: "Reachability, status, response time" },
      { label: "Setup", value: "About a minute" },
      { label: "Credentials", value: "Optional" },
      { label: "Not for", value: "Private or internal-only networks" },
    ],
  },
  {
    segment: "api",
    icon: "monitor-api",
    title: "API",
    desc: "Check an endpoint's status, speed, keywords, and JSON values.",
    facts: [
      { label: "Best for", value: "Health endpoints and JSON APIs" },
      { label: "Checks", value: "Status, timing, headers, JSON assertions" },
      { label: "Setup", value: "A few minutes" },
      { label: "Credentials", value: "Bearer, basic, or a secret header" },
      { label: "Not for", value: "Actions that create or send data" },
    ],
  },
  {
    segment: "ssl",
    icon: "monitor-ssl",
    title: "SSL certificate",
    desc: "Track certificate validity and get warned well before it expires.",
    facts: [
      { label: "Best for", value: "HTTPS certificates you must renew" },
      { label: "Checks", value: "Expiry, issuer, hostname, chain" },
      { label: "Setup", value: "Under a minute" },
      { label: "Credentials", value: "None" },
      { label: "Not for", value: "Renewing the certificate for you" },
    ],
  },
  {
    segment: "heartbeat",
    icon: "monitor-cron",
    title: "Cron job or heartbeat",
    desc: "Receive a ping from a scheduled job and hear about it when one goes missing.",
    facts: [
      { label: "Best for", value: "Backups, batch jobs, scheduled tasks" },
      { label: "Checks", value: "Whether a ping arrived on time" },
      { label: "Setup", value: "A minute, plus one line in your job" },
      { label: "Credentials", value: "A private ping URL" },
      { label: "Not for", value: "Watching a public URL (use Website)" },
    ],
  },
];

export default async function NewMonitorPage() {
  const ctx = await requireMonitorPage();
  if (!ctx.canManage) notFound();

  return (
    <div>
      <PageHeader
        title="What should Fajita watch?"
        description="Pick a type to start. You can test the setup safely before anything goes live."
      />
      <div className="fj-typegrid">
        {TYPES.map((t) => (
          <Link
            key={t.segment}
            href={`/app/monitors/new/${t.segment}`}
            className="fj-typecard"
            data-recommended={t.recommended ? "" : undefined}
          >
            <span className="fj-typecard__mark" aria-hidden="true">
              <BrandIcon name={t.icon} size={22} />
            </span>
            <h2 className="fj-typecard__title">
              {t.title}
              {t.recommended ? <span className="fj-recommend-flag">Start here</span> : null}
            </h2>
            <p className="fj-typecard__desc">{t.desc}</p>
            <ul className="fj-typecard__facts">
              {t.facts.map((f) => (
                <li key={f.label}>
                  <b>{f.label}</b>
                  <span>{f.value}</span>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
