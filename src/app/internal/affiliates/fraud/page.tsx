import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, AppSection } from "@/components/app/ui";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { listOpenFraudFlags } from "@/lib/affiliates/fraud";

export const metadata: Metadata = {
  title: "Affiliate fraud review",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SEVERITY_BADGE: Record<
  string,
  { status: "operational" | "verifying" | "maintenance" | "down" | "paused"; label: string }
> = {
  low: { status: "paused", label: "Low" },
  medium: { status: "verifying", label: "Medium" },
  high: { status: "maintenance", label: "High" },
  critical: { status: "down", label: "Critical" },
};

export default async function AffiliateFraudPage() {
  const flags = await listOpenFraudFlags();

  return (
    <>
      <PageHeader
        title="Fraud review"
        description={`${flags.length} open flag${flags.length === 1 ? "" : "s"}. Resolve from the affiliate detail.`}
      />

      <AppSection title="Open flags">
        {flags.length === 0 ? (
          <p className="fj-body-sm">No open fraud flags.</p>
        ) : (
          <div className="fj-admin-table" role="table">
            <div className="fj-admin-table__head" role="row">
              <span role="columnheader">Affiliate</span>
              <span role="columnheader">Flag</span>
              <span role="columnheader">Severity</span>
              <span role="columnheader">Opened</span>
            </div>
            {flags.map((f) => {
              const badge = SEVERITY_BADGE[f.severity] ?? {
                status: "paused" as const,
                label: f.severity,
              };
              return (
                <Link
                  key={f.id}
                  href={`/internal/affiliates/directory/${f.affiliateId}`}
                  className="fj-admin-table__row"
                  role="row"
                >
                  <span role="cell" className="fj-admin-table__primary">
                    {f.defaultCode ?? f.affiliateId.slice(0, 8)}
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {f.flagType}
                  </span>
                  <span role="cell">
                    <StatusBadge status={badge.status} label={badge.label} />
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {new Date(f.createdAt).toLocaleDateString()}
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
