import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";

import { BrandIcon } from "@/components/design-system/icons";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { SectionHeading } from "@/components/design-system/typography";
import { HeroCtaCluster } from "@/components/site/oss/hero-cta-cluster";
import { DataFastGoals } from "@/lib/analytics";
import { buildSignupUrl } from "@/lib/auth/paid-signup-flow";
import { homeFaq } from "@/lib/site/faq";
import { publicPlans, pricingConfig } from "@/lib/site/pricing";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

const MonitorPreview = dynamic(
  () =>
    import("@/components/site/monitor-preview").then((m) => m.MonitorPreview),
  {
    loading: () => (
      <div
        className="fj-deferred-slot fj-deferred-slot--monitor"
        aria-hidden="true"
      />
    ),
  },
);

const AlertFlow = dynamic(
  () => import("@/components/site/alert-flow").then((m) => m.AlertFlow),
  {
    loading: () => (
      <div
        className="fj-deferred-slot fj-deferred-slot--alert-flow"
        aria-hidden="true"
      />
    ),
  },
);

const OpenSourceHomeSection = dynamic(
  () =>
    import("@/components/site/oss/deployment-choice").then(
      (m) => m.OpenSourceHomeSection,
    ),
  {
    loading: () => (
      <div className="fj-deferred-slot fj-deferred-slot--oss" aria-hidden="true" />
    ),
  },
);

const DeploymentChoice = dynamic(
  () =>
    import("@/components/site/oss/deployment-choice").then(
      (m) => m.DeploymentChoice,
    ),
  {
    loading: () => (
      <div
        className="fj-deferred-slot fj-deferred-slot--deployment"
        aria-hidden="true"
      />
    ),
  },
);

const HeroNarrative = dynamic(
  () =>
    import("@/components/site/home/hero-narrative").then(
      (m) => m.HeroNarrative,
    ),
  {
    loading: () => (
      <div
        className="fj-deferred-slot fj-deferred-slot--hero-narrative"
        aria-hidden="true"
      />
    ),
  },
);

const CoverageExplorer = dynamic(
  () =>
    import("@/components/site/home/coverage-explorer").then(
      (m) => m.CoverageExplorer,
    ),
  { loading: () => <div className="fj-deferred-slot fj-deferred-slot--coverage" aria-hidden="true" /> },
);

const ProductJourney = dynamic(
  () =>
    import("@/components/site/home/product-journey").then(
      (m) => m.ProductJourney,
    ),
  { loading: () => <div className="fj-deferred-slot fj-deferred-slot--journey" aria-hidden="true" /> },
);

const StatusPagePreview = dynamic(
  () =>
    import("@/components/site/status-page-preview").then(
      (m) => m.StatusPagePreview,
    ),
  { loading: () => <div className="fj-deferred-slot fj-deferred-slot--status" aria-hidden="true" /> },
);

const FaqList = dynamic(
  () => import("@/components/site/faq-list").then((m) => m.FaqList),
  { loading: () => <div className="fj-deferred-slot fj-deferred-slot--faq" aria-hidden="true" /> },
);

export const revalidate = 3600;

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Open source uptime monitoring",
    description:
      "Open-source uptime monitoring that verifies failures before waking you up. Monitor websites, APIs, SSL, and cron jobs. Self-host or use Fajita Cloud.",
    path: "/",
  }),
  openGraph: {
    title: "Catch outages before your customers do.",
    description:
      "Fajita verifies failures before alerts, with self-hosted and managed Cloud options.",
    url: siteUrl,
    siteName: "Fajita",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catch outages before your customers do.",
    description:
      "Fajita verifies failures before alerts, with self-hosted and managed Cloud options.",
  },
};

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
    "Open-source uptime monitoring for websites, APIs, SSL certificates, and cron jobs, with verified alerts and public status pages. Self-host or use Fajita Cloud.",
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
            <p className="fj-eyebrow">Open source uptime monitoring</p>
            <h1 className="fj-display-1">
              Catch outages before your customers do.
            </h1>
            <p className="fj-body-lg fj-hero__lede">
              Fajita monitors websites, APIs, SSL, and cron jobs, then verifies
              failures before waking anyone up. Self-host the core or let Fajita
              Cloud run it for you.
            </p>
            <HeroCtaCluster goal={DataFastGoals.heroCta} />
            <p className="fj-hero__trust">
              Managed by Fajita Cloud, or run it yourself. Set up in minutes either way.
            </p>
            <ul className="fj-hero__proof">
              <li>Website, API, SSL, and cron monitoring</li>
              <li>Verified team alerts</li>
              <li>Hosted status pages</li>
              <li>Set up in minutes</li>
            </ul>
            <p className="fj-hero__status-link fj-body-sm">
              Fajita monitors its own production services, too.{" "}
              <Link href="/status">View live Fajita status</Link>
            </p>
          </div>
          <HeroNarrative />
        </div>
      </section>

      {/* 2 · Product proof */}
      <section className="fj-band--tight fj-cv-auto">
        <div className="fj-container">
          <div className="fj-split">
            <div className="fj-split__sticky fj-rail">
              <SectionHeading
                eyebrow="The product"
                title="One quiet screen that answers the loud question."
                lede="Every monitor shows its status, response time, certificate health, and history in one place. A preview of the monitoring experience available in Fajita today, shown with sample data so you can explore it without creating an account."
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
        className="fj-band fj-band--carbon fj-cv-auto"
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
      <section className="fj-band fj-cv-auto">
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
        className="fj-band fj-band--carbon fj-cv-auto"
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
      <section className="fj-band fj-cv-auto">
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

      {/* 7 · Open source model */}
      <OpenSourceHomeSection />

      {/* 8 · Lightweight positioning */}
      <section className="fj-band--tight fj-cv-auto">
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
      <section className="fj-band fj-cv-auto" id="how-it-works">
        <div className="fj-container">
          <SectionHeading
            eyebrow="How it works"
            title="Run the whole thing, right here."
            lede="Explore the complete monitoring flow, from first check to incident recovery. No account required, and no requests leave this page."
            as="h2"
          />
          <ProductJourney />
        </div>
      </section>

      {/* 10 · Pricing preview */}
      <section className="fj-band--tight fj-cv-auto">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Fajita Cloud"
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
                <BrandButtonLink
                  href={buildSignupUrl(plan.id, "month")}
                  size="sm"
                  variant={plan.highlight ? "primary" : "secondary"}
                  data-fast-goal={DataFastGoals.planSelected}
                  data-fast-goal-plan={plan.id}
                >
                  Start {plan.name}
                </BrandButtonLink>
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

      {/* 11 · Security */}
      <section
        className="fj-band fj-band--carbon fj-cv-auto"
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

      {/* 12 · FAQ */}
      <section className="fj-band fj-cv-auto">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Questions"
            title="Asked before you had to ask."
            as="h2"
          />
          <FaqList items={homeFaq} />
        </div>
      </section>

      <DeploymentChoice />

      {/* 13 · Final CTA */}
      <section className="fj-band fj-band--carbon fj-cv-auto" data-theme="dark">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Get started"
            title="Know when it is actually down."
            lede="Run Fajita yourself or let us manage it for you."
            as="h2"
          />
          <HeroCtaCluster goal={DataFastGoals.footerCta} />
        </div>
      </section>
    </>
  );
}
