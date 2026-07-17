import type { Metadata } from "next";
import Link from "next/link";

import {
  OpsBreadcrumbs,
  OpsLinkButton,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { getLaunchCommandCenterModel } from "@/lib/platform/readiness";

export const metadata: Metadata = {
  title: "Launch control",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LaunchPage() {
  const model = getLaunchCommandCenterModel();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Launch" },
        ]}
      />
      <OpsPageHeader
        title="Launch-day command center"
        deck="Staged launch control. Pause and rollback actions route to permissioned ops surfaces. No autonomous production changes."
        actions={
          <>
            <OpsLinkButton href="/internal/readiness" primary>
              Readiness scorecard
            </OpsLinkButton>
            <OpsLinkButton href="/internal/feature-flags">Flags</OpsLinkButton>
            <OpsLinkButton href="/internal/operations">Health</OpsLinkButton>
          </>
        }
      />

      <div className="fj-ops-grid">
        <OpsMetricCard
          label="Launch stage"
          value={model.stage}
          completeness="complete"
        />
        <OpsMetricCard
          label="Classification"
          value={model.classificationLabel}
          completeness="complete"
        />
        <OpsMetricCard
          label="Critical blockers"
          value={model.openCriticalBlockers.length}
          completeness="complete"
        />
        <OpsMetricCard
          label="Billing enforcement"
          value={model.billingEnforcementEnabled ? "on" : "off"}
          completeness="complete"
          meta="BILLING_ENFORCEMENT_ENABLED"
        />
      </div>

      <OpsPanel title="Decision">
        <p>
          <OpsStatus
            state={
              model.classification === "not_ready" ? "degraded" : "operational"
            }
          />{" "}
          <strong>{model.classificationLabel}</strong>. Launch stage remains{" "}
          <code>{model.stage}</code>. Public signup must stay disabled until
          critical blockers close and go-live roles approve.
        </p>
        <ul className="fj-ops-list">
          {model.approval.rationale.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </OpsPanel>

      <OpsPanel title="Stop conditions">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Condition</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {model.stopConditions.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.title}</td>
                <td>{s.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Open blockers">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Severity</th>
              <th>Title</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {model.openBlockers.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.severity}</td>
                <td>{b.title}</td>
                <td>{b.status}</td>
                <td>{b.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Feature-flag launch plan">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>Flag</th>
              <th>Default</th>
              <th>Owner</th>
              <th>Stop metric</th>
            </tr>
          </thead>
          <tbody>
            {model.featureFlags.map((f) => (
              <tr key={f.flag}>
                <td>{f.flag}</td>
                <td>{f.default ? "on" : "off"}</td>
                <td>{f.owner}</td>
                <td>{f.stopMetric}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Permissioned actions">
        <ul className="fj-ops-list">
          {model.actions.map((a) => (
            <li key={a.id}>
              <Link href={a.href}>{a.label}</Link>
              {" · requires "}
              <code>{a.requires}</code>
            </li>
          ))}
        </ul>
        <p className="fj-ops-empty">{model.metricsNote}</p>
      </OpsPanel>
    </>
  );
}
