import type { Metadata } from "next";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { DataFastGoals } from "@/lib/analytics";
import { buildMetadata } from "@/lib/site/metadata";
import { company, cta, siteUrl } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Why Fajita exists: software gets complicated, and knowing whether it works should not. Uptime monitoring built small, focused, and honest, from Kalispell, Montana.",
  path: "/about",
});

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Fajita",
  url: `${siteUrl}/about`,
  mainEntity: {
    "@type": "Organization",
    name: "Fajita",
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1001 S Main St, Ste 600",
      addressLocality: "Kalispell",
      addressRegion: "MT",
      postalCode: "59901",
      addressCountry: "US",
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            About
          </p>
          <h1 className="fj-display-2">
            Software gets complicated. Knowing whether it works should not.
          </h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Software fails quietly at first. A response takes a little longer. A
            certificate creeps toward its expiry date. A cron job stops and nobody
            hears it. By the time a customer notices, the story is already
            written.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-about-prose">
            <p className="fj-body">
              Fajita exists for the quiet part. It watches websites, APIs,
              certificates, and cron jobs around the clock, verifies trouble
              before it says a word, and tells your team the moment something
              starts cooking. When you need to talk to customers, your status
              page already looks like you have done this before.
            </p>
            <p className="fj-body">
              Fajita is built for the people who answer for their own
              software: solo founders, small teams, indie hackers, and
              agencies. People who do not have an ops department, and should
              not need one to know whether checkout is up.
            </p>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading eyebrow="Principles" title="How we decide things." as="h2" />
          <div className="fj-facts">
            <div className="fj-fact">
              <p className="fj-fact__label">Lightweight on purpose</p>
              <p className="fj-body">
                Fajita is not an observability platform and never will be.
                It answers one question extremely well. Focus is the feature.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Honest by default</p>
              <p className="fj-body">
                Interactive previews are clearly labeled and use sample data.
                Product capabilities are described according to what is available
                today. If those two ever drift apart, that is a bug.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Calm during incidents</p>
              <p className="fj-body">
                The product&apos;s personality lives in marketing. Alerts, status
                pages, and incident copy are plain and factual, because your
                3 a.m. does not need wordplay.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Built to be understood</p>
              <p className="fj-body">
                Fajita stays intentionally understandable. Clear systems,
                documented behavior, and fewer hidden layers make it easier to
                operate, improve, and trust.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Open by design</p>
              <p className="fj-body">
                The core monitoring platform is open source under AGPL-3.0.
                Making verification logic inspectable is a natural extension of
                monitoring you can explain, not just monitoring you can buy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading eyebrow="The name" title="Yes, about the name." as="h2" />
          <p className="fj-body" style={{ marginTop: "var(--space-4)", maxWidth: "44rem" }}>
            A fajita arrives at the table sizzling, and everyone in the room
            knows it instantly. That is the entire job of this product: when
            your software starts to sizzle, you should know before anyone
            else does. It is a monitoring company with one good joke, told
            once. The product itself speaks plainly.
          </p>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-6)", color: "var(--color-text-muted)" }}>
            {company.name} is based in Kalispell, Montana.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading eyebrow="Next" title="Put Fajita to work." as="h2" />
          <p className="fj-body" style={{ marginTop: "var(--space-4)", maxWidth: "36rem" }}>
            Add your first monitor, choose where alerts should go, and know when
            your software needs attention.
          </p>
          <div className="fj-hero__ctas" style={{ marginTop: "var(--space-6)" }}>
            <BrandButtonLink href={cta.primary.href} data-fast-goal={DataFastGoals.heroCta}>
              {cta.primary.label}
            </BrandButtonLink>
            <BrandButtonLink href="/self-host" variant="secondary">
              Self-host Fajita
            </BrandButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
