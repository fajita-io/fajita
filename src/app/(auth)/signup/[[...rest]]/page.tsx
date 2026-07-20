import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

import {
  buildNewOrganizationUrl,
  parseSignupPlanParams,
} from "@/lib/auth/paid-signup-flow";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Create your account",
  description: "Create your Fajita account, choose a plan, and start monitoring.",
  path: "/signup",
  noindex: true,
});

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const { plan, interval } = parseSignupPlanParams(await searchParams);
  const afterSignupUrl = buildNewOrganizationUrl(plan, interval);

  return (
    <div className="fj-authshell__flow">
      <header className="fj-authshell__flow-header">
        <p className="fj-authshell__flow-eyebrow">Create account</p>
        <h1 className="fj-authshell__flow-title">Start with Fajita</h1>
        <p className="fj-body fj-authshell__flow-lede">
          Create your account, choose a plan, then set up your first monitor.
        </p>
      </header>

      <div className="fj-authshell__clerk">
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          fallbackRedirectUrl={afterSignupUrl}
          forceRedirectUrl={afterSignupUrl}
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
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </footer>
    </div>
  );
}
