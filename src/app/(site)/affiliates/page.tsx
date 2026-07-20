import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/design-system/typography";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { buildMetadata } from "@/lib/site/metadata";
import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/context";
import {
  canAccessAffiliateProgram,
  getAffiliateForCurrentUser,
} from "@/lib/affiliates/context";
import {
  activeTerms,
  commissionRatePercentLabel,
  programPublished,
} from "@/lib/affiliates/config";
import { getApplicationForProfile } from "@/lib/affiliates/applications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Affiliate program",
  description:
    "Refer teams to Fajita and earn recurring commission while they stay. Honest attribution, clear terms, real payouts.",
  path: "/affiliates",
  noindex: !programPublished,
});

const APPLICANT_STATUS_COPY: Record<
  string,
  { badge: "operational" | "verifying" | "maintenance" | "down"; label: string; body: string }
> = {
  submitted: {
    badge: "verifying",
    label: "In review",
    body: "Your application is in. We review each one by hand. You will hear from us by email.",
  },
  under_review: {
    badge: "verifying",
    label: "In review",
    body: "A person is looking at your application now. We will be in touch shortly.",
  },
  needs_information: {
    badge: "maintenance",
    label: "Needs a detail",
    body: "We need one more thing before we can decide. Check your email for what we asked.",
  },
  waitlisted: {
    badge: "maintenance",
    label: "In queue",
    body: "Your application is queued. We review in order and email you when there is a decision.",
  },
  rejected: {
    badge: "down",
    label: "Not this time",
    body: "This one did not go through. You can apply again after the cooldown period.",
  },
  blocked: {
    badge: "down",
    label: "Unavailable",
    body: "This account is not eligible for the program.",
  },
};

export default async function AffiliatesPage() {
  if (!(await canAccessAffiliateProgram())) notFound();

  const profile = await getCurrentProfile();
  const terms = activeTerms();
  const rate = commissionRatePercentLabel();

  let cta: React.ReactNode;
  if (!profile) {
    cta = (
      <div className="fj-hero__ctas">
        <BrandButtonLink href="/affiliates/apply">Apply to join</BrandButtonLink>
        <BrandButtonLink href="/login" variant="secondary">
          Sign in
        </BrandButtonLink>
      </div>
    );
  } else {
    const { affiliate } = await getAffiliateForCurrentUser();
    if (affiliate) {
      cta = (
        <div className="fj-hero__ctas">
          <BrandButtonLink href="/affiliate">Open your dashboard</BrandButtonLink>
        </div>
      );
    } else {
      const application = await getApplicationForProfile(profile.id);
      const status = application
        ? APPLICANT_STATUS_COPY[application.state]
        : null;
      if (status) {
        cta = (
          <div className="fj-control" style={{ maxWidth: "40rem" }}>
            <StatusBadge
              className="fj-control__status"
              status={status.badge}
              label={status.label}
            />
            <div>
              <p className="fj-body" style={{ margin: 0 }}>
                {status.body}
              </p>
              {application?.state === "needs_information" ? (
                <p className="fj-body-sm" style={{ margin: "var(--space-2) 0 0" }}>
                  <Link
                    href="/affiliates/apply"
                    style={{ color: "var(--color-brand-text)" }}
                  >
                    Reopen your application
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        );
      } else {
        cta = (
          <div className="fj-hero__ctas">
            <BrandButtonLink href="/affiliates/apply">
              Apply to join
            </BrandButtonLink>
          </div>
        );
      }
    }
  }

  return (
    <>
      {!programPublished ? (
        <div
          className="fj-container"
          style={{ paddingTop: "var(--space-4)" }}
        >
          <div className="fj-fact" style={{ borderColor: "var(--color-amber-border, var(--color-border))" }}>
            <p className="fj-fact__label">Preview</p>
            <p className="fj-body-sm" style={{ margin: 0 }}>
              The affiliate program is in final review. This preview is visible
              to the team only.
            </p>
          </div>
        </div>
      ) : null}

      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Affiliate program
          </p>
          <h1 className="fj-display-2">Get paid when the software stays cool.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Send a team to Fajita. When they subscribe and keep watching their
            systems with us, you earn a share of what they pay. Recurring, not
            a one-time bounty. Honest tracking, clear terms, real payouts.
          </p>
          {cta}
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading
            eyebrow="The deal"
            title="Clear terms. Versioned. No quiet changes."
            lede="Every number here comes from the published Program Terms. When terms change, the version changes with them."
            as="h2"
          />
          <div className="fj-facts" style={{ marginTop: "var(--space-6)" }}>
            <div className="fj-fact">
              <p className="fj-fact__label">Commission</p>
              <p className="fj-body">
                {rate} of eligible subscription revenue, recurring for up to{" "}
                {terms.recurringEligibilityMonths} months per referred account.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Attribution</p>
              <p className="fj-body">
                A {terms.attributionWindowDays}-day window from the last time
                someone follows your link. Last eligible touch wins.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">Payouts</p>
              <p className="fj-body">
                Paid {terms.payoutFrequency} once your approved balance clears a{" "}
                {formatUsd(terms.minimumPayoutThresholdCents)} minimum.
                Commissions hold {terms.commissionHoldingDays} days before they
                approve.
              </p>
            </div>
            <div className="fj-fact">
              <p className="fj-fact__label">What counts</p>
              <p className="fj-body">
                Paid subscriptions on eligible plans. Tax, refunds, disputes,
                and credits do not. Self-referrals do not.
              </p>
            </div>
          </div>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-6)" }}>
            Full terms:{" "}
            <Link href="/legal/affiliate-agreement">Affiliate Program Agreement</Link>
            {" · "}
            <Link href="/legal/affiliate-privacy">Affiliate Privacy Notice</Link>
            . Income is not guaranteed.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container fj-container--wide">
          <SectionHeading
            eyebrow="How it works"
            title="Apply, share, get paid."
            as="h2"
          />
          <ol className="fj-steps">
            <li className="fj-step">
              <span className="fj-step__num">1</span>
              <div>
                <h3 className="fj-heading-3" style={{ margin: 0 }}>
                  Apply
                </h3>
                <p className="fj-body-sm" style={{ margin: "var(--space-2) 0 0" }}>
                  Tell us who you reach and how. We review every application by
                  hand. No bots, no instant links.
                </p>
              </div>
            </li>
            <li className="fj-step">
              <span className="fj-step__num">2</span>
              <div>
                <h3 className="fj-heading-3" style={{ margin: 0 }}>
                  Share your link
                </h3>
                <p className="fj-body-sm" style={{ margin: "var(--space-2) 0 0" }}>
                  Get a personal referral link and build campaign links for
                  each place you post. Disclose that it is an affiliate link.
                </p>
              </div>
            </li>
            <li className="fj-step">
              <span className="fj-step__num">3</span>
              <div>
                <h3 className="fj-heading-3" style={{ margin: 0 }}>
                  Earn as they stay
                </h3>
                <p className="fj-body-sm" style={{ margin: "var(--space-2) 0 0" }}>
                  When a referred team subscribes, commission accrues each month
                  they keep paying, up to the eligibility window.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <SectionHeading
            eyebrow="Ready"
            title="Refer your first team."
            as="h2"
          />
          {cta}
        </div>
      </section>
    </>
  );
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
