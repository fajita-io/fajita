import type { Metadata } from "next";

import { AuthCallback } from "./auth-callback";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Signing you in",
  description: "Completing authentication.",
  path: "/auth/callback",
  noindex: true,
});

export default function AuthCallbackPage() {
  return (
    <div role="status" aria-live="polite">
      <h1 className="fj-heading-3" style={{ marginBottom: "var(--space-3)" }}>
        Signing you in.
      </h1>
      <p className="fj-body-sm">One moment while we confirm it is you.</p>
      <AuthCallback />
    </div>
  );
}
