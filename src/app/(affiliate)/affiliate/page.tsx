import { PageHeader, AppSection } from "@/components/app/ui";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { CopyField } from "@/components/affiliate/copy-field";
import { requireAffiliate } from "@/lib/affiliates/context";
import {
  buildReferralUrl,
  getDefaultCode,
  listCampaigns,
  listCodes,
  listLinks,
} from "@/lib/affiliates/links";
import { commissionRatePercentLabel, activeTerms } from "@/lib/affiliates/config";
import { getEarningsSummary } from "@/lib/affiliates/earnings";
import type { MembershipState } from "@/lib/affiliates/states";

export const dynamic = "force-dynamic";

const MEMBERSHIP_PRESENTATION: Record<
  MembershipState,
  { status: "operational" | "verifying" | "maintenance" | "down" | "paused"; label: string; note: string }
> = {
  active: {
    status: "operational",
    label: "Active",
    note: "Your links are live and referrals are tracked.",
  },
  paused: {
    status: "paused",
    label: "Paused",
    note: "Tracking is paused. Existing history is preserved.",
  },
  suspended: {
    status: "maintenance",
    label: "Suspended",
    note: "Your account is under review. Links are read only for now.",
  },
  terminated: {
    status: "down",
    label: "Closed",
    note: "This account is closed. History remains available.",
  },
  closed: {
    status: "down",
    label: "Closed",
    note: "This account is closed. History remains available.",
  },
};

export default async function AffiliateOverviewPage() {
  const { affiliate } = await requireAffiliate();
  const state = affiliate.membership_state as MembershipState;
  const presentation = MEMBERSHIP_PRESENTATION[state];
  const terms = activeTerms();

  const [defaultCode, codes, campaigns, links, earnings] = await Promise.all([
    getDefaultCode(affiliate.id),
    listCodes(affiliate.id),
    listCampaigns(affiliate.id),
    listLinks(affiliate.id),
    getEarningsSummary(affiliate.id),
  ]);

  const defaultLink = defaultCode
    ? buildReferralUrl({ code: defaultCode.code, destination: "/" })
    : null;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Your referral link, your status, and what the program pays."
        actions={
          <StatusBadge status={presentation.status} label={presentation.label} />
        }
      />

      <AppSection title="Your referral link" description={presentation.note}>
        {defaultLink ? (
          <CopyField value={defaultLink} label="Share this link" />
        ) : (
          <p className="fj-body-sm">
            Your default link is being set up. Check back in a moment.
          </p>
        )}
      </AppSection>

      <AppSection
        title="Earnings"
        description="Holding clears after the review period. Payable is ready for payout."
      >
        <div className="fj-affiliate__stats">
          <Stat label="Holding" value={formatUsd(earnings.holdingCents)} />
          <Stat label="Payable" value={formatUsd(earnings.payableCents)} />
          <Stat label="Paid" value={formatUsd(earnings.paidCents)} />
        </div>
      </AppSection>

      <AppSection title="At a glance">
        <div className="fj-affiliate__stats">
          <Stat label="Codes" value={String(codes.length)} />
          <Stat label="Campaigns" value={String(campaigns.length)} />
          <Stat label="Links" value={String(links.length)} />
        </div>
      </AppSection>

      <AppSection
        title="What the program pays"
        description="These numbers come from the published Program Terms. They change only when the program version changes."
      >
        <div className="fj-affiliate__stats">
          <Stat label="Commission" value={commissionRatePercentLabel()} />
          <Stat
            label="Recurring"
            value={`${terms.recurringEligibilityMonths} mo`}
          />
          <Stat
            label="Attribution"
            value={`${terms.attributionWindowDays} days`}
          />
        </div>
      </AppSection>
    </>
  );
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="fj-affiliate__stat">
      <span className="fj-affiliate__stat-value">{value}</span>
      <span className="fj-affiliate__stat-label">{label}</span>
    </div>
  );
}
