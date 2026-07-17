import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppSection, PageHeader } from "@/components/app/ui";
import { getCurrentProfile } from "@/lib/auth/context";
import { resolveActiveOrg } from "@/lib/app/organizations";
import { readActiveOrgId } from "@/lib/app/active-org";
import {
  APPROVED_SHARE_COPY,
  buildShareCopy,
  evaluateReferralEligibility,
  REFERRAL_POLICY_VERSION,
} from "@/lib/scale/referrals";
import { appUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Referrals",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Customer referral foundation. No cash rewards by default.
 * Distinct from Phase 12 affiliate commission attribution.
 */
export default async function ReferralsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const orgId = await readActiveOrgId();
  const active = await resolveActiveOrg(profile.id, orgId);
  if (!active) redirect("/app");

  // Eligibility uses conservative defaults until Phase 19 activation signals wire in.
  const eligibility = evaluateReferralEligibility({
    coreActivated: false,
    accountAgeDays: 0,
    minAccountAgeDays: 14,
    billingHealthy: true,
    securityRestricted: false,
    unresolvedSevereSupport: false,
    satisfactionSignal: "unknown",
    realProductUsage: false,
    activeIncident: false,
    paymentFailure: false,
    cancellationInProgress: false,
  });

  const placeholderCode = `c_${active.organization.slug.slice(0, 12)}`;
  const share = buildShareCopy(placeholderCode, appUrl);

  return (
    <>
      <PageHeader
        title="Referrals"
        description="Share Fajita when it has already earned trust. No cash rewards. Optional affiliate invitation comes later, after qualification."
      />

      {!eligibility.eligible ? (
        <AppSection
          title="Not ready to share yet"
          description="Referral prompts wait for activation, a minimum account age, healthy billing, and real usage. We do not ask right after payment or during an incident."
        >
          <ul className="fj-list" aria-live="polite">
            {eligibility.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </AppSection>
      ) : (
        <AppSection
          title="Your link"
          description="Copy the link and share from your own email or messages. Fajita does not send referral mail on your behalf."
        >
          <p className="fj-mono-block">
            <code>{share.link}</code>
          </p>
        </AppSection>
      )}

      <AppSection title="Approved wording">
        <ul className="fj-list">
          {APPROVED_SHARE_COPY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </AppSection>

      <AppSection
        title="History"
        description={`No referral conversions yet. Policy ${REFERRAL_POLICY_VERSION}. Affiliate commissions use a separate system and never double-count the same subscription.`}
      >
        <p className="fj-muted">Nothing to show yet.</p>
      </AppSection>
    </>
  );
}
