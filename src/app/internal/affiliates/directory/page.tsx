import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, AppSection } from "@/components/app/ui";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { listAffiliates } from "@/lib/affiliates/admin-directory";

export const metadata: Metadata = {
  title: "Affiliate directory",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MEMBERSHIP_BADGE: Record<
  string,
  { status: "operational" | "verifying" | "maintenance" | "down" | "paused"; label: string }
> = {
  active: { status: "operational", label: "Active" },
  paused: { status: "paused", label: "Paused" },
  suspended: { status: "maintenance", label: "Suspended" },
  terminated: { status: "down", label: "Terminated" },
  closed: { status: "down", label: "Closed" },
};

export default async function AffiliateDirectoryPage() {
  const affiliates = await listAffiliates();

  return (
    <>
      <PageHeader
        title="Affiliate directory"
        description={`${affiliates.length} affiliate${affiliates.length === 1 ? "" : "s"}.`}
      />

      <AppSection title="Affiliates">
        {affiliates.length === 0 ? (
          <p className="fj-body-sm">No affiliates yet.</p>
        ) : (
          <div className="fj-admin-table" role="table">
            <div className="fj-admin-table__head" role="row">
              <span role="columnheader">Code</span>
              <span role="columnheader">Contact</span>
              <span role="columnheader">Membership</span>
              <span role="columnheader">Fraud</span>
            </div>
            {affiliates.map((a) => {
              const badge = MEMBERSHIP_BADGE[a.membershipState] ?? {
                status: "paused" as const,
                label: a.membershipState,
              };
              return (
                <Link
                  key={a.id}
                  href={`/internal/affiliates/directory/${a.id}`}
                  className="fj-admin-table__row"
                  role="row"
                >
                  <span role="cell" className="fj-admin-table__primary">
                    {a.defaultCode ?? a.id.slice(0, 8)}
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {a.contactEmail ?? "—"}
                  </span>
                  <span role="cell">
                    <StatusBadge status={badge.status} label={badge.label} />
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {a.fraudState}
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
