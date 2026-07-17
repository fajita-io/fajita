import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
const opportunities = [
  { org: "Fixture Org (lab)", plan: "starter", signal: "Monitors > 80% limit", action: "in_product_guidance", status: "open" },
];

export const metadata: Metadata = {
  title: "Expansion queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Expansion queue" },
        ]}
      />
      <OpsPageHeader
        title={"Expansion queue"}
        deck={"Usage-based opportunities only. No artificial restrictions to force upgrades."}
      />
      <ScaleSubnav current={"/internal/scale/expansion"} />

      <OpsPanel title="Open opportunities (fixtures)">
        <table className="fj-ops-table">
          <thead><tr><th>Organization</th><th>Plan</th><th>Signal</th><th>Action</th><th>Status</th></tr></thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.org}><td>{o.org}</td><td>{o.plan}</td><td>{o.signal}</td><td>{o.action}</td><td>{o.status}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Rules">
        <ul>
          <li>Do not automatically contact every customer</li>
          <li>Do not block access before documented limits</li>
          <li>Actions: in-product guidance, approved message, human support, or no action</li>
        </ul>
      </OpsPanel>

    </>
  );
}
