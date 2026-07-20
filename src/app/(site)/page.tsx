import type { Metadata } from "next";
import Link from "next/link";

import { BrandIcon } from "@/components/design-system/icons";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { AlertFlow } from "@/components/site/alert-flow";
import { CtaButtons } from "@/components/site/cta-buttons";
import { FaqList } from "@/components/site/faq-list";
import { CoverageExplorer } from "@/components/site/home/coverage-explorer";
import { HeroNarrative } from "@/components/site/home/hero-narrative";
import { ProductJourney } from "@/components/site/home/product-journey";
import { MonitorPreview } from "@/components/site/monitor-preview";
import { StatusPagePreview } from "@/components/site/status-page-preview";
import { DataFastGoals } from "@/lib/analytics";
import { homeFaq } from "@/lib/site/faq";
import { publicPlans, pricingConfig } from "@/lib/site/pricing";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Uptime monitoring and status pages",
  description:
    "Fajita monitors your websites, APIs, certificates, and cron jobs. When something starts cooking, your team hears about it before your customers do.",
  path: "/",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaq.map((f) => ({
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
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "Uptime monitoring for websites, APIs, SSL certificates, and cron jobs, with verified alerts and public status pages.",
};

export default function HomePage() {
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

      {/* 1 · Hero: category clarity + the Thermal Stack story */}
      <section className="fj-hero">
        <div className="fj-container fj-hero__grid">
          <div className="fj-hero__copy">
            <h1 className="fj-display-1">
              Know when your software gets too hot.
            </h1>
            <p className="fj-body-lg fj-hero__lede">
              Fajita monitors your websites, APIs, certificates, and cron
              jobs. When something starts cooking, your team hears about it
              before your customers do.
            </p>
            <CtaButtons goal={DataFastGoals.heroCta} />
            <ul className="fj-hero__proof">
              <li>Website, API, SSL, and cron monitoring</li>
              <li>Verified team alerts</li>
              <li>Hosted status pages</li>
              <li>Set up in minutes</li>
            </ul>
          </div>
          <HeroNarrative />
        </div>
      </section>

      {/* 2 · Product proof */}
      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-split">
            <div className="fj-split__sticky fj-rail">
              <SectionHeading
                eyebrow="The product"
                title="One quiet screen that answers the loud question."
                lede="Every monitor shows its status, response time, certificate health, and history in one place. This is the interface Fajita is building, with demonstration data."
              />
              <p className="fj-body" style={{ marginTop: "var(--space-4)" }}>
                No dashboards to assemble. No query language. A monitor is a
                URL, a schedule, and the people to tell.
              </p>
            </div>
            <MonitorPreview />
          </div>
        </div>
      </section>

      {/* 3 · The problem */}
      <section
        className="fj-band fj-band--carbon"
        data-theme="dark"
      >
        <div className="fj-container">
          <SectionHeading
            eyebrow="The problem"
            title="Your customers should not be your monitoring system."
            lede="Outages happen. Finding out through a support ticket is optional."
            as="h2"
          />
          <div className="fj-timelines">
            <div className="fj-timeline">
              <div className="fj-timeline__title">
                <h3 className="fj-heading-3" style={{ margin: 0 }}>
                  Without monitoring
                </h3>
                <span className="fj-caption">discovered by customers</span>
              </div>
              <ol className="fj-timeline__list">
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">09:17</span>
                  <span>Checkout starts failing after a deploy. Nobody notices.</span>
                </li>
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">09:58</span>
                  <span>A customer tweets a screenshot at the company account.</span>
                </li>
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">10:24</span>
                  <span>Support forwards the third angry ticket to engineering.</span>
                </li>
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">10:31</span>
                  <span>
                    <strong>74 minutes in</strong>, someone finally looks at the logs.
                  </span>
                </li>
              </ol>
            </div>
            <div className="fj-timeline fj-timeline--good">
              <div className="fj-timeline__title">
                <h3 className="fj-heading-3" style={{ margin: 0 }}>
                  With Fajita
                </h3>
                <span className="fj-caption">discovered by the monitor</span>
              </div>
              <ol className="fj-timeline__list">
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">09:17</span>
                  <span>Checkout starts failing after a deploy.</span>
                </li>
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">09:18</span>
                  <span>Fajita verifies the failure and opens an incident.</span>
                </li>
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">09:18</span>
                  <span>
                    <strong>The team is alerted</strong> in Slack. The status page updates.
                  </span>
                </li>
                <li className="fj-timeline__item">
                  <span className="fj-timeline__time">09:24</span>
                  <span>Fix deploys. Customers who checked got an answer, not silence.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · Coverage */}
      <section className="fj-band">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Coverage"
            title="Five ways software breaks. One place watching all of them."
            lede="Pick a monitor type to see what a check actually looks like."
            as="h2"
          />
          <CoverageExplorer />
        </div>
      </section>

      {/* 5 · Detection and verification */}
      <section
        className="fj-band fj-band--carbon"
        data-theme="dark"
      >
        <div className="fj-container">
          <div className="fj-split--reverse fj-split">
            <div>
              <SectionHeading
                eyebrow="Verification"
                title="One bad request is noise. A confirmed outage is a signal."
                lede="Fajita will not panic after one failed request, and it will not wake you up for a hiccup."
                as="h2"
              />
              <ol className="fj-verify-steps">
                <li className="fj-verify-step">
                  <span className="fj-verify-step__body">
                    <strong>A check fails</strong>
                    The request times out or answers wrong. The clock starts, quietly.
                  </span>
                </li>
                <li className="fj-verify-step">
                  <span className="fj-verify-step__body">
                    <strong>Fajita re-checks</strong>
                    Immediately, before telling anyone. Most blips end here.
                  </span>
                </li>
                <li className="fj-verify-step">
                  <span className="fj-verify-step__body">
                    <strong>The failure is confirmed</strong>
                    A repeat failure means it is real. An incident opens with the evidence attached.
                  </span>
                </li>
                <li className="fj-verify-step">
                  <span className="fj-verify-step__body">
                    <strong>Alerts go out once</strong>
                    Your channels hear about it, and then they hear about the recovery. Nothing in between spams.
                  </span>
                </li>
              </ol>
            </div>
            <div className="fj-split__sticky">
              <AlertFlow />
            </div>
          </div>
        </div>
      </section>

      {/* 6 · Status pages */}
      <section className="fj-band">
        <div className="fj-container">
          <div className="fj-split">
            <div className="fj-split__sticky fj-rail">
              <SectionHeading
                eyebrow="Status pages"
                title="When something breaks, silence makes it worse."
                lede="Publish clear incident updates, scheduled maintenance, uptime history, and recovery notices from a status page that looks like it belongs to your company."
                as="h2"
              />
              <p className="fj-body" style={{ marginTop: "var(--space-4)" }}>
                Try the five states every status page has to be good at.
              </p>
              <p style={{ marginTop: "var(--space-5)" }}>
                <Link
                  href="/features/status-pages"
                  className="fj-body-sm"
                  style={{
                    color: "var(--color-brand-text)",
                    fontWeight: 600,
                    textDecoration: "underline",
                    textUnderlineOffset: "0.2em",
                  }}
                >
                  More on status pages
                </Link>
              </p>
            </div>
            <StatusPagePreview />
          </div>
        </div>
      </section>

      {/* 7 · Lightweight positioning */}
      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading
            eyebrow="Focus"
            title="Monitoring without the monitoring department."
            lede="Fajita is not an observability suite, on purpose. Add the services that matter, choose where alerts go, and publish a status page. Small teams get the protection they need without turning uptime into another full-time job."
            as="h2"
          />
          <ul className="fj-nots">
            <li>No infrastructure agent</li>
            <li>No log pipeline</li>
            <li>No enterprise setup project</li>
            <li>No giant configuration file</li>
            <li>No weeks of onboarding</li>
            <li>No dashboard maze</li>
          </ul>
        </div>
      </section>

      {/* 8 · Interactive product journey */}
      <section className="fj-band" id="how-it-works">
        <div className="fj-container">
          <SectionHeading
            eyebrow="How it works"
            title="Run the whole thing, right here."
            lede="Nine steps from first monitor to uptime history, including the part where it breaks. No account, nothing leaves the page."
            as="h2"
          />
          <ProductJourney />
        </div>
      </section>

      {/* 9 · Pricing preview */}
      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Pricing"
            title="Core, Team, Scale"
            lede={
              pricingConfig.published
                ? "Checks included every month. Pick the plan that matches your volume."
                : pricingConfig.unpublishedNote
            }
            as="h2"
          />
          <div className="fj-plans">
            {publicPlans.map((plan) => (
              <div
                key={plan.id}
                className={`fj-plan${plan.highlight ? " fj-plan--highlight" : ""}`}
              >
                <h3 className="fj-heading-3" style={{ margin: 0 }}>
                  {plan.name}
                </h3>
                <p className="fj-body-sm" style={{ margin: 0 }}>
                  {plan.audience}
                </p>
                <p className="fj-plan__monitors">
                  {plan.checksLabel}
                  <span>checks / mo</span>
                </p>
                <p className="fj-body-sm" style={{ margin: 0, color: "var(--color-text-muted)" }}>
                  Up to {plan.monitorLimit} monitors
                </p>
                {pricingConfig.published && plan.monthlyUsd !== null ? (
                  <p className="fj-heading-3" style={{ margin: 0 }}>
                    ${plan.monthlyUsd}
                    <span
                      className="fj-body-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {" "}
                      / month
                    </span>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "var(--space-8)" }}>
            <BrandButtonLink href="/pricing" variant="secondary">
              Compare the plans
            </BrandButtonLink>
          </div>
        </div>
      </section>

      {/* 10 · Security */}
      <section
        className="fj-band fj-band--carbon"
        data-theme="dark"
      >
        <div className="fj-container">
          <div className="fj-split">
            <div className="fj-rail">
              <SectionHeading
                eyebrow="Security"
                title="Built to watch your infrastructure without becoming a risk to it."
                lede="A monitoring tool holds a map of what matters to you. Fajita is built to hold it carefully."
                as="h2"
              />
              <p style={{ marginTop: "var(--space-6)" }}>
                <BrandButtonLink href="/security" variant="secondary">
                  Read the security overview
                </BrandButtonLink>
              </p>
            </div>
            <ul className="fj-trust-points">
              {[
                {
                  icon: "tenant-isolation" as const,
                  title: "Tenant separation",
                  body: "Customer data is separated per account at the database layer.",
                },
                {
                  icon: "secret-lock" as const,
                  title: "Encrypted secrets",
                  body: "Monitor credentials are encrypted at rest and never shown back in full.",
                },
                {
                  icon: "probe-boundary" as const,
                  title: "Restricted probes",
                  body: "Checks refuse private networks, so Fajita cannot scan what it should not reach.",
                },
                {
                  icon: "data-export" as const,
                  title: "Your data stays yours",
                  body: "Export everything. Delete your account and its data on request.",
                },
              ].map((item) => (
                <li key={item.title} className="fj-trust-point">
                  <span className="fj-trust-point__icon" aria-hidden="true">
                    <BrandIcon name={item.icon} size={22} />
                  </span>
                  <span className="fj-trust-point__copy">
                    <strong className="fj-trust-point__title">{item.title}</strong>
                    <span className="fj-body-sm">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 11 · FAQ */}
      <section className="fj-band">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Questions"
            title="Asked before you had to ask."
            as="h2"
          />
          <FaqList items={homeFaq} />
        </div>
      </section>
    </>
  );
}
