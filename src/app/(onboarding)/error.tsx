"use client";

import { useEffect } from "react";

import { BrandButton, BrandButtonLink } from "@/components/design-system/primitives";

/**
 * Onboarding flow errors (org creation, payment setup). Keeps the visitor in
 * the setup context instead of the generic site-wide 500 page.
 */
export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="fj-flow__card" style={{ display: "grid", gap: "var(--space-4)" }}>
      <p className="fj-body-sm" style={{ margin: 0, color: "var(--color-text-muted)" }}>
        Setup interrupted
      </p>
      <h1 className="fj-flow__title">We hit a snag finishing setup.</h1>
      <p className="fj-flow__lede">
        Your account is fine. Retry below, or start again from organization
        creation.
      </p>
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <BrandButton onClick={reset}>Try again</BrandButton>
        <BrandButtonLink href="/app/new-organization" variant="secondary">
          Back to organization setup
        </BrandButtonLink>
      </div>
    </div>
  );
}
