import { PageHeader, AppSection } from "@/components/app/ui";
import { PayoutSetup } from "@/components/affiliate/payout-setup";
import { requireAffiliate } from "@/lib/affiliates/context";
import { affiliateCan } from "@/lib/affiliates/permissions";
import { getPayoutOverview } from "@/lib/affiliates/payouts";
import { payoutStatusExplanation } from "@/lib/affiliates/payout-eligibility";
import type { MembershipState } from "@/lib/affiliates/states";

export const dynamic = "force-dynamic";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AffiliatePayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const { affiliate } = await requireAffiliate();
  const state = affiliate.membership_state as MembershipState;
  const overview = await getPayoutOverview(affiliate.id);
  const params = await searchParams;
  const justReturned = params.setup === "return";
  const canManage = affiliateCan(state, "affiliate.payout_profile.manage");

  const belowThreshold =
    overview.payableCents > 0 &&
    overview.payableCents < overview.thresholdCents;

  return (
    <>
      <PageHeader
        title="Payouts"
        description="What you have earned, and how you get paid."
      />

      <AppSection
        title="Balance"
        description="Payable is cleared commission ready for the next payout run."
      >
        <div className="fj-affiliate__stats">
          <Stat label="Payable" value={formatUsd(overview.payableCents)} />
          <Stat
            label="Payout minimum"
            value={formatUsd(overview.thresholdCents)}
          />
        </div>
        {belowThreshold ? (
          <p className="fj-body-sm">
            {payoutStatusExplanation("below_threshold")}
          </p>
        ) : null}
      </AppSection>

      <AppSection
        title="Payout setup"
        description="Get paid through our payment processor."
      >
        <PayoutSetup
          connectConfigured={overview.connectConfigured}
          enabled={overview.payoutSetupComplete}
          accountStatus={overview.accountStatus}
          justReturned={justReturned}
          canManage={canManage}
        />
      </AppSection>

      <AppSection
        title="Statements"
        description="A record of every payment we send you."
      >
        {overview.statements.length === 0 ? (
          <p className="fj-body-sm">
            No statements yet. Your first statement appears after your first
            payout.
          </p>
        ) : (
          <table className="fj-admin-table">
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Paid</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {overview.statements.map((s) => (
                <tr key={s.id}>
                  <td>{s.periodLabel}</td>
                  <td>{formatUsd(s.paidCents)}</td>
                  <td>{formatDate(s.generatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AppSection>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="fj-affiliate__stat">
      <span className="fj-affiliate__stat-value">{value}</span>
      <span className="fj-affiliate__stat-label">{label}</span>
    </div>
  );
}
