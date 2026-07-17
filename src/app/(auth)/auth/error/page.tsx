import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Sign-in problem",
  description: "We could not complete sign-in.",
  path: "/auth/error",
  noindex: true,
});

export default function AuthErrorPage() {
  return (
    <div>
      <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
        Sign-in
      </p>
      <h1 className="fj-heading-2" style={{ marginBottom: "var(--space-4)" }}>
        That did not go through.
      </h1>
      <p className="fj-body" style={{ marginBottom: "var(--space-6)" }}>
        We could not complete sign-in. The link may have expired, or it was
        already used. Nothing was changed on your account. Try again.
      </p>
      <BrandButtonLink href="/login">Back to login</BrandButtonLink>
      <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
        If it keeps happening, <Link href="/contact">tell us</Link> and we will
        look into it.
      </p>
    </div>
  );
}
