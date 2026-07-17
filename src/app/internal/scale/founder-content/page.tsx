import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
const queue = [
  { insight: "Stage 0 means we refuse vanity scale", status: "draft", channel: "build notes", reviewed: false },
];

export const metadata: Metadata = {
  title: "Founder content queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Founder content queue" },
        ]}
      />
      <OpsPageHeader
        title={"Founder content queue"}
        deck={"No automated posting. Public-safe wording only after sensitive-data review."}
      />
      <ScaleSubnav current={"/internal/scale/founder-content"} />

      <OpsPanel title="Queue">
        <table className="fj-ops-table">
          <thead><tr><th>Insight</th><th>Channel</th><th>Sensitive review</th><th>Status</th></tr></thead>
          <tbody>
            {queue.map((q, i) => (
              <tr key={i}><td>{q.insight}</td><td>{q.channel}</td><td>{q.reviewed ? "Yes" : "No"}</td><td>{q.status}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

    </>
  );
}
