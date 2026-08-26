import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { DeploymentChoice } from "@/components/site/oss/deployment-choice";
import { GitHubButtonLink } from "@/components/site/oss/github-button-link";
import { DataFastGoals } from "@/lib/analytics";
import { buildMetadata } from "@/lib/site/metadata";
import {
  OSS_GITHUB_SLUG,
  OSS_ROUTES,
  ossNoindexWhenHidden,
} from "@/lib/site/oss-config";
import { cta, siteUrl } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Self-Host Fajita",
  description:
    "Run Fajita on your infrastructure with Docker. Same verification-first uptime monitoring as Fajita Cloud, operated by you.",
  path: OSS_ROUTES.selfHost,
  noindex: ossNoindexWhenHidden(),
});

const requirements = [
  "Docker and Docker Compose",
  "Node.js 22+ for helper scripts",
  "A Clerk application you control",
  "PostgreSQL (included in Compose stack)",
  "SMTP or Resend for email alerts (optional but recommended)",
];

const youManage = [
  "Infrastructure and networking",
  "Database backups and restore testing",
  "Application and worker upgrades",
  "TLS certificates and reverse proxy",
  "Secret rotation and access control",
  "Email delivery configuration",
];

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Fajita (self-hosted)",
  url: `${siteUrl}${OSS_ROUTES.selfHost}`,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Docker",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function SelfHostPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">Self-host</p>
          <h1 className="fj-display-2">Run Fajita on your infrastructure.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Deploy the same core monitoring system behind Fajita Cloud using
            Docker, your own database, workers, notifications, and domain.
          </p>
          <div className="fj-hero__ctas">
            <BrandButtonLink
              href={OSS_ROUTES.selfHostDocs}
              data-fast-goal={DataFastGoals.docsSelfHostClicked}
            >
              {cta.selfHostGuide.label}
            </BrandButtonLink>
            <GitHubButtonLink />
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading eyebrow="Requirements" title="What you need." as="h2" />
          <ul className="fj-deployment-choice__list" style={{ maxWidth: "36rem" }}>
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Architecture"
            title="Core path in one stack."
            lede="Web app, PostgREST, PostgreSQL, Go monitor worker, and scheduler sidecar. Alert worker recommended."
            as="h2"
          />
          <p className="fj-oss-architecture">
            {`Web (Next.js)\nPostgREST\nPostgreSQL\nGo monitor worker\nScheduler sidecar\nAlert worker (recommended)`}
          </p>
          <p style={{ marginTop: "var(--space-5)" }}>
            <Link href={OSS_ROUTES.architectureDocs}>Full architecture documentation</Link>
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading eyebrow="Quick start" title="Three commands to boot the stack." as="h2" />
          <pre className="fj-code">
            <code>{`git clone https://github.com/${OSS_GITHUB_SLUG}.git
cd fajita
cp .env.example .env
docker compose up -d`}</code>
          </pre>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-4)" }}>
            Set <code>FAJITA_DEPLOYMENT_MODE=self_hosted</code>, Clerk keys, and
            encryption secrets in <code>.env</code> before signing in. Run{" "}
            <code>npm run selfhost:doctor</code> to validate configuration.
          </p>
          <BrandButtonLink
            href={OSS_ROUTES.selfHostDocs}
            variant="secondary"
            className="fj-mt-6"
            data-fast-goal={DataFastGoals.docsSelfHostClicked}
          >
            Read the full quickstart
          </BrandButtonLink>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading eyebrow="Operations" title="What you manage." as="h2" />
          <div className="fj-facts">
            {youManage.map((item) => (
              <div key={item} className="fj-fact">
                <p className="fj-body">{item}</p>
              </div>
            ))}
          </div>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
            Upgrades follow repository releases and migration files. Test backups
            on a schedule you trust.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading eyebrow="Security" title="Defaults stay strict." as="h2" />
          <p className="fj-body" style={{ maxWidth: "44rem" }}>
            Self-hosted operators control their infrastructure and secrets.
            Private network monitoring requires an explicit opt-in. Follow{" "}
            <Link href="/docs/self-hosting/security">self-hosting security guidance</Link>{" "}
            and the repository{" "}
            <Link href="/open-source">SECURITY.md link</Link> for disclosure.
          </p>
        </div>
      </section>

      <DeploymentChoice />

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-cloud-escape">
            <h2 className="fj-heading-3">Want Fajita without operating Fajita?</h2>
            <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
              Fajita Cloud runs workers, upgrades, backups, and notifications for you.
            </p>
            <BrandButtonLink
              href={cta.primary.href}
              size="sm"
              className="fj-mt-4"
              data-fast-goal={DataFastGoals.cloudFromOssClicked}
            >
              {cta.primary.label}
            </BrandButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
