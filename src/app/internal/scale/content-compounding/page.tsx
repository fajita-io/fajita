import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { CONTENT_INVESTMENT_SEED, CONTENT_TIER_LABELS, CONTENT_REFRESH_TRIGGERS, CLUSTER_EXPANSION_RULES } from "@/lib/scale";


export const metadata: Metadata = {
  title: "Content compounding",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Content compounding" },
        ]}
      />
      <OpsPageHeader
        title={"Content compounding"}
        deck={"Do not scale article count without retained-customer evidence."}
      />
      <ScaleSubnav current={"/internal/scale/content-compounding"} />

      <OpsPanel title="Investment tiers">
        <table className="fj-ops-table">
          <thead><tr><th>Path</th><th>Tier</th><th>Class</th><th>Review</th><th>Notes</th></tr></thead>
          <tbody>
            {CONTENT_INVESTMENT_SEED.map((c) => (
              <tr key={c.contentKey}>
                <td>{c.path}</td>
                <td>T{c.tier}: {CONTENT_TIER_LABELS[c.tier]}</td>
                <td>{c.classification}</td>
                <td>{c.nextReviewDate}</td>
                <td>{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Refresh triggers">
        <ul>{CONTENT_REFRESH_TRIGGERS.map((t) => <li key={t}>{t}</li>)}</ul>
      </OpsPanel>
      <OpsPanel title="Cluster expansion rules">
        <ul>{CLUSTER_EXPANSION_RULES.map((t) => <li key={t}>{t}</li>)}</ul>
      </OpsPanel>

    </>
  );
}
