import type { Metadata } from "next";
import Link from "next/link";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsLinkButton,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import {
  evaluateScaleReadiness,
  gateStatusLabel,
  SCALE_STAGES,
} from "@/lib/scale";

export const metadata: Metadata = {
  title: "Scale readiness",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ScaleReadinessPage() {
  const readiness = evaluateScaleReadiness();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Readiness" },
        ]}
      />
      <OpsPageHeader
        title="Scale readiness gate"
        deck="Product stability, customer evidence, economics, and operations must clear before traffic increases."
        actions={
          <OpsLinkButton href="/internal/readiness" primary>
            Phase 18 readiness
          </OpsLinkButton>
        }
      />
      <ScaleSubnav current="/internal/scale/readiness" />

      <div className="fj-ops-grid">
        <OpsMetricCard
          label="Gate"
          value={gateStatusLabel(readiness.gateStatus)}
          completeness="complete"
        />
        <OpsMetricCard
          label="Product stable"
          value={readiness.productStable ? "Yes" : "No"}
          completeness="complete"
        />
        <OpsMetricCard
          label="Customer evidence"
          value={readiness.customerEvidenceReady ? "Ready" : "Missing"}
          completeness="complete"
        />
        <OpsMetricCard
          label="Economics"
          value={readiness.economicsReady ? "Ready" : "Missing"}
          completeness="complete"
        />
        <OpsMetricCard
          label="Operations"
          value={readiness.operationsReady ? "Ready" : "Not ready"}
          completeness="complete"
        />
        <OpsMetricCard
          label="Paid traffic increase"
          value={readiness.canIncreasePaidTraffic ? "Allowed" : "Blocked"}
          completeness="complete"
        />
      </div>

      <OpsPanel title="Blocking records">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Domain</th>
              <th>Severity</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {readiness.blockers.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.title}</td>
                <td>{b.domain}</td>
                <td>{b.severity}</td>
                <td>
                  <Link href={b.link.startsWith("http") || b.link.startsWith("/docs") ? "/internal/readiness" : b.link}>
                    {b.link.startsWith("/docs") ? "Handoff docs" : "Open"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Stage entry (blocked until gate clears)">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Name</th>
              <th>Max budget</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>
            {SCALE_STAGES.map((s) => (
              <tr key={s.key}>
                <td>{s.stage}</td>
                <td>{s.name}</td>
                <td>{s.maxBudget}</td>
                <td>{s.approvalRequired ? "Required" : "Default"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Authorization text">
        <div className="fj-ops-stack">
          <p className="fj-ops-empty">{readiness.authorizationSummary}</p>
          <p className="fj-ops-empty">
            Evaluated {new Date(readiness.evaluatedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC ·{" "}
            {readiness.calculationVersion}
          </p>
        </div>
      </OpsPanel>
    </>
  );
}
