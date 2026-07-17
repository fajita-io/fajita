import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Verify your email",
  description: "Verify your Fajita email address.",
  path: "/verify-email",
  noindex: true,
});

/**
 * Email verification is collected inside Clerk's sign-up flow. This page backs
 * the documented route and explains the step for anyone who lands here from a
 * link.
 */
export default function VerifyEmailPage() {
  return (
    <div>
      <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
        One more step
      </p>
      <h1 className="fj-heading-2" style={{ marginBottom: "var(--space-4)" }}>
        Verify your email.
      </h1>
      <p className="fj-body" style={{ marginBottom: "var(--space-6)" }}>
        Check your inbox for a verification code from Fajita and enter it on the
        sign-up screen. The code expires shortly, so if it lapses, request a new
        one.
      </p>
      <p className="fj-body-sm">
        Wrong address or need to start over?{" "}
        <Link href="/signup">Back to sign up</Link>.
      </p>
    </div>
  );
}
