import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
const weekly = [
  "Scale-stage status", "Product reliability", "New paid organizations", "Activation", "Retention",
  "New retained MRR", "Channel quality", "Affiliate quality", "Referral quality", "Partner pipeline",
  "Content compounding", "Support burden", "Capacity", "Costs", "Experiments", "Risks", "Decisions",
];
const outputs = [
  "Channels to continue", "Channels to pause", "Budgets to maintain", "Capacity actions",
  "Support actions", "Content actions", "Partner actions", "Hiring trigger status",
];

export const metadata: Metadata = {
  title: "Scale reviews",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Scale reviews" },
        ]}
      />
      <OpsPageHeader
        title={"Scale reviews"}
        deck={"Weekly, monthly, and quarterly review templates with required decisions."}
      />
      <ScaleSubnav current={"/internal/scale/reviews"} />

      <OpsPanel title="Weekly scale review sections">
        <ul>{weekly.map((s) => <li key={s}>{s}</li>)}</ul>
      </OpsPanel>
      <OpsPanel title="Required outputs">
        <ul>{outputs.map((s) => <li key={s}>{s}</li>)}</ul>
      </OpsPanel>
      <OpsPanel title="Cadence">
        <ul>
          <li>Weekly: channel, capacity, support</li>
          <li>Biweekly: affiliate quality</li>
          <li>Monthly: partners, content, forecast, providers</li>
          <li>Quarterly: pricing, hiring, vendors, concentration, strategy</li>
        </ul>
      </OpsPanel>

    </>
  );
}
