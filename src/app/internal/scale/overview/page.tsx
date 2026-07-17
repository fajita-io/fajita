import type { Metadata } from "next";
import Link from "next/link";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { formatUsdCents } from "@/lib/billing/mrr";
import { loadScaleOverview } from "@/lib/scale";

export const metadata: Metadata = {
  title: "Scale command center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ScaleOverviewPage() {
  const data = loadScaleOverview();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Overview" },
        ]}
      />
      <OpsPageHeader
        title="Scale command center"
        deck="Retained growth with service-health context. Revenue without reliability is not progress."
      />
      <ScaleSubnav current="/internal/scale/overview" />

      <OpsPanel title="Scale state">
        <div className="fj-ops-grid">
          <OpsMetricCard
            label="Stage"
            value={`Stage ${data.stage.stage}`}
            completeness="complete"
            meta={data.stage.name}
          />
          <OpsMetricCard
            label="Gate"
            value={data.gateLabel}
            completeness="complete"
          />
          <OpsMetricCard
            label="Stage start"
            value={data.stage.startedAt.slice(0, 10)}
            completeness="complete"
            meta={`Owner: ${data.stage.owner}`}
          />
          <OpsMetricCard
            label="Active campaigns"
            value={data.campaigns.active.length}
            completeness="complete"
          />
        </div>
        {data.stage.advanceBlockedReason ? (
          <div className="fj-ops-stack">
            <p className="fj-ops-empty">{data.stage.advanceBlockedReason}</p>
          </div>
        ) : null}
      </OpsPanel>

      <OpsPanel title="Retained growth (live)">
        <div className="fj-ops-grid">
          <OpsMetricCard
            label="New MRR"
            value={
              data.retainedGrowth.meta.completeness === "unavailable"
                ? null
                : formatUsdCents(data.retainedGrowth.newMrrCents)
            }
            completeness={data.retainedGrowth.meta.completeness}
            meta={data.retainedGrowth.meta.calculationVersion}
          />
          <OpsMetricCard
            label="Activated new MRR"
            value={null}
            completeness="unavailable"
            meta="Await live cohorts"
          />
          <OpsMetricCard
            label="Day-7 retained new MRR"
            value={null}
            completeness="unavailable"
          />
          <OpsMetricCard
            label="Day-30 retained new MRR"
            value={null}
            completeness="unavailable"
            meta="Immature until product age permits"
          />
        </div>
      </OpsPanel>

      <OpsPanel title="Channel quality (fixture education)">
        <div className="fj-ops-stack">
        <p className="fj-ops-empty">
          Live channel economics unavailable until Stage 1 cohorts exist. Fixture scorecards below are labeled and never treated as production truth.
        </p>
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>State</th>
              <th>Activated</th>
              <th>Day 7</th>
              <th>Activated CAC</th>
              <th>Retained CAC</th>
              <th>Support</th>
            </tr>
          </thead>
          <tbody>
            {data.channels.scorecards.map((s) => (
              <tr key={s.channel.key}>
                <td>{s.channel.name}</td>
                <td>{s.channel.state}</td>
                <td>{s.activatedOrganizations}</td>
                <td>{s.day7Retained}</td>
                <td>
                  {s.activatedCacCents == null
                    ? "—"
                    : formatUsdCents(s.activatedCacCents)}
                </td>
                <td>
                  {s.retainedCacCents == null
                    ? "—"
                    : formatUsdCents(s.retainedCacCents)}
                </td>
                <td>{s.supportContacts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </OpsPanel>

      <div className="fj-ops-two-col">
        <OpsPanel title="Platform capacity">
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Level</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {data.capacity.map((c) => (
                <tr key={c.resourceKey}>
                  <td>{c.label}</td>
                  <td>
                    <OpsStatus
                      state={
                        c.level === "normal"
                          ? "operational"
                          : c.level === "warning"
                            ? "degraded"
                            : "major_outage"
                      }
                    />
                  </td>
                  <td>{c.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </OpsPanel>

        <OpsPanel title="Attention">
          <ul>
            {data.attention.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </OpsPanel>
      </div>

      <OpsPanel title="Deep links (existing ops)">
        <div className="fj-ops-chip-row">
          {data.deepLinks.map((l) => (
            <Link key={l.href} href={l.href} className="fj-ops-link-button">
              {l.label}
            </Link>
          ))}
        </div>
      </OpsPanel>
    </>
  );
}
