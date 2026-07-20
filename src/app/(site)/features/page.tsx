import type { Metadata } from "next";
import Link from "next/link";

import { BrandIcon } from "@/components/design-system/icons";
import { SectionHeading } from "@/components/design-system/typography";
import { CtaButtons } from "@/components/site/cta-buttons";
import { buildMetadata } from "@/lib/site/metadata";
import { workflowStages } from "@/lib/site/features";

export const metadata: Metadata = buildMetadata({
  title: "Features",
  description:
    "Everything Fajita does, in the order it happens: watch your services, verify failures, alert the team, communicate with customers, and learn from the record.",
  path: "/features",
});

/**
 * Features hub organized as the product's actual workflow, not a card
 * grid: Watch → Verify → Alert → Communicate → Learn, connected by the
 * watch-rail motif.
 */
export default function FeaturesPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Features
          </p>
          <h1 className="fj-display-2">
            Five verbs. That is the whole product.
          </h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Fajita follows an incident the way your team does: watch the
            services, verify the failure, alert the right people, communicate
            with customers, and keep the record.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: "var(--space-16)",
            }}
          >
            {workflowStages.map((stage, i) => (
              <li key={stage.id} className="fj-rail">
                <p className="fj-eyebrow" style={{ marginBottom: "var(--space-2)" }}>
                  {String(i + 1).padStart(2, "0")} · {stage.title}
                </p>
                <h2 className="fj-heading-1" style={{ maxWidth: "22ch" }}>
                  {stage.body}
                </h2>
                <ul
                  style={{
                    listStyle: "none",
                    margin: "var(--space-6) 0 0",
                    padding: 0,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
                    gap: "var(--space-2) var(--space-6)",
                  }}
                >
                  {stage.items.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="fj-related__link"
                          style={{ width: "100%", justifyContent: "space-between" }}
                        >
                          {item.label}
                          <BrandIcon name="alert" size={14} />
                        </Link>
                      ) : (
                        <span
                          className="fj-body-sm"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: "40px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Next"
            title="See it work end to end."
            lede="The homepage demo runs the whole journey, including the part where it breaks."
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
