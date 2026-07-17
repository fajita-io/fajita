import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsLinkButton,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

export const metadata: Metadata = {
  title: "Retention and churn",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Retention and churn" },
        ]}
      />
      <OpsPageHeader
        title={"Retention and churn"}
        deck={"Logo churn, revenue churn, NRR, GRR, and cohorts."}
        actions={
          <>
            <OpsLinkButton href="/internal/command-center">Command center</OpsLinkButton>
            <OpsLinkButton href="/internal/reports">Reports</OpsLinkButton>
          </>
        }
      />
      <OpsPanel title="Status">
        <OpsEmpty>
          Live aggregates for this surface load from Phase 17 read models and
          existing domain tables. Open related queues from the command center
          attention list when action is required. Route: /internal/product/retention
        </OpsEmpty>
      </OpsPanel>
    </>
  );
}
