import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { FaqList } from "@/components/site/faq-list";
import { GitHubButtonLink } from "@/components/site/oss/github-button-link";
import {
  DeploymentChoice,
} from "@/components/site/oss/deployment-choice";
import { DataFastGoals } from "@/lib/analytics";
import { ossFaq } from "@/lib/site/faq";
import { buildMetadata } from "@/lib/site/metadata";
import {
  OSS_GITHUB_CONTRIBUTING_URL,
  OSS_GITHUB_LICENSE_URL,
  OSS_GITHUB_SECURITY_URL,
  OSS_GITHUB_SLUG,
  OSS_GITHUB_URL,
  OSS_INITIAL_VERSION,
  OSS_LICENSE,
  OSS_ROUTES,
  OSS_TRADEMARKS_URL,
  ossNoindexWhenHidden,
} from "@/lib/site/oss-config";
import { cta, siteUrl } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Open Source Uptime Monitoring",
  description:
    "Self-host Fajita to monitor websites, APIs, SSL certificates, and cron jobs with failure verification before alerts. Open source under AGPL-3.0.",
  path: OSS_ROUTES.openSource,
  noindex: ossNoindexWhenHidden(),
});

const capabilities = [
  "Website monitoring",
  "API monitoring",
  "SSL certificate monitoring",
  "Cron and heartbeat monitoring",
  "Failure verification",
  "Incidents and maintenance",
  "Public status pages",
  "Assertions",
  "Slack, Discord, and webhooks",
  "Email via SMTP or Resend",
  "Monitoring history",
  "Team workspaces",
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ossFaq.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Fajita",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web, Docker",
  url: siteUrl,
  downloadUrl: OSS_GITHUB_URL,
  softwareVersion: OSS_INITIAL_VERSION,
  license: OSS_LICENSE,
  description:
    "Open-source uptime monitoring with failure verification before alerts.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Self-hosted open-source edition",
  },
};

