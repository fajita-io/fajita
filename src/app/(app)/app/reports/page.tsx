import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import { ReportSettingsPanel } from "@/components/app/reports/report-settings";
import { requireActiveContext } from "@/lib/app/page-context";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { can } from "@/lib/auth/roles";
import { listOrgMembers } from "@/lib/app/organizations";
import {
  getReportSettings,
  listReportRecipients,
  listWeeklyReports,
} from "@/lib/reports/queries";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

function completenessLabel(value: string): string {
  switch (value) {
    case "partial":
      return "Partial data";
    case "delayed":
      return "Delayed data";
    case "unavailable":
      return "Data unavailable";
    default:
      return "Complete";
  }
}

export default async function ReportsPage() {
  const { profile, membership } = await requireActiveContext();
  const org = membership.organization;

  const [enabled, admin] = await Promise.all([
    isFeatureEnabled("reports", org.id),
    isPlatformAdmin(),
  ]);
  if (!enabled && !admin) notFound();

  const canManage = can(membership.role, "org:update");
  const [reports, settings, recipients, members] = await Promise.all([
    listWeeklyReports(org.id),
    getReportSettings(org.id),
    canManage ? listReportRecipients(org.id) : Promise.resolve([]),
    canManage ? listOrgMembers(org.id, profile.id) : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        title="Reports"
        description="One factual reliability report per week, built from the checks Fajita actually ran. No estimates, no filler."
      />

      <AppSection
        title="Weekly reliability reports"
        description={
          reports.length > 0
            ? "Each report is a fixed snapshot of its period. Historical reports never change."
            : undefined
        }
      >
        {reports.length === 0 ? (
          <EmptyState
            icon="uptime"
            title="No reports yet"
            description="The first report arrives after your organization completes a full reporting week with at least one active monitor. Reports cover the previous seven complete days."
          />
        ) : (
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Check success</th>
                <th scope="col">Incidents</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <Link
                      className="fj-link-button"
                      href={`/app/reports/weekly/${report.id}`}
                    >
                      {report.periodLabel}
                    </Link>
                  </td>
                  <td className="fj-numeric">
                    {report.successRateLabel ?? "n/a"}
                  </td>
                  <td className="fj-numeric">{report.incidentCount ?? 0}</td>
                  <td>{completenessLabel(report.dataCompleteness)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AppSection>

      {canManage ? (
        <AppSection
          title="Report settings"
          description="Reporting period and email recipients for this organization."
        >
          <ReportSettingsPanel
            organizationId={org.id}
            initialEnabled={settings.enabled}
            initialWeekStart={settings.weekStart}
            recipients={recipients.map((r) => ({
              userId: r.userId,
              displayName: r.displayName,
            }))}
            members={members
              .filter((m) => m.status === "active")
              .map((m) => ({
                userId: m.profileId,
                displayName: m.displayName,
              }))}
            ownerUserId={org.owner_user_id}
          />
        </AppSection>
      ) : null}
    </>
  );
}
