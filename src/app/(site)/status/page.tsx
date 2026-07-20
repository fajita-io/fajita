import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Service status",
  description:
    "Current status of the Fajita website and what a full operational status page will include.",
  path: "/status",
});

/**
 * Honest status route until Fajita dogfoods its own status product.
 * Never invent green "all systems operational" banners or fake uptime.
 */
export default function StatusPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">Service status</p>
          <h1 className="fj-display-2">What we can say today.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            If you are reading this, the Fajita website is reachable. Full
            component status, incident history, and measured uptime arrive when
            Fajita monitors Fajita on its own status product.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--narrow">
          <h2 className="fj-heading-2">Current signal</h2>
          <p className="fj-body">
            Website: reachable from this request. We do not print a hardcoded
            green banner for systems we are not yet measuring with live checks.
            A monitoring company should not open with a fake status page.
          </p>

          <h2 className="fj-heading-2" style={{ marginTop: "var(--space-10)" }}>
            What this page becomes
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
