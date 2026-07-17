import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import {
  PostLaunchBlockedBanner,
  PostLaunchLinkedBlockers,
  PostLaunchPrerequisiteTable,
} from "@/components/platform/post-launch-blocked";
import { loadPostLaunchOverview } from "@/lib/platform/post-launch";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function PostLaunchOverviewPage() {
  const data = loadPostLaunchOverview();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { href: "/internal/post-launch/overview", label: "Post-launch" },
          { label: "Overview" },
        ]}
      />
      <OpsPageHeader
        title="Post-launch overview"
        deck="Stabilize first. Learn from real behavior. Improve one measurable constraint at a time."
      />

      <PostLaunchBlockedBanner
        result={data.authorization}
        window={data.stabilization}
      />

      <div className="fj-ops-grid" style={{ marginTop: 16 }}>
        <OpsMetricCard
          label="Authorization"
          value={data.authorization.authorizationLabel}
          completeness="complete"
        />
        <OpsMetricCard
          label="Stabilization"
          value={data.stabilization.phase}
          completeness="complete"
          meta={data.stabilization.phaseLabel}
        />
        <OpsMetricCard
          label="Data completeness"
          value={data.completeness}
          completeness="partial"
          meta={`Fixture set ${data.fixtureVersion}. Not live revenue.`}
        />
        <OpsMetricCard
          label="Experiments eligible"
          value={data.guards.startExperiment.allowed ? "yes" : "no"}
          completeness="complete"
          meta={data.guards.startExperiment.reason}
        />
      </div>

      <OpsPanel title="Activation funnel (fixture)">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Count</th>
              <th scope="col">Completeness</th>
            </tr>
          </thead>
          <tbody>
            {data.activation.funnel.map((row) => (
              <tr key={row.step}>
                <td>{row.step}</td>
                <td>{row.count}</td>
                <td>{row.completeness}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <div className="fj-ops-two-col">
        <OpsPanel title="Retention (fixture)">
          <div className="fj-ops-grid">
            <OpsMetricCard label="Day 1" value={`${Math.round(data.retention.day1 * 100)}%`} completeness="partial" />
            <OpsMetricCard label="Day 7" value={`${Math.round(data.retention.day7 * 100)}%`} completeness="partial" />
            <OpsMetricCard label="Day 14" value={`${Math.round(data.retention.day14 * 100)}%`} completeness="partial" />
            <OpsMetricCard label="Day 30" value={`${Math.round(data.retention.day30 * 100)}%`} completeness="partial" />
          </div>
        </OpsPanel>
        <OpsPanel title="Current decisions">
          <ul>
            <li>Active experiments: {data.decisions.activeExperiments}</li>
            <li>Awaiting approval: {data.decisions.awaitingApproval}</li>
            <li>High-severity bugs: {data.decisions.highSeverityBugs}</li>
            <li>Top friction: {data.decisions.topFriction}</li>
          </ul>
        </OpsPanel>
      </div>

      <OpsPanel title="Bugs (fixture)">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Title</th>
              <th scope="col">Severity</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.bugs.map((b) => (
              <tr key={b.id}>
                <td>
                  <code>{b.id}</code>
                </td>
                <td>{b.title}</td>
                <td>{b.severity}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Feature requests (fixture)">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Capability</th>
              <th scope="col">Status</th>
              <th scope="col">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {data.requests.map((r) => (
              <tr key={r.id}>
                <td>
                  <code>{r.id}</code>
                </td>
                <td>{r.capability}</td>
                <td>{r.status}</td>
                <td>{r.frequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Experiments (fixture)">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Status</th>
              <th scope="col">Risk</th>
            </tr>
          </thead>
          <tbody>
            {data.experiments.map((e) => (
              <tr key={e.id}>
                <td>
                  <code>{e.id}</code>
                </td>
                <td>{e.name}</td>
                <td>{e.status}</td>
                <td>{e.riskClass}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="fj-ops-empty" style={{ marginTop: 12 }}>
          Start remains server-guarded. Stabilization freeze blocks launches in
          intensive_72h.
        </p>
      </OpsPanel>

      <PostLaunchPrerequisiteTable result={data.authorization} />
      <PostLaunchLinkedBlockers result={data.authorization} />
    </>
  );
}
