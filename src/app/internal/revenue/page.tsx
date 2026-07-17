import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsLinkButton,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { formatUsdCents } from "@/lib/billing/mrr";
import { parseRangeFromSearchParams } from "@/lib/platform/dates";
import { loadRevenueDashboard } from "@/lib/platform/revenue/dashboard";

export const metadata: Metadata = {
  title: "Revenue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { range } = parseRangeFromSearchParams(sp);
  const data = await loadRevenueDashboard(range);

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Revenue" },
        ]}
      />
      <OpsPageHeader
        title="Revenue"
        deck="MRR and ARR are recurring. Collected cash is separate. None of these figures are profit."
        actions={
          <>
            <OpsLinkButton href="/internal/revenue/subscriptions">Subscriptions</OpsLinkButton>
            <OpsLinkButton href="/internal/revenue/recovery">Recovery</OpsLinkButton>
            <OpsLinkButton href="/internal/revenue/reconciliation">Reconcile</OpsLinkButton>
          </>
        }
      />

      <p className="fj-ops-page-deck fj-ops-page-deck--meta">
        {data.rangeLabel}
      </p>

      <OpsPanel title="Recurring">
        <div className="fj-ops-grid">
          <OpsMetricCard
            label="MRR"
            value={data.completeness === "unavailable" ? null : formatUsdCents(data.mrrCents)}
            completeness={data.completeness}
            meta="recurring · def v1"
          />
          <OpsMetricCard
            label="ARR"
            value={data.completeness === "unavailable" ? null : formatUsdCents(data.arrCents)}
            completeness={data.completeness}
            meta="recurring · def v1"
          />
          <OpsMetricCard
            label="Paying orgs"
            value={data.completeness === "unavailable" ? null : data.payingOrganizations}
            completeness={data.completeness}
          />
          <OpsMetricCard
            label="ARPA"
            value={data.completeness === "unavailable" ? null : formatUsdCents(data.arpaCents)}
            completeness={data.completeness}
            meta="recurring"
          />
        </div>
      </OpsPanel>

      <OpsPanel title="MRR movement (ledger)">
        <div className="fj-ops-grid">
          <OpsMetricCard
            label="New"
            value={
              data.movementCompleteness === "unavailable"
                ? null
                : formatUsdCents(data.newMrrCents)
            }
            completeness={data.movementCompleteness}
          />
          <OpsMetricCard
            label="Expansion"
            value={
              data.movementCompleteness === "unavailable"
                ? null
                : formatUsdCents(data.expansionMrrCents)
            }
            completeness={data.movementCompleteness}
          />
          <OpsMetricCard
            label="Contraction"
            value={
              data.movementCompleteness === "unavailable"
                ? null
                : formatUsdCents(data.contractionMrrCents)
            }
            completeness={data.movementCompleteness}
          />
          <OpsMetricCard
            label="Churned"
            value={
              data.movementCompleteness === "unavailable"
                ? null
                : formatUsdCents(data.churnedMrrCents)
            }
            completeness={data.movementCompleteness}
          />
          <OpsMetricCard
            label="Reactivation"
            value={
              data.movementCompleteness === "unavailable"
                ? null
                : formatUsdCents(data.reactivationMrrCents)
            }
            completeness={data.movementCompleteness}
          />
        </div>
        {data.movementCompleteness === "partial" ? (
          <p className="fj-ops-empty">
            Movement ledger is empty for this range. Totals still come from live subscriptions.
          </p>
        ) : null}
      </OpsPanel>

      <OpsPanel title="Attention">
        <div className="fj-ops-grid">
          <OpsMetricCard
            label="Payment recovery"
            value={data.recoveryOpen}
            completeness={data.completeness}
          />
          <OpsMetricCard
            label="Cancel scheduled"
            value={data.cancelScheduled}
            completeness={data.completeness}
          />
          <OpsMetricCard
            label="Monthly / annual"
            value={`${data.monthlyCount} / ${data.annualCount}`}
            completeness={data.completeness}
          />
        </div>
      </OpsPanel>
    </>
  );
}
