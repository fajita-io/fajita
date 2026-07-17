"use client";

import { useEffect } from "react";

import { BrandButton } from "@/components/design-system/primitives";

/**
 * Authenticated error boundary. Shows a calm, plain-language message with a
 * safe next action. Never renders stack traces, provider errors, or database
 * detail. The digest is a correlation reference, safe to show.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] route error", error);
  }, [error]);

  return (
    <div className="fj-empty" role="alert">
      <h1 className="fj-empty__title">Something cooled down unexpectedly.</h1>
      <p className="fj-empty__desc">
        We hit a problem loading this page. Your account is safe. Try again, and
        if it keeps happening, contact support.
      </p>
      {error.digest ? (
        <p className="fj-empty__desc" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
          Reference: {error.digest}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center" }}>
        <BrandButton onClick={() => reset()}>Try again</BrandButton>
        <BrandButton variant="ghost" onClick={() => { window.location.href = "/app"; }}>
          Back to overview
        </BrandButton>
      </div>
    </div>
  );
}