export default function OpenSourcePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />

      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Open source uptime monitoring
          </p>
          <h1 className="fj-display-2">
            Uptime monitoring you can actually inspect.
          </h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Fajita is open-source monitoring for websites, APIs, SSL certificates,
            and cron jobs, built around a simple idea: confirm trouble before
            alerting people.
          </p>
          <div className="fj-hero__ctas">
            <GitHubButtonLink variant="primary" />
            <BrandButtonLink
              href={OSS_ROUTES.selfHost}
              variant="secondary"
              data-fast-goal={DataFastGoals.selfHostClicked}
            >
              {cta.selfHost.label}
            </BrandButtonLink>
          </div>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-4)" }}>
            Prefer managed infrastructure?{" "}
            <Link
              href={cta.primary.href}
              data-fast-goal={DataFastGoals.cloudFromOssClicked}
            >
              {cta.primary.label}
            </Link>
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading
            eyebrow="Why open source"
            title="Monitoring software should explain its conclusions."
            lede="Fajita is responsible for telling you when something is wrong. You should be able to see how it reaches that conclusion."
            as="h2"
          />
          <div className="fj-facts">
            <div className="fj-fact">
              <p className="fj-fact__label">Inspectability</p>
              <p className="fj-body">
                Read the verification logic, incident engine, and notification
                paths instead of trusting a black box.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Control</p>
              <p className="fj-body">
                Run Fajita on your infrastructure with your database, your mail
                relay, and your access policies.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Trust</p>
              <p className="fj-body">
                Open source creates distribution and scrutiny. Fajita Cloud stays
                valuable because operating monitoring well is real work.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Contribution</p>
              <p className="fj-body">
                Fix a bug, improve docs, or extend an integration under AGPL-3.0.
                The same codebase powers self-hosted installs and Cloud.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Self-hosted capabilities"
            title="What you can run yourself."
            lede="The self-hosted edition is not a demo tier. These capabilities ship in the open-source tree today."
            as="h2"
          />
          <ul className="fj-oss-capabilities">
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fj-band fj-band--carbon" data-theme="dark">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Verification"
            title="Confirm trouble before it becomes somebody's problem."
            lede="Transient network failures happen. Fajita verifies failure before escalating so one bad check does not automatically wake anyone up."
            as="h2"
          />
          <div className="fj-verification-compare">
            <div className="fj-verification-compare__col">
              <h3 className="fj-heading-3">Typical uptime monitoring</h3>
              <p className="fj-verification-compare__flow">
                {`Failed ping\n↓\nAlert`}
              </p>
            </div>
            <div className="fj-verification-compare__col">
              <h3 className="fj-heading-3">Fajita</h3>
              <p className="fj-verification-compare__flow">
                {`Failed check\n↓\nVerify\n↓\nConfirm\n↓\nIncident\n↓\nAlert`}
              </p>
            </div>
          </div>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
            Verification reduces noise from transient failures. It does not
            eliminate false positives entirely.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Architecture"
            title="One product. Two deployment models."
            lede="The self-hosted stack mirrors the core Cloud path without exposing internal operational detail."
            as="h2"
          />
          <p className="fj-oss-architecture" aria-label="Fajita architecture flow">
            {`Scheduler\n↓\nWorkers\n↓\nVerification\n↓\nIncident engine\n↓\nNotifications\n↓\nStatus page\n\nPostgreSQL`}
          </p>
          <p style={{ marginTop: "var(--space-5)" }}>
            <Link href={OSS_ROUTES.architectureDocs}>Read the architecture docs</Link>
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Quick start"
            title="Run it locally in minutes."
            lede="Docker Compose is the supported install path. You bring Clerk and secrets."
            as="h2"
          />
          <pre className="fj-code">
            <code>{`git clone https://github.com/${OSS_GITHUB_SLUG}.git
cd fajita-io
cp .env.example .env
docker compose up -d`}</code>
          </pre>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-4)" }}>
            Open <code>http://localhost:3000</code>, sign in, create a monitor.
          </p>
          <div className="fj-hero__ctas" style={{ marginTop: "var(--space-6)" }}>
            <BrandButtonLink
              href={OSS_ROUTES.selfHostDocs}
              data-fast-goal={DataFastGoals.docsSelfHostClicked}
            >
              Full self-hosting guide
            </BrandButtonLink>
            <GitHubButtonLink />
          </div>
        </div>
      </section>

      <DeploymentChoice cloudGoal={DataFastGoals.cloudFromOssClicked} />

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading eyebrow="Project links" title="Source, license, and contribution." as="h2" />
          <div className="fj-facts fj-facts--flush">
            <div className="fj-fact">
              <p className="fj-fact__label">GitHub</p>
              <p className="fj-body fj-prose">
                <Link href={OSS_GITHUB_URL}>{OSS_GITHUB_SLUG}</Link>
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">License</p>
              <p className="fj-body fj-prose">
                <Link href={OSS_GITHUB_LICENSE_URL}>{OSS_LICENSE}</Link>
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Contributing</p>
              <p className="fj-body fj-prose">
                <Link href={OSS_GITHUB_CONTRIBUTING_URL}>CONTRIBUTING.md</Link>
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Security</p>
              <p className="fj-body fj-prose">
                <Link href={OSS_GITHUB_SECURITY_URL}>SECURITY.md</Link>
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Trademarks</p>
              <p className="fj-body fj-prose">
                <Link href={OSS_TRADEMARKS_URL}>TRADEMARKS.md</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading eyebrow="Questions" title="Open source FAQ." as="h2" />
          <FaqList items={ossFaq} />
        </div>
      </section>

      <section className="fj-band fj-band--carbon" data-theme="dark">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Next step"
            title="Know when it is actually down."
            lede="Run Fajita yourself or let us manage it for you."
            as="h2"
          />
          <div className="fj-hero__ctas">
            <BrandButtonLink
              href={cta.primary.href}
              data-fast-goal={DataFastGoals.cloudFromOssClicked}
            >
              {cta.primary.label}
            </BrandButtonLink>
            <GitHubButtonLink />
          </div>
        </div>
      </section>
    </>
  );
}
