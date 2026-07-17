import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { FIXTURE_PARTNERS, PARTNER_DUE_DILIGENCE_CHECKLIST, AGENCY_BOUNDARIES, NATIVE_INTEGRATION_GATE, LIFETIME_DEAL_DECISION } from "@/lib/scale";


export const metadata: Metadata = {
  title: "Partnerships",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Partnerships" },
        ]}
      />
      <OpsPageHeader
        title={"Partnerships"}
        deck={"No logo-only partnerships. No customer list sharing. No hidden reseller access."}
      />
      <ScaleSubnav current={"/internal/scale/partners"} />

      <OpsPanel title="Partner registry">
        <table className="fj-ops-table">
          <thead><tr><th>Name</th><th>Model</th><th>Status</th><th>Data sharing</th><th>Exit</th></tr></thead>
          <tbody>
            {FIXTURE_PARTNERS.map((p) => (
              <tr key={p.id}><td>{p.name}</td><td>{p.model}</td><td>{p.status}</td><td>{p.dataSharing}</td><td>{p.exitProcess}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="Due diligence"><ul>{PARTNER_DUE_DILIGENCE_CHECKLIST.map((i) => <li key={i}>{i}</li>)}</ul></OpsPanel>
      <OpsPanel title="Agency boundaries"><ul>{AGENCY_BOUNDARIES.map((i) => <li key={i}>{i}</li>)}</ul></OpsPanel>
      <OpsPanel title="Native integration gate"><ul>{NATIVE_INTEGRATION_GATE.map((i) => <li key={i}>{i}</li>)}</ul></OpsPanel>
      <OpsPanel title="Lifetime deal">
        <p><strong>{LIFETIME_DEAL_DECISION.decision}</strong></p>
        <ul>{LIFETIME_DEAL_DECISION.rationale.map((r) => <li key={r}>{r}</li>)}</ul>
      </OpsPanel>

    </>
  );
}
