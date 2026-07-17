import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { CAPACITY_THRESHOLDS, evaluateThreshold, SCALE_STOP_CONTROLS } from "@/lib/scale";


export const metadata: Metadata = {
  title: "Capacity thresholds",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Capacity thresholds" },
        ]}
      />
      <OpsPageHeader
        title={"Capacity thresholds"}
        deck={"Worker, database, storage, and support thresholds with lead times and owners."}
      />
      <ScaleSubnav current={"/internal/scale/capacity"} />

      <OpsPanel title="Thresholds">
        <table className="fj-ops-table">
          <thead><tr><th>Resource</th><th>Warning</th><th>Scale</th><th>Critical</th><th>Level</th><th>Lead time</th><th>Owner</th></tr></thead>
          <tbody>
            {CAPACITY_THRESHOLDS.map((t) => (
              <tr key={t.resourceKey}>
                <td>{t.label}</td>
                <td>{t.warningThreshold}</td>
                <td>{t.scaleThreshold}</td>
                <td>{t.criticalThreshold}</td>
                <td>{evaluateThreshold(t)}</td>
                <td>{t.leadTimeHours}h</td>
                <td>{t.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Scale stop controls">
        <table className="fj-ops-table">
          <thead><tr><th>Control</th><th>Customer impact</th><th>Permission</th></tr></thead>
          <tbody>
            {SCALE_STOP_CONTROLS.map((c) => (
              <tr key={c.control}><td>{c.label}</td><td>{c.customerImpact}</td><td>{c.permission}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

    </>
  );
}
