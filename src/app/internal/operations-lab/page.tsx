import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { formatUsdCents } from "@/lib/billing/mrr";
import { OPS_LAB_FIXTURES } from "@/lib/platform/fixtures";

export const metadata: Metadata = {
  title: "Operations lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Fixture-only demonstrations. Development or platform access via layout.
 * Never loads production customer data.
 */
export default function OperationsLabPage() {
  const f = OPS_LAB_FIXTURES;

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Operations lab" },
        ]}
      />
      <OpsPageHeader
        title="Operations lab"
        deck="Deterministic fixtures for healthy, degraded, and attention states. No production data."
      />

      <OpsPanel title="Command center scenarios">
        <div className="fj-ops-grid">
          <div className="fj-ops-card">
            <div className="fj-ops-card__label">Healthy platform</div>
            <OpsStatus state="operational" />
          </div>
          <div className="fj-ops-card">
            <div className="fj-ops-card__label">Degraded platform</div>
            <OpsStatus state="degraded" />
          </div>
          <div className="fj-ops-card">
            <div className="fj-ops-card__label">Worker offline</div>
            <OpsStatus state="partial_outage" />
          </div>
          <div className="fj-ops-card">
            <div className="fj-ops-card__label">Provider outage</div>
            <OpsStatus state="major_outage" />
          </div>
        </div>
      </OpsPanel>

      <OpsPanel title="Customer fixtures">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Health</th>
              <th>Plan</th>
              <th>MRR</th>
              <th>Fixture id</th>
            </tr>
          </thead>
          <tbody>
            {[
              f.healthyOrganization,
              f.setupStalledOrganization,
              f.atRiskOrganization,
              f.paymentRestrictedOrganization,
            ].map((org) => (
              <tr key={org.id}>
                <td>{org.name}</td>
                <td>{org.health}</td>
                <td>{org.plan}</td>
                <td>{formatUsdCents(org.mrrCents)}</td>
                <td>{org.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <div className="fj-ops-two-col">
        <OpsPanel title="Alert dead letter">
          <OpsMetricCard
            label="Attempts"
            value={f.alertDeadLetter.attempts}
            completeness="complete"
            meta={`${f.alertDeadLetter.channel} · ${f.alertDeadLetter.failureCategory}`}
          />
        </OpsPanel>
        <OpsPanel title="Security event">
          <p>
            <span className="fj-ops-pill fj-ops-pill--high">{f.securityEvent.severity}</span>{" "}
            {f.securityEvent.type} · {f.securityEvent.status}
          </p>
        </OpsPanel>
      </div>

      <OpsPanel title="Approval + cost anomaly">
        <ul className="fj-ops-attention">
          <li style={{ padding: "8px 0" }}>
            Approval {f.approvalRequest.type} · {f.approvalRequest.risk} ·{" "}
            {f.approvalRequest.state}
          </li>
          <li style={{ padding: "8px 0" }}>
            Cost {f.costAnomaly.metric}:{" "}
            {formatUsdCents(f.costAnomaly.baselineCents)} →{" "}
            {formatUsdCents(f.costAnomaly.currentCents)}
          </li>
          <li style={{ padding: "8px 0" }}>
            Offline worker {f.workerOffline.id} in {f.workerOffline.region}
          </li>
          <li style={{ padding: "8px 0" }}>
            Region {f.regionDegraded.region} {f.regionDegraded.state} (
            {(f.regionDegraded.successRate * 100).toFixed(0)}% success)
          </li>
        </ul>
      </OpsPanel>

      <OpsPanel title="Accessibility and responsive checks">
        <p className="fj-ops-empty">
          Use this lab at 1600, 1280, 1024, 768, 430, and 390 widths. Verify reduced
          motion, 200% zoom, keyboard command palette (⌘K), and focus rings. Dark
          ops chrome is the default internal surface.
        </p>
      </OpsPanel>
    </>
  );
}
