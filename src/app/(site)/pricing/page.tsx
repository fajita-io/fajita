import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { CtaButtons } from "@/components/site/cta-buttons";
import { FaqList } from "@/components/site/faq-list";
import { PlanCards } from "@/components/site/plan-cards";
import { PricingVolumeSection } from "@/components/site/pricing-volume-section";
import { DataFastGoals } from "@/lib/analytics";
import { billingFaq } from "@/lib/site/faq";
import { buildFaqJsonLd, buildPricingJsonLd } from "@/lib/site/json-ld";
import { buildMetadata } from "@/lib/site/metadata";
import { comparisonRows, pricingConfig, publicPlans } from "@/lib/site/pricing";
import { siteUrl } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description:
    "Core, Team, and Scale plans with included monthly checks. Volume-based pricing for solo founders and growing teams. Monthly or annual billing.",
  path: "/pricing",
});

const billingFaqJsonLd = buildFaqJsonLd(billingFaq);
const pricingJsonLd = buildPricingJsonLd(siteUrl, publicPlans);

function ComparisonCell({
  value,
}: {
  value: (typeof comparisonRows)[number]["values"][number];
}) {
  if (value.kind === "yes")
    return (
      <span>
        <span aria-hidden>✓</span>
        <span className="fj-visually-hidden">Included</span>
      </span>
    );
  if (value.kind === "no")
    return (
      <span style={{ color: "var(--color-text-muted)" }}>
        <span aria-hidden>—</span>
        <span className="fj-visually-hidden">Not included</span>
      </span>
    );
  if (value.kind === "included")
    return <span style={{ color: "var(--color-text-muted)" }}>Included</span>;
  return <span>{value.value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(billingFaqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">Fajita Cloud</p>
          <h1 className="fj-display-2">Pay for checks, not for a sales call.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Prefer not to maintain Fajita yourself? We run it for you. Every plan
            includes a monthly check allowance. Pick the volume that matches your
            monitors and interval.
            {pricingConfig.published
              ? " Start on Core and move up when your stack grows."
              : ` ${pricingConfig.unpublishedNote}`}
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-plan fj-plan--callout">
            <div>
              <p className="fj-eyebrow">Self-hosted</p>
              <h2 className="fj-heading-2 fj-plan__header">
                Looking to run Fajita yourself?
              </h2>
              <p className="fj-body-sm fj-plan__audience">
                The core project is open source under AGPL-3.0.
              </p>
            </div>
            <BrandButtonLink
              href="/self-host"
              variant="secondary"
              data-fast-goal={DataFastGoals.selfHostClicked}
            >
              Self-host instead
            </BrandButtonLink>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Volume"
            title="How much monitoring do you run?"
            lede="Slide to your expected check volume, or use the calculator. Each plan includes a fixed check allowance with no overage charges."
            as="h2"
          />
          <PricingVolumeSection />
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Plans"
            title="Core, Team, Scale"
            lede={
              pricingConfig.published
                ? pricingConfig.publishedNote
                : pricingConfig.unpublishedNote
            }
            as="h2"
          />
          <PlanCards />

          <div className="fj-compare-scroll-outer" style={{ marginTop: "var(--space-10)" }}>
            <div className="fj-compare-scroll">
              <table className="fj-compare">
                <caption className="fj-body-sm">
                  What each plan includes. Limits come from the billing catalog.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="fj-visually-hidden">Feature</span>
                    </th>
                    {publicPlans.map((p) => (
                          <th key={p.id} scope="col">
                            {p.name}
                          </th>
                        ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">
                        {row.label}
                        {row.note ? (
                          <span className="fj-compare__note">{row.note}</span>
                        ) : null}
                      </th>
                      {row.values.map((v, i) => (
                        <td key={i}>
                          <ComparisonCell value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading
            eyebrow="Commitments"
            title="The parts of billing we are deciding in your favor now."
            as="h2"
          />
          <div className="fj-facts">
            <div className="fj-fact">
              <p className="fj-fact__label">Checks included</p>
              <p className="fj-body">
                Each plan includes a fixed number of checks per billing period.
                {pricingConfig.published ? ` ${pricingConfig.limitNote}` : ""}
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Upgrades and downgrades</p>
              <p className="fj-body">
                Upgrades apply immediately. Downgrades apply at the end of the
                billing period, and if you are over the new limits you choose
                what to keep. Nothing is deleted without warning.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Cancellation</p>
              <p className="fj-body">
                Cancel any time from the billing portal, without emailing
                anyone. Access runs to the end of the paid period and your
                data stays exportable.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Annual billing</p>
              <p className="fj-body">{pricingConfig.annualNote}</p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Refunds</p>
              <p className="fj-body">
                A written refund policy lives in the{" "}
                <Link
                  href="/legal/refunds"
                  style={{ color: "var(--color-brand-text)" }}
                >
                  legal hub
                </Link>
                . The commitment: if Fajita is not working for you early on, you
                will not have to argue about it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading eyebrow="Billing questions" title="The fine print, early." as="h2" />
          <FaqList items={billingFaq} />
          <div style={{ marginTop: "var(--space-10)" }}>
            <CtaButtons
              goal={DataFastGoals.planSelected}
              secondaryHref="/features"
              secondaryLabel="Explore features"
            />
          </div>
        </div>
      </section>
    </>
  );
}
