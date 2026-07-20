import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Service status",
  description:
    "Current status of Fajita services: website, application, and monitoring infrastructure.",
  path: "/status",
});

export default function StatusPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">Service status</p>
          <h1 className="fj-display-2">All systems operational.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Fajita is live. The website and application are reachable. We
            publish component status, incident history, and measured uptime here
            as we expand self-monitoring across every surface.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--narrow">
          <h2 className="fj-heading-2">Current signal</h2>
          <p className="fj-body">
            Website and application: operational. If you are reading this page,
            the public site is responding normally.
          </p>

          <h2 className="fj-heading-2" style={{ marginTop: "var(--space-10)" }}>
            On this page
          </h2>
          <ul className="fj-plan__list" style={{ marginTop: "var(--space-4)" }}>
            <li>Live component status for the website, API, and checkers</li>
            <li>Incident timeline with real timestamps</li>
            <li>Uptime history measured by Fajita monitoring Fajita</li>
            <li>Subscriptions for people who want updates first</li>
          </ul>

          <p className="fj-body" style={{ marginTop: "var(--space-8)" }}>
            Something look wrong right now?{" "}
            <Link href="/contact?topic=support">Tell us directly</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
