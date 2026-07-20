import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppSection, PageHeader } from "@/components/app/ui";
import { ReferralStatGrid } from "@/components/app/referrals/referral-stat-grid";
import { CopyField } from "@/components/affiliate/copy-field";
import { CopySnippet } from "@/components/affiliate/copy-snippet";
import { ReferralsActivateForm } from "@/components/app/referrals-activate-form";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { getCurrentProfile } from "@/lib/auth/context";
import { resolveActiveOrg } from "@/lib/app/organizations";
import { readActiveOrgId } from "@/lib/app/active-org";
import { getApplicationForProfile } from "@/lib/affiliates/applications";
import {
  commissionRatePercentLabel,
  activeTerms,
} from "@/lib/affiliates/config";
import { getAffiliateForCurrentUser } from "@/lib/affiliates/context";
import { getEarningsSummary } from "@/lib/affiliates/earnings";
import { buildReferralUrl, getDefaultCode } from "@/lib/affiliates/links";
import { getPerformanceSummary } from "@/lib/affiliates/metrics";
import { ensureAffiliateAccount } from "@/lib/affiliates/provisioning";
import { buildAffiliateShareSnippets } from "@/lib/affiliates/share-copy";
import type { MembershipState } from "@/lib/affiliates/states";

export const metadata: Metadata = {
  title: "Referrals",
  description:
    "Share Fajita and earn recurring commission on every eligible referral.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function ReferralsPageShell({ children }: { children: ReactNode }) {
  return <div className="fj-referrals-page">{children}</div>;
}

/**
 * In-app affiliate hub. Activates instantly with terms acceptance, provisions a
 * tracked referral link, and surfaces earnings and copy without leaving the app.
 */
