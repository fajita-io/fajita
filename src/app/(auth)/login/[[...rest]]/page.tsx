import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Log in",
  description: "Log in to Fajita.",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <div>
      <p className="fj-eyebrow fj-page-hero__eyebrow">
        Welcome back
      </p>
      <h1 className="fj-heading-2" style={{ marginBottom: "var(--space-6)" }}>
        Log in to Fajita.
      </h1>

      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/app"
        forceRedirectUrl="/app"
      />

      <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
        New to Fajita? <Link href="/signup">Create an account</Link>.
      </p>
    </div>
  );
}
