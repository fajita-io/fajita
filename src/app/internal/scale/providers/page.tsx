import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { PROVIDER_CAPACITY } from "@/lib/scale";

export const metadata: Metadata = {
  title: "Provider capacity",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Provider capacity" },
        ]}
      />
      <OpsPageHeader
        title={"Provider capacity"}
        deck={"Do not discover a provider limit during a major launch."}
      />
      <ScaleSubnav current={"/internal/scale/providers"} />

      <OpsPanel title="Providers">
        <table className="fj-ops-table">
          <thead><tr><th>Provider</th><th>Tier</th><th>Hard limit</th><th>Usage</th><th>Lead time</th><th>Owner</th></tr></thead>
          <tbody>
            {PROVIDER_CAPACITY.map((p) => (
              <tr key={p.providerKey}>
                <td>{p.providerKey}</td><td>{p.tier}</td><td>{p.hardLimit}</td>
                <td>{p.currentUsage}</td><td>{p.upgradeLeadTimeHours}h</td><td>{p.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

    </>
  );
}
