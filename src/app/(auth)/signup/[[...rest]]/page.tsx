import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Create your account",
  description: "Create your Fajita account.",
  path: "/signup",
  noindex: true,
});

export default function SignupPage() {
  return (
    <div>
      <p className="fj-eyebrow fj-page-hero__eyebrow">
        Get started
      </p>
      <h1 className="fj-heading-2" style={{ marginBottom: "var(--space-6)" }}>
        Create your account.
      </h1>

      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/app"
        forceRedirectUrl="/app"
      />

      <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
        By continuing you agree to our{" "}
        <Link href="/legal">terms and privacy policy</Link>. Already have an
        account? <Link href="/login">Log in</Link>.
      </p>
    </div>
  );
}
