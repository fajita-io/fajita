import type { Metadata } from "next";
import Link from "next/link";

import { BrandIcon } from "@/components/design-system/icons";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { DataFastGoals } from "@/lib/analytics";
import { INTEGRATION_CHANNEL_ICON } from "@/lib/alerts/channel-icons";
import { buildMetadata } from "@/lib/site/metadata";
import { cta } from "@/lib/site/site-config";
import { integrations } from "@/lib/site/integrations";

export const metadata: Metadata = buildMetadata({
  title: "Integrations",
  description:
    "Where Fajita alerts arrive: email, Slack, Discord, and signed webhooks. Verified incidents route to the channels your team already watches.",
  path: "/integrations",
});

export default function IntegrationsPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">Integrations</p>
          <h1 className="fj-display-2">
            Alerts belong where your team already looks.
          </h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Fajita does not ask anyone to watch another dashboard. Verified
            incidents route to these channels, and one clear recovery message
            follows each of them.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-integrations fj-integrations--flush">
            {integrations.map((integration) => (
              <article key={integration.id} className="fj-integration-card">
                <div className="fj-integration-card__head">
                  <span className="fj-integration-card__glyph">
                    <BrandIcon name={INTEGRATION_CHANNEL_ICON[integration.id]} size={22} />
                  </span>
                  <div>
                    <h2 className="fj-heading-3 fj-integration-card__title">
                      {integration.name}
                    </h2>
                    <span className="fj-caption">
                      {integration.status === "available"
                        ? "Available now"
                        : "Planned"}
                    </span>
                  </div>
                </div>
                <p className="fj-body-sm fj-integration-card__summary">
                  {integration.summary}
                </p>
                <p className="fj-body-sm fj-integration-card__payload">
                  {integration.payload}
                </p>
              </article>
            ))}
          </div>

          <p className="fj-body-sm fj-band-note">
            More channels are under consideration on the{" "}
            <Link href="/roadmap">roadmap</Link>
            . Until a channel is built and tested, it does not appear here.
            The webhook channel covers everything else today: if it accepts a
            POST request, Fajita can reach it.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Next"
            title="Send your first alert somewhere useful."
            as="h2"
          />
          <p className="fj-body" style={{ marginTop: "var(--space-4)", maxWidth: "36rem" }}>
            Create an account, add a monitor, and connect the channel your team
            already watches.
          </p>
          <div className="fj-hero__ctas" style={{ marginTop: "var(--space-6)" }}>
            <BrandButtonLink href={cta.primary.href} data-fast-goal={DataFastGoals.heroCta}>
              Start monitoring
            </BrandButtonLink>
            <BrandButtonLink href="/docs/getting-started/connect-an-alert-channel" variant="secondary">
              Read alert documentation
            </BrandButtonLink>
          </div>
          <p className="fj-body-sm fj-band-note" style={{ marginTop: "var(--space-6)" }}>
            <Link href="/#how-it-works">Explore the alert flow</Link> in the
            interactive product tour.
          </p>
        </div>
      </section>
    </>
  );
}
