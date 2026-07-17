import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader, AppSection } from "@/components/app/ui";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import {
  AdjustmentPanel,
  FraudReviewPanel,
  MembershipControls,
} from "@/components/affiliate/affiliate-ops-panels";
import { getAffiliateAdminDetail } from "@/lib/affiliates/admin-directory";
import { AppAuthError } from "@/lib/auth/errors";

export const metadata: Metadata = {
  title: "Affiliate detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AffiliateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let detail;
  try {
    detail = await getAffiliateAdminDetail(id);
  } catch (error) {
    if (error instanceof AppAuthError && error.kind === "not_found") {
      notFound();
    }
    throw error;
  }

  const membershipBadge =
    detail.membershipState === "active"
      ? ({ status: "operational" as const, label: "Active" })
      : detail.membershipState === "paused"
        ? ({ status: "paused" as const, label: "Paused" })
        : detail.membershipState === "suspended"
          ? ({ status: "maintenance" as const, label: "Suspended" })
          : ({ status: "down" as const, label: detail.membershipState });

  return (
    <>
      <PageHeader
        title={detail.defaultCode ?? "Affiliate"}
        description={detail.contactEmail ?? "No contact email on file."}
        actions={
          <StatusBadge
            status={membershipBadge.status}
            label={membershipBadge.label}
          />
        }
      />

      <p className="fj-body-sm">
        <Link href="/internal/affiliates/directory">Back to directory</Link>
      </p>

      <AppSection title="At a glance">
        <dl className="fj-detail-grid">
          <div>
            <dt className="fj-admin-table__secondary">Display name</dt>
            <dd>{detail.displayName ?? "—"}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Country</dt>
            <dd>{detail.country ?? "—"}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Fraud</dt>
            <dd>{detail.fraudState}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Tax</dt>
            <dd>{detail.taxState}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Payout eligibility</dt>
            <dd>{detail.payoutEligibilityState}</dd>
          </div>
          <div>
            <dt className="fj-admin-table__secondary">Website</dt>
            <dd>{detail.websiteUrl ?? "—"}</dd>
          </div>
        </dl>
      </AppSection>

      <AppSection title="Earnings">
        <div className="fj-affiliate__stats">
          <Stat label="Holding" value={formatUsd(detail.earnings.holdingCents)} />
          <Stat label="Payable" value={formatUsd(detail.earnings.payableCents)} />
          <Stat label="Paid" value={formatUsd(detail.earnings.paidCents)} />
          <Stat label="Balance" value={formatUsd(detail.earnings.balanceCents)} />
        </div>
        <p className="fj-body-sm">
          {detail.clickCount} clicks · {detail.conversionCount} conversions
        </p>
      </AppSection>

      {detail.openFlags.length > 0 ? (
        <AppSection title="Open fraud flags">
          <ul className="fj-affiliate__linklist">
            {detail.openFlags.map((f) => (
              <li key={f.id} className="fj-affiliate__linkrow">
                <span className="fj-affiliate__linkcode">
                  {f.flagType} · {f.severity}
                </span>
                <span className="fj-affiliate__linkdest">
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </AppSection>
      ) : null}

      <AppSection title="Membership">
        <MembershipControls
          affiliateId={detail.id}
          current={detail.membershipState}
        />
      </AppSection>

      <AppSection
        title="Fraud review"
        description="Clear, hold, suspend, terminate, or reverse unpaid commissions."
      >
        <FraudReviewPanel affiliateId={detail.id} />
      </AppSection>

      <AppSection
        title="Commission adjustment"
        description="Signed dollar amount. Writes an immutable ledger entry."
      >
        <AdjustmentPanel affiliateId={detail.id} />
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
