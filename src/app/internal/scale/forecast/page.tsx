import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { defaultScenarioInputs, runScenarioForecast, FORECAST_ASSUMPTIONS } from "@/lib/scale";
import { formatUsdCents } from "@/lib/billing/mrr";

const scenarios = (["conservative", "base", "accelerated"] as const).map((s) =>
  runScenarioForecast(s, defaultScenarioInputs(s)),
);


export const metadata: Metadata = {
  title: "Scale forecasting",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Scale forecasting" },
        ]}
      />
      <OpsPageHeader
        title={"Scale forecasting"}
        deck={"Conservative, base, and accelerated scenarios. Forecasts are estimates, never guarantees."}
      />
      <ScaleSubnav current={"/internal/scale/forecast"} />

      <OpsPanel title="Scenarios (illustrative assumptions)">
        <table className="fj-ops-table">
          <thead><tr><th>Scenario</th><th>MRR</th><th>Contribution est.</th><th>Cash req.</th><th>Act. CAC</th><th>Payback</th></tr></thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.scenario}>
                <td>{s.scenario}</td>
                <td>{formatUsdCents(s.outputs.mrrCents)}</td>
                <td>{formatUsdCents(s.outputs.contributionEstimateCents)}</td>
                <td>{formatUsdCents(s.outputs.cashRequirementCents)}</td>
                <td>{s.outputs.activatedCacCents == null ? "—" : formatUsdCents(s.outputs.activatedCacCents)}</td>
                <td>{s.outputs.paybackMonths == null ? "—" : `${s.outputs.paybackMonths} mo`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="fj-ops-empty">{scenarios[0].outputs.disclaimer}</p>
      </OpsPanel>
      <OpsPanel title="Assumption registry">
        <table className="fj-ops-table">
          <thead><tr><th>Assumption</th><th>Value</th><th>Source</th><th>Confidence</th><th>Actual vs forecast</th></tr></thead>
          <tbody>
            {FORECAST_ASSUMPTIONS.map((a) => (
              <tr key={a.key}><td>{a.label}</td><td>{String(a.value)}</td><td>{a.source}</td><td>{a.confidence}</td><td>{a.actualVsForecast}</td></tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

    </>
  );
}
