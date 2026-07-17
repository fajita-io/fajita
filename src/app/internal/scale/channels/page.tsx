import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { CHANNEL_INVENTORY, buildFixtureScorecards, DEFAULT_CHANNEL_STOP_CONDITIONS } from "@/lib/scale";
import { formatUsdCents } from "@/lib/billing/mrr";

const scorecards = buildFixtureScorecards();


export const metadata: Metadata = {
  title: "Channel quality",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Channel quality" },
        ]}
      />
      <OpsPageHeader
        title={"Channel quality"}
        deck={"Activation, retention, refunds, support burden, and CAC. Low cost never hides poor retention."}
      />
      <ScaleSubnav current={"/internal/scale/channels"} />

      <OpsPanel title="Channel inventory">
        <table className="fj-ops-table">
          <thead><tr><th>Channel</th><th>Type</th><th>State</th><th>Primary metric</th><th>Review</th><th>Reason</th></tr></thead>
          <tbody>
            {CHANNEL_INVENTORY.map((c) => (
              <tr key={c.key}>
                <td>{c.name}</td><td>{c.type}</td><td>{c.state}</td><td>{c.primaryMetric}</td><td>{c.reviewDate}</td><td>{c.decisionReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Fixture scorecards (not live)">
        <table className="fj-ops-table">
          <thead><tr><th>Channel</th><th>Paid</th><th>Activated</th><th>D7</th><th>Refunds</th><th>Support</th><th>Act. CAC</th><th>Ret. CAC</th><th>Payback</th></tr></thead>
          <tbody>
            {scorecards.map((s) => (
              <tr key={s.channel.key}>
                <td>{s.channel.name}</td>
                <td>{s.paidOrganizations}</td>
                <td>{s.activatedOrganizations}</td>
                <td>{s.day7Retained}</td>
                <td>{formatUsdCents(s.refundsCents)}</td>
                <td>{s.supportContacts}</td>
                <td>{s.activatedCacCents == null ? "—" : formatUsdCents(s.activatedCacCents)}</td>
                <td>{s.retainedCacCents == null ? "—" : formatUsdCents(s.retainedCacCents)}</td>
                <td>{s.paybackMonths == null ? "—" : `${s.paybackMonths} mo (est.)`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Default stop conditions">
        <ul>{DEFAULT_CHANNEL_STOP_CONDITIONS.map((s) => <li key={s}>{s}</li>)}</ul>
      </OpsPanel>

    </>
  );
}
