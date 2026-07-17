import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, AppSection } from "@/components/app/ui";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import {
  countPendingApplications,
  listApplications,
} from "@/lib/affiliates/applications";

export const metadata: Metadata = {
  title: "Affiliate operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATE_BADGE: Record<
  string,
  { status: "operational" | "verifying" | "maintenance" | "down" | "paused"; label: string }
> = {
  submitted: { status: "verifying", label: "Submitted" },
  under_review: { status: "verifying", label: "Under review" },
  needs_information: { status: "maintenance", label: "Needs info" },
  waitlisted: { status: "maintenance", label: "Waitlisted" },
  approved: { status: "operational", label: "Approved" },
  rejected: { status: "down", label: "Rejected" },
  blocked: { status: "down", label: "Blocked" },
};

export default async function AffiliateAdminPage() {
  const [pending, applications] = await Promise.all([
    countPendingApplications(),
    listApplications(),
  ]);

  return (
    <>
      <PageHeader
        title="Affiliate operations"
        description={`${pending} application${pending === 1 ? "" : "s"} awaiting review.`}
        actions={
          <div className="fj-payout-setup__actions">
            <BrandButtonLink
              variant="secondary"
              size="sm"
              href="/internal/affiliates/directory"
            >
              Directory
            </BrandButtonLink>
            <BrandButtonLink
              variant="secondary"
              size="sm"
              href="/internal/affiliates/fraud"
            >
              Fraud
            </BrandButtonLink>
            <BrandButtonLink
              variant="secondary"
              size="sm"
              href="/internal/affiliates/payouts"
            >
              Payouts
            </BrandButtonLink>
            <BrandButtonLink
              variant="secondary"
              size="sm"
              href="/internal/affiliates/ops"
            >
              Reconcile
            </BrandButtonLink>
            <BrandButtonLink
              variant="secondary"
              size="sm"
              href="/internal/affiliate-lab"
            >
              Lab
            </BrandButtonLink>
          </div>
        }
      />

      <AppSection title="Applications">
        {applications.length === 0 ? (
          <p className="fj-body-sm">No applications yet.</p>
        ) : (
          <div className="fj-admin-table" role="table">
            <div className="fj-admin-table__head" role="row">
              <span role="columnheader">Applicant</span>
              <span role="columnheader">Methods</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Submitted</span>
            </div>
            {applications.map((app) => {
              const badge = STATE_BADGE[app.state] ?? {
                status: "paused" as const,
                label: app.state,
              };
              return (
                <Link
                  key={app.id}
                  href={`/internal/affiliates/applications/${app.id}`}
                  className="fj-admin-table__row"
                  role="row"
                >
                  <span role="cell">
                    <span className="fj-admin-table__primary">{app.email}</span>
                    <span className="fj-admin-table__secondary">
                      {app.country ?? "Unknown"}
                      {app.isExistingCustomer ? " · customer" : ""}
                    </span>
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {app.promotionMethods.slice(0, 2).join(", ") || "—"}
                  </span>
                  <span role="cell">
                    <StatusBadge status={badge.status} label={badge.label} />
                  </span>
                  <span role="cell" className="fj-admin-table__secondary">
                    {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleDateString()
                      : "—"}
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
