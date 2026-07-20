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
    <div className="fj-authshell__flow">
      <header className="fj-authshell__flow-header">
        <p className="fj-eyebrow">Create account</p>
        <h1 className="fj-heading-2 fj-authshell__flow-title">
          Start with Fajita
        </h1>
        <p className="fj-body fj-authshell__flow-lede">
          Monitors, alerts, and status pages in one calm place.
        </p>
      </header>

      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/app"
        forceRedirectUrl="/app"
      />

      <footer className="fj-authshell__flow-footer">
        <p className="fj-caption fj-authshell__flow-legal">
          By continuing you agree to Fajita&apos;s{" "}
          <Link href="/legal/terms">Terms</Link> and{" "}
          <Link href="/legal/privacy">Privacy Policy</Link>. Need help?{" "}
          <Link href="/contact">Contact support</Link>.
        </p>
        <p className="fj-body-sm">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </footer>
    </div>
  );
}
