import type { Metadata } from "next";
import { revalidatePath } from "next/cache";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { requirePlatformPermission } from "@/lib/platform/access";
import {
  generateReport,
  listReports,
  type ReportType,
} from "@/lib/platform/reports/generate";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function generateAction(formData: FormData) {
  "use server";
  const type = String(formData.get("type") ?? "daily_brief") as ReportType;
  const access = await requirePlatformPermission("platform.reports.generate");
  await generateReport({
    reportType: type,
    actorUserId: access.profile.id,
    preset: type === "monthly_review" ? "current_month" : "last_7_days",
  });
  revalidatePath("/internal/reports");
}

export default async function ReportsPage() {
  const reports = await listReports();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Reports" },
        ]}
      />
      <OpsPageHeader
        title="Reports"
        deck="Deterministic templates with operator notes. No AI-generated interpretations in this phase."
      />

      <OpsPanel title="Generate">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              ["daily_brief", "Daily brief"],
              ["weekly_review", "Weekly review"],
              ["monthly_review", "Monthly review"],
              ["revenue", "Revenue"],
              ["security", "Security"],
              ["acquisition_diligence", "Acquisition diligence"],
            ] as const
          ).map(([type, label]) => (
            <form key={type} action={generateAction}>
              <input type="hidden" name="type" value={type} />
              <button type="submit" className="fj-ops-btn fj-ops-btn--primary">
                {label}
              </button>
            </form>
          ))}
        </div>
      </OpsPanel>

      <OpsPanel title="Recent reports">
        {reports.length === 0 ? (
          <OpsEmpty>No reports generated yet.</OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>State</th>
                <th>Period</th>
                <th>Created</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {(reports as Array<{
                id: string;
                report_type: string;
                state: string;
                period_start: string;
                period_end: string;
                created_at: string;
                expires_at: string | null;
              }>).map((r) => (
                <tr key={r.id}>
                  <td>{r.report_type}</td>
                  <td>{r.state}</td>
                  <td>
                    {r.period_start.slice(0, 10)} → {r.period_end.slice(0, 10)}
                  </td>
                  <td>{r.created_at.slice(0, 16)}</td>
                  <td>{r.expires_at?.slice(0, 10) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>
    </>
  );
}
