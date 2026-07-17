"use client";

import { useEffect } from "react";

import { BrandButton, BrandButtonLink } from "@/components/design-system/primitives";

/**
 * Root error boundary (500). Calm, no jokes: the visitor already has a
 * problem. Offers retry and a way out. No internal error detail is shown.
 */
export default function RootError({
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
    <main id="main">
      <div className="fj-error-page">
        <div className="fj-error-page__inner">
          <p className="fj-error-page__code" aria-hidden="true">
            500
          </p>
          <h1 className="fj-display-2">Something failed on our side.</h1>
          <p className="fj-body-lg" style={{ maxWidth: "34rem" }}>
            The page hit an error while loading. Your data is fine, and
            retrying is safe.
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
              flexWrap: "wrap",
              marginTop: "var(--space-6)",
            }}
          >
            <BrandButton onClick={reset}>Try again</BrandButton>
            <BrandButtonLink href="/" variant="secondary">
              Return home
            </BrandButtonLink>
          </div>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
            Still failing? Reach us at{" "}
            <a href="/contact?topic=support">fajita.io/contact</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
