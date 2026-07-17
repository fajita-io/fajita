import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
const listings = [
  { platform: "Fixture Directory", status: "researching", owner: "founder", lastReviewed: "—", paid: 0, activated: 0, retained: 0 },
];

export const metadata: Metadata = {
  title: "Marketplace listings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Marketplace listings" },
        ]}
      />
      <OpsPageHeader
        title={"Marketplace listings"}
        deck={"One listing registry. No automated low-quality directory spam."}
      />
      <ScaleSubnav current={"/internal/scale/listings"} />

      <OpsPanel title="Listing registry">
        <table className="fj-ops-table">
          <thead><tr><th>Platform</th><th>Status</th><th>Owner</th><th>Paid</th><th>Activated</th><th>Retained</th></tr></thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.platform}><td>{l.platform}</td><td>{l.status}</td><td>{l.owner}</td><td>{l.paid}</td><td>{l.activated}</td><td>{l.retained}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

    </>
  );
}
