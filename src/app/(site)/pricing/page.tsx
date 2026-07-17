import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/design-system/typography";
import { CtaButtons } from "@/components/site/cta-buttons";
import { FaqList } from "@/components/site/faq-list";
import { PlanCards } from "@/components/site/plan-cards";
import { DataFastGoals } from "@/lib/analytics";
import { billingFaq } from "@/lib/site/faq";
import { buildMetadata } from "@/lib/site/metadata";
import { comparisonRows, publicPlans, pricingConfig } from "@/lib/site/pricing";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description:
    "Three plans for small software teams: Starter, Pro, and Business. Clear monitor limits and monthly or annual billing.",
  path: "/pricing",
});

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
  if (value.kind === "at-launch")
    return <span style={{ color: "var(--color-text-muted)" }}>Publishes with pricing</span>;
  return <span>{value.value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
            Pricing
          </p>
          <h1 className="fj-display-2">
            Pay for monitors, not for a sales call.
          </h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Three plans that map to how much software you answer for.
            {pricingConfig.published
              ? " Pick a plan, create an account, and start watching."
              : ` ${pricingConfig.unpublishedNote}`}
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <PlanCards />

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
      </section>

      <section className="fj-band--tight">
        <div className="fj-container" style={{ maxWidth: "56rem" }}>
          <SectionHeading
            eyebrow="Commitments"
            title="The parts of billing we are deciding in your favor now."
            as="h2"
          />
          <div className="fj-facts">
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
              <p className="fj-fact__label">Refunds</p>
              <p className="fj-body">
                A written refund policy ships in the{" "}
                <Link
                  href="/legal"
                  style={{ color: "var(--color-brand-text)" }}
                >
                  legal hub
                </Link>{" "}
                before accounts open. The commitment: if Fajita is not working
                for you early on, you will not have to argue about it.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">No usage traps</p>
              <p className="fj-body">
                No overage charges that surprise you, no strikethrough
                theater, no countdown timers. If a limit matters, it is on
                this page in plain numbers.
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
