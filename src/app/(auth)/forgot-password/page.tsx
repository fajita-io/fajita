import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reset your password",
  description: "Reset your Fajita password.",
  path: "/forgot-password",
  noindex: true,
});

/**
 * Password reset is handled inside Clerk's sign-in flow (the "forgot password"
 * link on the login card starts the verified email reset). This page exists
 * for the documented route and directs the user into that secure flow rather
 * than reimplementing credential reset.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="fj-authshell__flow">
      <header className="fj-authshell__flow-header">
        <p className="fj-eyebrow">Account recovery</p>
        <h1 className="fj-heading-2 fj-authshell__flow-title">
          Reset your password
        </h1>
        <p className="fj-body fj-authshell__flow-lede">
          Start from the login screen and choose &ldquo;Forgot password.&rdquo;
          We will email a verification code, then let you set a new one.
        </p>
      </header>

      <BrandButtonLink href="/login">Go to login</BrandButtonLink>

      <footer className="fj-authshell__flow-footer">
        <p className="fj-body-sm">
          Still stuck? <Link href="/contact">Contact support</Link>.
        </p>
      </footer>
    </div>
  );
}
