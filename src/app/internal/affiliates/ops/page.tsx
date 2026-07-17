import type { Metadata } from "next";

import { PageHeader, AppSection } from "@/components/app/ui";
import { ReconciliationControls } from "@/components/affiliate/affiliate-ops-panels";
import { listRecentReconciliationRuns } from "@/lib/affiliates/reconciliation";

export const metadata: Metadata = {
  title: "Affiliate operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AffiliateOpsPage() {
  const runs = await listRecentReconciliationRuns();

  return (
    <>
      <PageHeader
        title="Reconciliation"
        description="Compare ledger balances, release stranded payout reservations, and unlock orphan attributions."
      />

      <AppSection
        title="Run"
        description="Dry-runs report only. Live repair requires step-up authentication."
      >
        <ReconciliationControls />
      </AppSection>

      <AppSection title="Recent runs">
        {runs.length === 0 ? (
          <p className="fj-body-sm">No reconciliation runs yet.</p>
        ) : (
          <div className="fj-admin-table" role="table">
            <div className="fj-admin-table__head" role="row">
              <span role="columnheader">Kind</span>
              <span role="columnheader">Checked</span>
              <span role="columnheader">Found / repaired</span>
              <span role="columnheader">When</span>
            </div>
            {runs.map((r) => (
              <div key={r.id} className="fj-admin-table__row" role="row">
                <span role="cell" className="fj-admin-table__primary">
                  {r.kind}
                  {r.dryRun ? " · dry" : " · live"}
                </span>
                <span role="cell" className="fj-admin-table__secondary">
                  {r.checked}
                </span>
                <span role="cell" className="fj-admin-table__secondary">
                  {r.differencesFound} / {r.differencesRepaired}
                </span>
                <span role="cell" className="fj-admin-table__secondary">
                  {new Date(r.startedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </AppSection>
    </>
  );
}
