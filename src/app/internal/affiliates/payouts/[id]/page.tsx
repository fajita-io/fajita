import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader, AppSection } from "@/components/app/ui";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import {
  ManualSettle,
  PayoutBatchActions,
} from "@/components/affiliate/payout-admin";
import { getPayoutBatchDetail } from "@/lib/affiliates/payouts";

export const metadata: Metadata = {
  title: "Payout batch",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ITEM_BADGE: Record<
  string,
  { status: "operational" | "verifying" | "maintenance" | "down" | "paused"; label: string }
> = {
  ready: { status: "verifying", label: "Ready" },
  scheduled: { status: "verifying", label: "Scheduled" },
  processing: { status: "verifying", label: "Processing" },
  paid: { status: "operational", label: "Paid" },
  failed: { status: "down", label: "Failed" },
  returned: { status: "down", label: "Returned" },
  held: { status: "maintenance", label: "Held" },
  below_threshold: { status: "paused", label: "Below minimum" },
  payout_setup_required: { status: "maintenance", label: "Setup needed" },
  tax_information_required: { status: "maintenance", label: "Tax needed" },
  not_eligible: { status: "paused", label: "Not eligible" },
  canceled: { status: "down", label: "Canceled" },
};

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function PayoutBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await getPayoutBatchDetail(id);
  if (!batch) notFound();

  return (
    <>
      <PageHeader
        title={`Batch ${batch.periodLabel}`}
        description={`${batch.affiliateCount} affiliates, ${formatUsd(batch.totalAmountCents)} ready.`}
        actions={<PayoutBatchActions batchId={batch.id} status={batch.status} />}
      />

      <p className="fj-body-sm">
        <Link href="/internal/affiliates/payouts">Back to payouts</Link>
      </p>

      <AppSection title="Items">
        {batch.items.length === 0 ? (
          <p className="fj-body-sm">This batch has no items.</p>
        ) : (
          <div className="fj-admin-table" role="table">
            <div className="fj-admin-table__head" role="row">
              <span role="columnheader">Affiliate</span>
              <span role="columnheader">Payable</span>
              <span role="columnheader">Net</span>
              <span role="columnheader">Status</span>
            </div>
            {batch.items.map((item) => {
              const badge = ITEM_BADGE[item.status] ?? {
                status: "paused" as const,
                label: item.status,
              };
              return (
                <div key={item.id} className="fj-admin-table__row" role="row">
                  <span role="cell" className="fj-admin-table__primary">
                    {item.anonRef}
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {formatUsd(item.grossPayableCents)}
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {formatUsd(item.netPayoutCents)}
                  </span>
                  <span role="cell">
                    <StatusBadge status={badge.status} label={badge.label} />
                    {item.status === "scheduled" ? (
                      <ManualSettle itemId={item.id} />
                    ) : null}
                    {item.failureReason ? (
                      <span className="fj-admin-table__secondary">
                        {item.failureReason}
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </AppSection>
    </>
  );
}
