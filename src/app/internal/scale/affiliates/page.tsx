import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
const tiers = ["Applicant", "New", "Validating", "Proven", "Strategic", "Restricted", "Suspended"];

export const metadata: Metadata = {
  title: "Affiliate scale",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Affiliate scale" },
        ]}
      />
      <OpsPageHeader
        title={"Affiliate scale"}
        deck={"Phase 12 ledger remains authoritative. Scale only affiliates with retained customers and clean disclosures."}
      />
      <ScaleSubnav current={"/internal/scale/affiliates"} />

      <OpsPanel title="Operating tiers (internal classification)">
        <p className="fj-ops-empty">Tiers do not automatically change commissions. Any rate change needs terms, approval, effective date, and affiliate acceptance where required.</p>
        <ul>{tiers.map((t) => <li key={t}>{t}</li>)}</ul>
      </OpsPanel>
      <OpsPanel title="Deep link">
        <p><a href="/internal/affiliates">Open Phase 12 affiliate operations</a></p>
        <p><a href="/internal/affiliates/fraud">Fraud review</a></p>
      </OpsPanel>
      <OpsPanel title="Quality guardrails">
        <ul>
          <li>Misleading claims → review</li>
          <li>Missing disclosure → review</li>
          <li>Self-referral pattern → review</li>
          <li>Refund or chargeback spike → review</li>
          <li>Poor activation or retention → pause recruitment</li>
          <li>Do not terminate from one weak signal</li>
        </ul>
      </OpsPanel>

    </>
  );
}
