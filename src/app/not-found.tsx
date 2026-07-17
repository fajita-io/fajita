import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page is not here. Head back to the Fajita homepage.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <a href="#main" className="fj-skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <div className="fj-error-page">
          <div className="fj-error-page__inner">
            <p className="fj-error-page__code" aria-hidden="true">
              404
            </p>
            <h1 className="fj-display-2">This page left the heat.</h1>
            <p className="fj-body-lg" style={{ maxWidth: "34rem" }}>
              The link may be old, mistyped, or no longer cooking. Nothing
              on your end went wrong.
            </p>
            <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", marginTop: "var(--space-6)" }}>
              <BrandButtonLink href="/">Return home</BrandButtonLink>
              <BrandButtonLink href="/features" variant="secondary">
                Explore features
              </BrandButtonLink>
            </div>
            <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
              Followed a link from our site to get here?{" "}
              <Link href="/contact?topic=support">Tell us so we can fix it</Link>.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
