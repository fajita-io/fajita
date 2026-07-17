import type { Metadata } from "next";
import Link from "next/link";

import { ThermalStack } from "@/components/brand/thermal-stack/thermal-stack";
import { EarlyAccessForm } from "@/components/site/early-access-form";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Get early access",
  description:
    "Fajita accounts open in stages. Leave your email and yours is one of the first invitations we send. Website, API, SSL, and cron monitoring with hosted status pages.",
  path: "/early-access",
});

export default function EarlyAccessPage() {
  return (
    <div className="fj-auth">
      <div className="fj-auth__panel">
        <div>
          <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
            Early access
          </p>
          <h1 className="fj-heading-1" style={{ marginBottom: "var(--space-4)" }}>
            Be watching from day one.
          </h1>
          <p className="fj-body" style={{ marginBottom: "var(--space-8)" }}>
            Accounts open in stages. Leave your email and yours is one of the
            first invitations we send. No card, no commitment.
          </p>

          <EarlyAccessForm source="early-access" />

          <p className="fj-body-sm" style={{ marginTop: "var(--space-8)" }}>
            Want to see the product first?{" "}
            <Link href="/#how-it-works">Walk through the demo</Link> or{" "}
            <Link href="/features">read the features</Link>.
          </p>
        </div>
      </div>

      <aside className="fj-auth__aside" aria-hidden="true">
        <div style={{ maxWidth: "28rem", marginInline: "auto", width: "100%" }}>
          <ThermalStack state="operational" />
          <p className="fj-caption" style={{ marginTop: "var(--space-5)", textAlign: "center" }}>
            Five services, held steady. The state you will stop worrying about.
          </p>
        </div>
      </aside>
    </div>
  );
}
