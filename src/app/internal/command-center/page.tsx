import type { Metadata } from "next";
import Link from "next/link";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsLinkButton,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { loadCommandCenter } from "@/lib/platform/command-center/load";
import { parseRangeFromSearchParams } from "@/lib/platform/dates";
import { getMetricDefinition } from "@/lib/platform/metrics/definitions";
import { trackInternalPageEvent } from "@/lib/platform/logging";
import { getPlatformAccess } from "@/lib/platform/access";
import {
  evaluatePhase19Prerequisites,
  getStabilizationWindow,
} from "@/lib/platform/post-launch";

export const metadata: Metadata = {
  title: "Command center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CommandCenterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { range } = parseRangeFromSearchParams(sp);
  const data = await loadCommandCenter(range);
  const access = await getPlatformAccess();
  const phase19 = evaluatePhase19Prerequisites();
  const stabilization = getStabilizationWindow();
  await trackInternalPageEvent({
    eventName: "command_center_viewed",
    operatorUserId: access?.profile.id,
    path: "/internal/command-center",
  });

  return (
    <>
      <OpsBreadcrumbs items={[{ label: "Command center" }]} />
      <OpsPageHeader
        title="Command center"
        deck="Is the platform healthy, is revenue moving, and what needs attention today."
        actions={
          <OpsLinkButton href="/internal/post-launch/overview">
            Post-launch
          </OpsLinkButton>
        }
      />

      <p className="fj-ops-page-deck fj-ops-page-deck--meta">
        Range: {data.rangeLabel}. Refreshed {new Date(data.refreshedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC.
        Partial periods are labeled. Unavailable metrics show as dashes, never zero.
      </p>

      <OpsPanel title="Phase 19 post-launch">
        <p>
          <OpsStatus
            state={
              phase19.authorization === "blocked" ? "degraded" : "operational"
            }
          />{" "}
          <strong>{phase19.authorizationLabel}</strong>. Phase 18:{" "}
          {phase19.phase18ClassificationLabel}. Stabilization:{" "}
          {stabilization.phaseLabel}.
        </p>
        <p className="fj-ops-empty" style={{ marginTop: 8 }}>
          {phase19.authorization === "blocked"
            ? "Growth experiments and conversion changes stay frozen until launch is authorized."
            : "Post-launch operating surfaces are eligible under stabilization rules."}
        </p>
      </OpsPanel>

      <OpsPanel title="Platform health">
        <div className="fj-ops-grid">
          {(
            [
              ["Overall", data.platformHealth.overall],
              ["Monitoring", data.platformHealth.monitoring],
              ["Alerts", data.platformHealth.alerts],
              ["Status pages", data.platformHealth.statusPages],
              ["Providers", data.platformHealth.providers],
              ["Database", data.platformHealth.database],
              ["Workers", data.platformHealth.workers],
            ] as const
          ).map(([label, state]) => (
            <div key={label} className="fj-ops-card">
              <div className="fj-ops-card__label">{label}</div>
              <OpsStatus state={state} />
            </div>
          ))}
        </div>
      </OpsPanel>

      <div className="fj-ops-two-col">
        <div>
          <OpsPanel title="Business health">
            <div className="fj-ops-grid">
              {data.business.map((m) => (
                <OpsMetricCard
                  key={m.key}
                  label={m.label}
                  value={m.value}
                  completeness={m.completeness}
                  meta={[m.basis, m.definitionKey ? getMetricDefinition(m.definitionKey)?.calculationVersion : null]
                    .filter(Boolean)
                    .join(" · ")}
                />
              ))}
            </div>
          </OpsPanel>

          <OpsPanel title="Customer health">
            <div className="fj-ops-grid">
              {data.customers.map((m) => (
                <OpsMetricCard
                  key={m.key}
                  label={m.label}
                  value={m.value}
                  completeness={m.completeness}
                  meta={m.source}
                />
              ))}
            </div>
          </OpsPanel>

          <OpsPanel title="Product health">
            <div className="fj-ops-grid">
              {data.product.map((m) => (
                <OpsMetricCard
                  key={m.key}
                  label={m.label}
                  value={m.value}
                  completeness={m.completeness}
                  meta={m.source}
                />
              ))}
            </div>
          </OpsPanel>
        </div>

        <div>
          <OpsPanel
            title="Attention queue"
            actions={
              <span className="fj-ops-card__meta">
                {data.approvalBacklog} approvals · {data.activePlatformIncidents} platform incidents
              </span>
            }
          >
            {data.attention.length === 0 ? (
              <OpsEmpty>Nothing critical in the queue right now.</OpsEmpty>
            ) : (
              <ul className="fj-ops-attention">
                {data.attention.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href}>
                      <span className={`fj-ops-pill fj-ops-pill--${item.severity}`}>
                        {item.severity}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </OpsPanel>

          <OpsPanel title="Recent changes">
            {data.recentChanges.length === 0 ? (
              <OpsEmpty>
                No deployment inventory rows yet. Releases appear here when recorded.
              </OpsEmpty>
            ) : (
              <table className="fj-ops-table">
                <thead>
                  <tr>
                    <th>Kind</th>
                    <th>Change</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentChanges.map((c) => (
                    <tr key={c.id}>
                      <td>{c.kind}</td>
                      <td>
                        {c.href ? <Link href={c.href}>{c.title}</Link> : c.title}
                      </td>
                      <td>{c.at ? new Date(c.at).toISOString().slice(0, 16) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </OpsPanel>
        </div>
      </div>
    </>
  );
}
