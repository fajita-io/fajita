import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { evaluateReferralEligibility, resolveAttributionConflict, APPROVED_SHARE_COPY, REFERRAL_POLICY_VERSION } from "@/lib/scale";

const eligibility = evaluateReferralEligibility({
  coreActivated: true,
  accountAgeDays: 3,
  minAccountAgeDays: 14,
  billingHealthy: true,
  securityRestricted: false,
  unresolvedSevereSupport: false,
  satisfactionSignal: "neutral",
  realProductUsage: true,
  activeIncident: false,
  paymentFailure: false,
  cancellationInProgress: false,
});
const conflict = resolveAttributionConflict({
  isSelfReferral: false,
  alreadyAttributed: false,
  affiliateLocked: true,
  windowExpired: false,
});


export const metadata: Metadata = {
  title: "Customer referrals",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Customer referrals" },
        ]}
      />
      <OpsPageHeader
        title={"Customer referrals"}
        deck={"Distinct from affiliate commissions. Default reward is thank-you, not cash."}
      />
      <ScaleSubnav current={"/internal/scale/referrals"} />

      <OpsPanel title="Policy">
        <p className="fj-ops-empty">Version {REFERRAL_POLICY_VERSION}. Customer page: /app/referrals. No unauthorized cash rewards.</p>
      </OpsPanel>
      <OpsPanel title="Eligibility example (young activated account)">
        <p>Eligible: {eligibility.eligible ? "Yes" : "No"}</p>
        <ul>{eligibility.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
      </OpsPanel>
      <OpsPanel title="Affiliate conflict example">
        <p>{conflict.note}</p>
      </OpsPanel>
      <OpsPanel title="Approved share copy">
        <ul>{APPROVED_SHARE_COPY.map((c) => <li key={c}>{c}</li>)}</ul>
      </OpsPanel>

    </>
  );
}
