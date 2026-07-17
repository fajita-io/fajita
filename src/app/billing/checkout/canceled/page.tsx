import type { Metadata } from "next";

import { BrandButtonLink } from "@/components/design-system/primitives";

export const metadata: Metadata = {
  title: "Checkout canceled",
  robots: { index: false, follow: false },
};

export default function CheckoutCanceledPage() {
  return (
    <main
      className="fj-checkout-return"
      style={{ maxWidth: 560, margin: "0 auto", padding: "var(--space-8) var(--space-4)" }}
    >
      <div className="fj-notice" style={{ display: "grid", gap: "var(--space-4)" }}>
        <h1 style={{ margin: 0 }}>Checkout canceled</h1>
        <p style={{ margin: 0 }}>
          No charge was completed and your current plan is unchanged. You can
          pick a plan whenever you are ready.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <BrandButtonLink href="/app/settings/billing/plans">
            Choose a plan
          </BrandButtonLink>
          <BrandButtonLink href="/app" variant="secondary">
            Back to Fajita
          </BrandButtonLink>
        </div>
      </div>
    </main>
  );
}
