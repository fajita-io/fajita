import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/design-system/status/status-badge";
import { SectionHeading } from "@/components/design-system/typography";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Security",
  description:
    "How Fajita watches your infrastructure without becoming a risk to it: tenant separation, encrypted secrets, restricted probes, and honest status labels for every control.",
  path: "/security",
});

type ControlStatus = "implemented" | "in-progress" | "planned";

interface Control {
  status: ControlStatus;
  title: string;
  body: string;
}

const statusPresentation: Record<
  ControlStatus,
  { label: string; badge: "operational" | "verifying" | "maintenance" }
> = {
  implemented: { label: "Implemented", badge: "operational" },
  "in-progress": { label: "In progress", badge: "verifying" },
  planned: { label: "Planned", badge: "maintenance" },
};

const controls: Control[] = [
  {
    status: "implemented",
    title: "Minimal data collection on this website",
    body: "The public site collects what you give it: signup details through our identity provider, and the contents of the contact form. Analytics are privacy-conscious and do not build advertising profiles.",
  },
  {
    status: "implemented",
    title: "Encrypted transport and secure headers",
    body: "All traffic is HTTPS. The site ships strict security headers, and no secrets or internal configuration reach the browser.",
  },
  {
    status: "implemented",
    title: "Stored form data is protected",
    body: "Contact submissions are stored with row-level security and are not readable by other visitors under any circumstance.",
  },
  {
    status: "implemented",
    title: "Account security",
    body: "Authentication is handled by a dedicated identity provider rather than a homegrown password system.",
  },
  {
    status: "implemented",
    title: "Tenant separation",
    body: "Every account's monitors, incidents, and history are separated at the database layer with row-level security policies, not just application checks.",
  },
  {
    status: "implemented",
    title: "Encrypted monitor secrets",
    body: "Request headers and tokens you give a monitor are encrypted at rest, used only for the checks you configured, and never displayed back in full.",
  },
  {
    status: "implemented",
    title: "Restricted monitoring destinations",
    body: "Probes refuse private networks, loopback addresses, and internal metadata endpoints, so Fajita cannot be used to scan infrastructure it should not reach.",
  },
  {
    status: "implemented",
    title: "Abuse prevention",
    body: "Rate limits and target validation prevent monitors from being used to harass third parties.",
  },
  {
    status: "implemented",
    title: "Data export",
    body: "Monitoring history and account data can be exported in a documented format. Your uptime record is yours.",
  },
  {
    status: "implemented",
    title: "Account deletion",
    body: "Deleting an account removes its data on a documented schedule. Retention windows are described in the privacy policy.",
  },
];

const securityJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Fajita Security",
  url: `${siteUrl}/security`,
  description:
    "Security controls for Fajita uptime monitoring: tenant separation, encrypted secrets, restricted probes, and responsible disclosure.",
  isPartOf: {
    "@type": "WebSite",
    name: "Fajita",
    url: siteUrl,
  },
};

export default function SecurityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(securityJsonLd) }}
      />

      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">Security</p>
          <h1 className="fj-display-2">
            Built to watch your infrastructure without becoming a risk to it.
          </h1>
          <p className="fj-body-lg fj-page-hero__lede">
            A monitoring service holds a map of what matters to you: your
            endpoints, your schedules, sometimes your tokens. This page says
            plainly what protects that map, and it labels every control by
            its real status. Nothing here is aspirational marketing.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading
            eyebrow="Controls"
            title="What protects your data, labeled honestly."
            lede="Implemented means live today. In progress means actively shipping. Planned means committed but not started. A control never moves up this ladder in marketing before it does in code."
            as="h2"
          />
          <div className="fj-controls">
            {controls.map((control) => {
              const p = statusPresentation[control.status];
              return (
                <div key={control.title} className="fj-control">
                  <StatusBadge
                    className="fj-control__status"
                    status={p.badge}
                    label={p.label}
                  />
                  <div>
                    <h3 className="fj-heading-3 fj-control__title">
                      {control.title}
                    </h3>
                    <p className="fj-body-sm fj-control__body">{control.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading
            eyebrow="Boundaries"
            title="What we claim, what we do not, and how to report an issue."
            as="h2"
          />
          <div className="fj-facts fj-facts--flush">
            <div className="fj-fact">
              <p className="fj-fact__label">What we do not claim</p>
              <p className="fj-body">
                Fajita holds no SOC 2, ISO 27001, or HIPAA certification and
                has not completed an external penetration test. If any of
                that changes, it will be announced here with evidence, not a
                badge.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Your side of the deal</p>
              <p className="fj-body">
                Use scoped, read-only credentials for authenticated monitors
                where your API supports them. Do not point monitors at
                systems you do not own or operate. Keep your account
                credentials to yourself.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Unsupported use</p>
              <p className="fj-body">
                Fajita is not for monitoring third-party infrastructure
                without permission, load testing, or scanning. Probes are
                rate-limited and target-restricted by design.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Reporting a vulnerability</p>
              <p className="fj-body fj-prose">
                Found something? Use the{" "}
                <Link href="/contact?topic=security">contact form</Link> with
                the security topic, or read the{" "}
                <Link href="/legal/disclosure">Responsible Disclosure Policy</Link>
                . A person reads every report and responds.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Policies and documentation</p>
              <p className="fj-body fj-prose">
                See the{" "}
                <Link href="/legal/privacy">Privacy Policy</Link>,{" "}
                <Link href="/docs/security/overview">security documentation</Link>
                , and the{" "}
                <Link href="/legal/subprocessors">Subprocessor List</Link> for
                customers who need processor details.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Next"
            title="Questions we did not answer here?"
            as="h2"
          />
          <div className="fj-hero__ctas">
            <BrandButtonLink href="/contact?topic=security">
              Ask the team
            </BrandButtonLink>
            <BrandButtonLink href="/signup" variant="secondary">
              Start monitoring
            </BrandButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
