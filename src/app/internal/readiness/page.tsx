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
import {
  classificationLabel,
  computeClassification,
  LAUNCH_BLOCKERS,
  openCriticalBlockers,
  openHighBlockers,
  READINESS_GATES,
  scorecardSummary,
  type GateStatus,
  type ReadinessDomain,
} from "@/lib/platform/readiness";

export const metadata: Metadata = {
  title: "Production readiness",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DOMAINS: ReadinessDomain[] = [
  "security",
  "privacy",
  "legal",
  "billing",
  "reliability",
  "performance",
  "accessibility",
  "operations",
  "launch",
  "transfer",
  "product",
];

function statusTone(status: GateStatus): string {
  return status.replaceAll("_", " ");
}

export default function ReadinessPage() {
  const classification = computeClassification();
  const summary = scorecardSummary();
  const critical = openCriticalBlockers();
  const high = openHighBlockers();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Readiness" },
        ]}
      />
      <OpsPageHeader
        title="Production readiness"
        deck="Evidence-backed Gate 6 scorecard. Not a percentage that hides critical failures."
        actions={
          <>
            <OpsLinkButton href="/internal/launch" primary>
              Launch control
            </OpsLinkButton>
            <OpsLinkButton href="/internal/security">Security</OpsLinkButton>
            <OpsLinkButton href="/internal/readiness/security">
              Domains
            </OpsLinkButton>
          </>
        }
      />

      <div className="fj-ops-grid">
        <OpsMetricCard
          label="Classification"
          value={classificationLabel(classification)}
          completeness="complete"
          meta="computeClassification()"
        />
        <OpsMetricCard
          label="Critical blockers open"
          value={critical.length}
          completeness="complete"
        />
        <OpsMetricCard
          label="High blockers open"
          value={high.length}
          completeness="complete"
        />
        <OpsMetricCard
          label="Critical gates blocking"
          value={summary.criticalBlockingCount}
          completeness="complete"
        />
      </div>

      <OpsPanel title="Go-live decision">
        <p>
          <OpsStatus state={classification === "not_ready" ? "degraded" : "operational"} />{" "}
          <strong>{classificationLabel(classification)}</strong>. Public production
          launch is not approved. Stage 0 founder-only verification may proceed for
          non-customer traffic while blockers remain open.
        </p>
        <p className="fj-ops-empty">
          Registry date 2026-07-17. Docs export under docs/readiness/ and
          docs/handoff/phase-18-handoff.md.
        </p>
      </OpsPanel>

      <OpsPanel title="Open critical blockers">
        {critical.length === 0 ? (
          <p className="fj-ops-empty">None.</p>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Domain</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {critical.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href="/internal/readiness/launch">{b.id}</Link>
                  </td>
                  <td>{b.title}</td>
                  <td>{b.domain}</td>
                  <td>{b.owner}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>

      <OpsPanel title="Domains">
        <ul className="fj-ops-list">
          {DOMAINS.map((domain) => {
            const count = READINESS_GATES.filter((g) => g.domain === domain).length;
            if (count === 0) return null;
            return (
              <li key={domain}>
                <Link href={`/internal/readiness/${domain}`}>{domain}</Link>
                {" · "}
                {count} gates
              </li>
            );
          })}
        </ul>
      </OpsPanel>

      <OpsPanel title="All gates">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Gate</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Blocking</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {READINESS_GATES.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.title}</td>
                <td>{g.severity}</td>
                <td>{statusTone(g.status)}</td>
                <td>{g.blocking ? "yes" : "no"}</td>
                <td style={{ maxWidth: 320, fontSize: 12 }}>{g.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Blocker register">
        <p className="fj-ops-empty">
          {LAUNCH_BLOCKERS.length} registered blockers. Full register:{" "}
          <Link href="/internal/readiness/launch">launch domain</Link> and
          docs/readiness/launch-blocker-register.md
        </p>
      </OpsPanel>
    </>
  );
}
