import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { HIRING_TRIGGERS, ROLE_SCORECARDS, anyHiringTriggerSatisfied } from "@/lib/scale";


export const metadata: Metadata = {
  title: "Hiring triggers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Hiring triggers" },
        ]}
      />
      <OpsPageHeader
        title={"Hiring triggers"}
        deck={"Hire from evidence and budget, not vanity growth."}
      />
      <ScaleSubnav current={"/internal/scale/hiring"} />

      <OpsPanel title="Triggers">
        <p className="fj-ops-empty">Any trigger ready to hire: {anyHiringTriggerSatisfied() ? "Yes" : "No"}</p>
        <table className="fj-ops-table">
          <thead><tr><th>Category</th><th>Trigger</th><th>Satisfied</th><th>Budget</th><th>Trend</th><th>Review</th></tr></thead>
          <tbody>
            {HIRING_TRIGGERS.map((t) => (
              <tr key={t.triggerKey}>
                <td>{t.category}</td><td>{t.label}</td>
                <td>{t.satisfied ? "Yes" : "No"}</td>
                <td>{t.budgetAvailable ? "Yes" : "No"}</td>
                <td>{t.fourWeekTrend}</td><td>{t.reviewDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Role scorecards">
        <table className="fj-ops-table">
          <thead><tr><th>Role</th><th>Mission</th><th>Budget</th><th>Status</th></tr></thead>
          <tbody>
            {ROLE_SCORECARDS.map((r) => (
              <tr key={r.roleKey}>
                <td>{r.roleKey}</td><td>{r.mission}</td>
                <td>{r.budgetCents == null ? "Missing (blocks hire)" : `$${r.budgetCents / 100}`}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

    </>
  );
}
