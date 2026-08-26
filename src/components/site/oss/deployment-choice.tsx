import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { DataFastGoals } from "@/lib/analytics";
import { OSS_ROUTES } from "@/lib/site/oss-config";
import { cta } from "@/lib/site/site-config";

import { GitHubButtonLink } from "./github-button-link";

const selfHostedItems = [
  "Open source (AGPL-3.0)",
  "Runs on your infrastructure",
  "Core monitoring and verification",
  "Status pages and integrations",
  "You manage upgrades, workers, and backups",
];

const cloudItems = [
  "Managed infrastructure",
  "Managed workers and scheduling",
  "Managed upgrades and backups",
  "Managed notifications",
  "No server maintenance",
];

/**
 * Two-column self-hosted vs Fajita Cloud comparison used on homepage,
 * /open-source, /self-host, and pricing.
 */
export function DeploymentChoice({
  eyebrow = "How to run Fajita",
  title = "Same monitoring philosophy. Different operational burden.",
  lede = "Run Fajita yourself for full control, or let Fajita Cloud handle the infrastructure.",
  cloudGoal = DataFastGoals.cloudFromOssClicked,
}: {
  eyebrow?: string;
  title?: string;
  lede?: string;
  cloudGoal?: string;
}) {
  return (
    <section className="fj-band--tight">
      <div className="fj-container fj-container--wide">
        <SectionHeading eyebrow={eyebrow} title={title} lede={lede} as="h2" />
        <div className="fj-deployment-choice">
          <article className="fj-deployment-choice__col">
            <h3 className="fj-heading-3">Self-hosted</h3>
            <p className="fj-body-sm" style={{ color: "var(--color-text-muted)" }}>
              For teams who want inspectable code and their own infrastructure.
            </p>
            <ul className="fj-deployment-choice__list">
              {selfHostedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="fj-deployment-choice__actions">
              <BrandButtonLink
                href={OSS_ROUTES.selfHostDocs}
                variant="secondary"
                size="sm"
                data-fast-goal={DataFastGoals.docsSelfHostClicked}
              >
                {cta.selfHostGuide.label}
              </BrandButtonLink>
              <BrandButtonLink
                href={OSS_ROUTES.selfHost}
                variant="ghost"
                size="sm"
                data-fast-goal={DataFastGoals.selfHostClicked}
              >
                {cta.selfHost.label}
              </BrandButtonLink>
            </div>
          </article>

          <article className="fj-deployment-choice__col fj-deployment-choice__col--cloud">
            <h3 className="fj-heading-3">Fajita Cloud</h3>
            <p className="fj-body-sm" style={{ color: "var(--color-text-muted)" }}>
              For teams who want monitoring without operating workers or databases.
            </p>
            <ul className="fj-deployment-choice__list">
              {cloudItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="fj-deployment-choice__actions">
              <BrandButtonLink
                href={cta.primary.href}
                size="sm"
                data-fast-goal={cloudGoal}
              >
                {cta.primary.label}
              </BrandButtonLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/** Compact open-by-default section for the homepage. */
export function OpenSourceHomeSection() {
  return (
    <section className="fj-band fj-band--carbon" data-theme="dark">
      <div className="fj-container">
        <div className="fj-split">
          <div className="fj-rail">
            <SectionHeading
              eyebrow="Open source"
              title="Open by default."
              lede="Fajita's monitoring engine is open source. Run it on your own infrastructure, inspect how verification works, or contribute directly."
              as="h2"
            />
            <p className="fj-body-sm fj-built-in-public">
              Source available. Architecture documented. Issues public.
            </p>
          </div>
          <div className="fj-open-source-cards">
            <article className="fj-open-source-card">
              <h3 className="fj-heading-3">Self-host</h3>
              <p className="fj-body-sm">
                Deploy Fajita yourself and control the infrastructure, database,
                workers, and notifications.
              </p>
              <BrandButtonLink
                href={OSS_ROUTES.selfHost}
                variant="secondary"
                size="sm"
                data-fast-goal={DataFastGoals.selfHostClicked}
              >
                {cta.selfHost.label}
              </BrandButtonLink>
            </article>
            <article className="fj-open-source-card">
              <h3 className="fj-heading-3">Fajita Cloud</h3>
              <p className="fj-body-sm">
                We manage the database, workers, upgrades, notifications,
                backups, and infrastructure for you.
              </p>
              <BrandButtonLink
                href={cta.primary.href}
                size="sm"
                data-fast-goal={DataFastGoals.cloudFromOssClicked}
              >
                {cta.primary.label}
              </BrandButtonLink>
            </article>
            <div className="fj-open-source-card__github">
              <GitHubButtonLink size="sm" />
              <BrandButtonLink
                href={OSS_ROUTES.openSource}
                variant="ghost"
                size="sm"
                data-fast-goal={DataFastGoals.openSourceViewed}
              >
                Learn about open source
              </BrandButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
