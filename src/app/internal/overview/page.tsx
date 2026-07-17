import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsLinkButton,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { loadCommandCenter } from "@/lib/platform/command-center/load";
import { parseRangeFromSearchParams } from "@/lib/platform/dates";
import { listMetricDefinitions } from "@/lib/platform/metrics/definitions";

export const metadata: Metadata = {
  title: "Executive overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { range } = parseRangeFromSearchParams(sp);
  const data = await loadCommandCenter(range);
  const defs = listMetricDefinitions();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Executive overview" },
        ]}
      />
      <OpsPageHeader
        title="Executive overview"
        deck="Scorecard strip across growth, revenue, retention, product, and operations. Definitions are versioned."
        actions={
          <OpsLinkButton href="/internal/command-center" primary>
            Command center
          </OpsLinkButton>
        }
      />

      <OpsPanel title="Scorecard">
        <div className="fj-ops-grid">
          {[...data.business, ...data.customers, ...data.product].map((m) => (
            <OpsMetricCard
              key={m.key}
              label={m.label}
              value={m.value}
              completeness={m.completeness}
              meta={m.basis ?? m.source}
            />
          ))}
        </div>
      </OpsPanel>

      <OpsPanel title="Metric registry">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th>Category</th>
              <th>Basis</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {defs.map((d) => (
              <tr key={d.metricKey}>
                <td>{d.metricKey}</td>
                <td>{d.name}</td>
                <td>{d.category}</td>
                <td>{d.basis ?? "—"}</td>
                <td>{d.calculationVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
    </>
  );
}
