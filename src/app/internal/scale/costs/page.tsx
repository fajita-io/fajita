import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
const costs = [
  { channel: "paid_search", source: "ad_provider_import", amount: 420, date: "2026-04-10", verified: true, method: "direct" },
  { channel: "blog", source: "content_allocation", amount: 1200, date: "2026-06-01", verified: false, method: "allocation" },
];

export const metadata: Metadata = {
  title: "Channel costs",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Channel costs" },
        ]}
      />
      <OpsPageHeader
        title={"Channel costs"}
        deck={"Manual and imported spend with verification. Do not infer spend from impressions."}
      />
      <ScaleSubnav current={"/internal/scale/costs"} />

      <OpsPanel title="Cost records (fixtures)">
        <table className="fj-ops-table">
          <thead><tr><th>Channel</th><th>Source</th><th>Amount</th><th>Date</th><th>Verified</th><th>Allocation</th></tr></thead>
          <tbody>
            {costs.map((c, i) => (
              <tr key={i}><td>{c.channel}</td><td>{c.source}</td><td>{`$${c.amount}`}</td><td>{c.date}</td><td>{c.verified ? "Yes" : "No"}</td><td>{c.method}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Rules">
        <ul>
          <li>No payment-card data stored</li>
          <li>Store original currency when multi-currency appears</li>
          <li>Do not silently convert historical rows with current rates</li>
        </ul>
      </OpsPanel>

    </>
  );
}
