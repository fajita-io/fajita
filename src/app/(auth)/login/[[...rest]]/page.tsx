import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

import { buildSignupUrl } from "@/lib/auth/paid-signup-flow";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Log in",
  description: "Log in to Fajita.",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <div className="fj-authshell__flow">
      <header className="fj-authshell__flow-header">
        <p className="fj-eyebrow fj-authshell__flow-eyebrow">Log in</p>
        <h1 className="fj-authshell__flow-title">Welcome back to Fajita</h1>
        <p className="fj-body fj-authshell__flow-lede">
          Pick up where your team left off.
        </p>
      </header>

      <div className="fj-authshell__clerk">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl={buildSignupUrl()}
          fallbackRedirectUrl="/app"
          forceRedirectUrl="/app"
        />
      </div>

      <footer className="fj-authshell__flow-footer">
        <p className="fj-body-sm fj-authshell__flow-legal">
          By continuing you agree to Fajita&apos;s{" "}
          <Link href="/legal/terms">Terms</Link> and{" "}
          <Link href="/legal/privacy">Privacy Policy</Link>. Need help?{" "}
          <Link href="/contact">Contact support</Link>.
        </p>
        <p className="fj-body-sm">
          New to Fajita?{" "}
          <Link href={buildSignupUrl()}>Create an account</Link>
        </p>
      </footer>
    </div>
  );
}
