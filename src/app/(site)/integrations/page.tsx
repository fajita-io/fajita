import type { Metadata } from "next";
import Link from "next/link";

import { BrandIcon, type BrandIconName } from "@/components/design-system/icons";
import { SectionHeading } from "@/components/design-system/typography";
import { CtaButtons } from "@/components/site/cta-buttons";
import { buildMetadata } from "@/lib/site/metadata";
import { integrations } from "@/lib/site/integrations";

export const metadata: Metadata = buildMetadata({
  title: "Integrations",
  description:
    "Where Fajita alerts arrive: email, Slack, Discord, and signed webhooks. Verified incidents route to the channels your team already watches.",
  path: "/integrations",
});

/**
 * Integration glyphs use Fajita's own monoline icon language rather than
 * third-party logos, so no trademark is used outside its guidelines.
 */
const glyphs: Record<string, BrandIconName> = {
  email: "subscriber",
  slack: "alert",
  discord: "alert",
  webhook: "webhook",
};

const detailSlug: Record<string, string> = {
  email: "email",
  slack: "slack",
  discord: "discord",
  webhook: "webhooks",
};

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
            incidents route to these channels at launch, and one clear
            recovery message follows each of them.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-integrations fj-integrations--flush">
            {integrations.map((integration) => {
              const slug = detailSlug[integration.id] ?? integration.id;
              return (
                <Link
                  key={integration.id}
                  href={`/integrations/${slug}`}
                  className="fj-integration-card"
                >
                  <div className="fj-integration-card__head">
                    <span className="fj-integration-card__glyph">
                      <BrandIcon name={glyphs[integration.id]} size={20} />
                    </span>
                    <div>
                      <h2 className="fj-heading-3 fj-integration-card__title">
                        {integration.name}
                      </h2>
                      <span className="fj-caption">
                        {integration.status === "at-launch"
                          ? "Available at launch"
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
                </Link>
              );
            })}
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
            title="Connect a channel in the demo."
            as="h2"
          />
          <CtaButtons
            secondaryHref="/#how-it-works"
            secondaryLabel="Run the demo"
          />
        </div>
      </section>
    </>
  );
}
