import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Service status",
  description:
    "The status of Fajita itself. Live operational monitoring arrives with the product launch; until then, this page says exactly what we do and do not know.",
  path: "/status",
});

/**
 * Truthful pre-launch status route. There is no live monitoring of Fajita
 * yet, so this page never renders a green "all systems operational" banner
 * or fabricated uptime history. Phase 8 replaces this with Fajita's own
 * status page, run on the product (dogfooding).
 */
export default function StatusPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
            Service status
          </p>
          <h1 className="fj-display-2">The honest version.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Fajita will run its own product against itself and publish the
            results here: live checks, incident history, real uptime. That
            system ships with the product.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container" style={{ maxWidth: "44rem" }}>
          <h2 className="fj-heading-2">What this page is today</h2>
          <p className="fj-body">
            A placeholder that refuses to fake it. We could print a green
            banner that says all systems operational. It would be hardcoded
            text, and a monitoring company should not open with a fake
            status page.
          </p>
          <p className="fj-body">
            What we can tell you honestly: if you are reading this, the
            website is up. Everything beyond that claim waits for real
            checks.
          </p>

          <h2 className="fj-heading-2" style={{ marginTop: "var(--space-10)" }}>
            What replaces it
          </h2>
          <ul className="fj-plan__list" style={{ marginTop: "var(--space-4)" }}>
            <li>Live component status for the website, API, and checks</li>
            <li>Incident timeline with real timestamps</li>
            <li>Uptime history measured by Fajita monitoring Fajita</li>
            <li>Subscriptions for people who want to hear it first</li>
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
