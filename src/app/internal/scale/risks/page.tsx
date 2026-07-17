import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
const risks = [
  { key: "phase18_not_ready", category: "capacity", title: "Scale blocked by Phase 18 Not Ready", severity: "critical", status: "open", owner: "founder" },
  { key: "phase19_missing", category: "other", title: "Phase 19 stabilization inactive", severity: "critical", status: "open", owner: "founder" },
  { key: "affiliate_concentration", category: "channel_concentration", title: "Potential affiliate concentration once live", severity: "medium", status: "open", owner: "affiliate_operations" },
  { key: "lifetime_deal_pressure", category: "economics", title: "LTD pressure without cost model", severity: "high", status: "accepted", owner: "founder", note: "Default: no LTD" },
];

export const metadata: Metadata = {
  title: "Scale risks",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Scale risks" },
        ]}
      />
      <OpsPageHeader
        title={"Scale risks"}
        deck={"Concentration, fraud, capacity, and accepted risks with owners."}
      />
      <ScaleSubnav current={"/internal/scale/risks"} />

      <OpsPanel title="Risk register">
        <table className="fj-ops-table">
          <thead><tr><th>Key</th><th>Category</th><th>Title</th><th>Severity</th><th>Status</th><th>Owner</th></tr></thead>
          <tbody>
            {risks.map((r) => (
              <tr key={r.key}><td>{r.key}</td><td>{r.category}</td><td>{r.title}</td><td>{r.severity}</td><td>{r.status}</td><td>{r.owner}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

    </>
  );
}
