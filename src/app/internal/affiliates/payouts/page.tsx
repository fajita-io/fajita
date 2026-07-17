import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, AppSection } from "@/components/app/ui";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { PayoutGenerate } from "@/components/affiliate/payout-admin";
import { listPayoutBatches } from "@/lib/affiliates/payouts";

export const metadata: Metadata = {
  title: "Affiliate payouts",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<
  string,
  { status: "operational" | "verifying" | "maintenance" | "down" | "paused"; label: string }
> = {
  draft: { status: "paused", label: "Draft" },
  review: { status: "verifying", label: "Review" },
  approved: { status: "verifying", label: "Approved" },
  processing: { status: "verifying", label: "Processing" },
  partially_completed: { status: "maintenance", label: "Partial" },
  completed: { status: "operational", label: "Completed" },
  failed: { status: "down", label: "Failed" },
  canceled: { status: "down", label: "Canceled" },
};

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AffiliatePayoutsAdminPage() {
  const batches = await listPayoutBatches();

  return (
    <>
      <PageHeader
        title="Affiliate payouts"
        description="Generate, review, and process payout batches. Processing moves money."
      />

      <AppSection
        title="New batch"
        description="Reserves cleared commission and lists who is ready to be paid."
      >
        <PayoutGenerate />
      </AppSection>

      <AppSection title="Batches">
        {batches.length === 0 ? (
          <p className="fj-body-sm">No payout batches yet.</p>
        ) : (
          <div className="fj-admin-table" role="table">
            <div className="fj-admin-table__head" role="row">
              <span role="columnheader">Period</span>
              <span role="columnheader">Affiliates</span>
              <span role="columnheader">Total</span>
              <span role="columnheader">Status</span>
            </div>
            {batches.map((b) => {
              const badge = STATUS_BADGE[b.status] ?? {
                status: "paused" as const,
                label: b.status,
              };
              return (
                <Link
                  key={b.id}
                  href={`/internal/affiliates/payouts/${b.id}`}
                  className="fj-admin-table__row"
                  role="row"
                >
                  <span role="cell">
                    <span className="fj-admin-table__primary">
                      {b.periodLabel}
                    </span>
                    <span className="fj-admin-table__secondary">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {b.affiliateCount}
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {formatUsd(b.totalAmountCents)}
                  </span>
                  <span role="cell">
                    <StatusBadge status={badge.status} label={badge.label} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </AppSection>
    </>
  );
}
