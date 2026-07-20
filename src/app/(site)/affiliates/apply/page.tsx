import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SectionHeading } from "@/components/design-system/typography";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { AffiliateApplyForm } from "@/components/site/affiliate-apply-form";
import { buildMetadata } from "@/lib/site/metadata";
import { getCurrentProfile } from "@/lib/auth/context";
import {
  canAccessAffiliateProgram,
  getAffiliateForCurrentUser,
} from "@/lib/affiliates/context";
import { getApplicationForProfile } from "@/lib/affiliates/applications";
import { ensureAffiliateAccount } from "@/lib/affiliates/provisioning";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Apply to the affiliate program",
  description:
    "Join the Fajita affiliate program and get your referral link immediately. Earn recurring commission on eligible subscriptions.",
  path: "/affiliates/apply",
  noindex: false,
});

const LIVE_STATES = new Set([
  "submitted",
  "under_review",
  "needs_information",
  "waitlisted",
]);

export default async function AffiliateApplyPage() {
  if (!(await canAccessAffiliateProgram())) notFound();
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <section className="fj-page-hero">
        <div className="fj-container fj-container--narrow">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Affiliate program
          </p>
          <h1 className="fj-display-2">Sign in to apply.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Your account is tied to your referral link and payouts. Sign in or
            create an account, then come back here.
          </p>
          <div className="fj-hero__ctas">
            <BrandButtonLink href="/login?redirect=/affiliates/apply">
              Sign in
            </BrandButtonLink>
            <BrandButtonLink
              href="/signup?redirect=/affiliates/apply"
              variant="secondary"
            >
              Create an account
            </BrandButtonLink>
          </div>
        </div>
      </section>
    );
  }

  const { affiliate } = await getAffiliateForCurrentUser();
  if (affiliate) redirect("/affiliate");

  const application = await getApplicationForProfile(profile.id);
  if (application && LIVE_STATES.has(application.state)) {
    await ensureAffiliateAccount({
      profileId: profile.id,
      email: application.email,
      displayName: profile.display_name,
      country: application.country,
      websiteUrl: application.website_url,
      termsSource: "application_auto",
    });
    redirect("/affiliate");
  }

  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container fj-container--narrow">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Affiliate program
          </p>
          <h1 className="fj-display-2">Get your link today.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Tell us how you reach people. Accept the program terms and your
            referral link goes live as soon as you submit.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--narrow">
          <SectionHeading eyebrow="Application" title="A few questions." as="h2" />
          <div style={{ marginTop: "var(--space-6)" }}>
            <AffiliateApplyForm
              defaultEmail={profile.primary_email ?? ""}
              defaultWebsite={null}
            />
          </div>
          <p className="fj-caption" style={{ marginTop: "var(--space-6)" }}>
            By applying you agree to the{" "}
            <Link
              href="/legal/affiliate-agreement"
              style={{ color: "var(--color-brand-text)" }}
            >
              Affiliate Program Agreement
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/affiliate-privacy"
              style={{ color: "var(--color-brand-text)" }}
            >
              Affiliate Privacy Notice
            </Link>
            . Income is not guaranteed.
          </p>
        </div>
      </section>
    </>
  );
}