export default async function ReferralsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/app/referrals");

  const orgId = await readActiveOrgId();
  const active = await resolveActiveOrg(profile.id, orgId);
  if (!active) redirect("/app");

  const { affiliate: existingAffiliate } = await getAffiliateForCurrentUser();
  let affiliate = existingAffiliate;
  let defaultLink: string | null = null;
  let defaultCode: string | null = null;

  if (affiliate) {
    const code = await getDefaultCode(affiliate.id);
    if (code) {
      defaultCode = code.code;
      defaultLink = buildReferralUrl({ code: code.code, destination: "/" });
    }
  } else {
    const application = await getApplicationForProfile(profile.id);
    if (application?.state === "blocked") {
      return (
        <ReferralsPageShell>
          <PageHeader
            title="Referrals"
            description="Share Fajita and earn recurring commission when teams you refer subscribe."
          />
          <AppSection
            title="Not eligible"
            description="This account cannot join the affiliate program. Contact support if you think that is a mistake."
          >
            <p className="fj-muted">
              <Link href="/app/support">Contact support</Link>
            </p>
          </AppSection>
        </ReferralsPageShell>
      );
    }

    const liveApplicationStates = new Set([
      "submitted",
      "under_review",
      "needs_information",
      "waitlisted",
    ]);
    if (application && liveApplicationStates.has(application.state)) {
      const provisioned = await ensureAffiliateAccount({
        profileId: profile.id,
        email: application.email,
        displayName: profile.display_name,
        country: application.country,
        websiteUrl: application.website_url,
        termsSource: "application_auto",
      });
      affiliate = provisioned.affiliate;
      defaultCode = provisioned.defaultCode;
      defaultLink = provisioned.defaultLink;
    }
  }

  if (!affiliate) {
    const terms = activeTerms();
    return (
      <ReferralsPageShell>
        <PageHeader
          title="Referrals"
          description="Share Fajita. Earn recurring commission when teams you send subscribe."
        />
        <AppSection
          title="Start in one step"
          description="Accept the program terms and your referral link is live immediately. Every click is tracked for 30 days."
        >
          <ReferralsActivateForm />
        </AppSection>
        <AppSection
          title="What you earn"
          description="Recurring commission on eligible paid plans. Payouts follow program review."
        >
          <ReferralStatGrid
            stats={[
              { label: "Commission", value: commissionRatePercentLabel() },
              {
                label: "Recurring",
                value: `${terms.recurringEligibilityMonths} mo`,
              },
              {
                label: "Minimum payout",
                value: formatUsd(terms.minimumPayoutThresholdCents),
              },
            ]}
          />
          <p className="fj-referrals-note">
            Full program terms live in the{" "}
            <Link href="/legal/affiliate-agreement">Affiliate Program Agreement</Link>.
          </p>
        </AppSection>
      </ReferralsPageShell>
    );
  }

  const state = affiliate.membership_state as MembershipState;
  if (state === "terminated" || state === "closed") {
    return (
      <ReferralsPageShell>
        <PageHeader
          title="Referrals"
          description="Your affiliate account is closed. History stays available in the affiliate dashboard."
        />
        <AppSection title="Account closed">
          <p className="fj-body-sm">
            Any balance already cleared will still be paid.{" "}
            <Link href="/affiliate">Open affiliate history</Link>
          </p>
        </AppSection>
      </ReferralsPageShell>
    );
  }

  if (state === "suspended") {
    return (
      <ReferralsPageShell>
        <PageHeader
          title="Referrals"
          description="Your affiliate account is under review."
        />
        <AppSection title="Under review">
          <p className="fj-body-sm">
            Links are read only for now. Check your email for next steps or visit{" "}
            <Link href="/affiliate">your affiliate dashboard</Link>.
          </p>
        </AppSection>
      </ReferralsPageShell>
    );
  }

  const [earnings, performance] = await Promise.all([
    getEarningsSummary(affiliate.id),
    getPerformanceSummary(affiliate.id),
  ]);

  const link =
    defaultLink ??
    (defaultCode
      ? buildReferralUrl({ code: defaultCode, destination: "/" })
      : null);
  const snippets = link ? buildAffiliateShareSnippets(link) : [];

  return (
    <ReferralsPageShell>
      <PageHeader
        title="Referrals"
        description="Your link is live. Share it anywhere you already have trust."
        actions={
          <BrandButtonLink href="/affiliate" variant="secondary" size="sm">
            Full affiliate dashboard
          </BrandButtonLink>
        }
      />

      <AppSection
        title="Your referral link"
        description="Every signup through this link is tracked for 30 days. Commission applies to eligible paid plans."
      >
        {link ? (
          <CopyField value={link} label="Share this link" />
        ) : (
          <p className="fj-body-sm">Your link is being set up. Refresh in a moment.</p>
        )}
      </AppSection>

      <AppSection
        title="Earnings"
        description="Holding clears after the review period. Payable is ready for payout."
      >
        <ReferralStatGrid
          stats={[
            { label: "Holding", value: formatUsd(earnings.holdingCents) },
            { label: "Payable", value: formatUsd(earnings.payableCents) },
            { label: "Paid", value: formatUsd(earnings.paidCents) },
          ]}
        />
        <p className="fj-referrals-note">
          <Link href="/affiliate/payouts">Set up payouts</Link> when you are ready
          to get paid.
        </p>
      </AppSection>

      <AppSection title="Performance">
        <ReferralStatGrid
          stats={[
            { label: "Eligible clicks", value: String(performance.eligibleClicks) },
            { label: "Referred signups", value: String(performance.referredSignups) },
            {
              label: "Active referrals",
              value: String(performance.activeConversions),
            },
          ]}
        />
      </AppSection>

      <AppSection
        title="Copy you can use"
        description="Edit freely. Keep the claims honest."
      >
        {snippets.length === 0 ? (
          <p className="fj-body-sm">Copy appears once your link is ready.</p>
        ) : (
          <div className="fj-snippet-list">
            {snippets.map((snippet) => (
              <CopySnippet
                key={snippet.label}
                label={snippet.label}
                value={snippet.value}
              />
            ))}
          </div>
        )}
      </AppSection>
    </ReferralsPageShell>
  );
}
