import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { platformDb } from "@/lib/platform/db";

export const metadata: Metadata = {
  title: "Security",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  let events: Array<{
    id: string;
    event_type: string;
    severity: string;
    status: string;
    evidence_summary: string;
    detection_time: string;
  }> = [];
  let completeness: "complete" | "unavailable" = "complete";

  try {
    const { data, error } = await platformDb()
      .from("platform_security_events")
      .select(
        "id, event_type, severity, status, evidence_summary, detection_time",
      )
      .order("detection_time", { ascending: false })
      .limit(100);
    if (error) completeness = "unavailable";
    else events = (data ?? []) as typeof events;
  } catch {
    completeness = "unavailable";
  }

  const critical = events.filter(
    (e) =>
      e.severity === "critical" &&
      !["resolved", "false_positive", "accepted_risk"].includes(e.status),
  ).length;

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Security" },
        ]}
      />
      <OpsPageHeader
        title="Security"
        deck="Rule-based events and review queue. Restricted evidence stays out of this list. Phase 18 owns final security readiness."
      />

      <div className="fj-ops-grid">
        <OpsMetricCard
          label="Open critical"
          value={completeness === "unavailable" ? null : critical}
          completeness={completeness}
        />
        <OpsMetricCard
          label="Events shown"
          value={completeness === "unavailable" ? null : events.length}
          completeness={completeness}
        />
      </div>

      <OpsPanel title="Recent events">
        {completeness === "unavailable" ? (
          <OpsEmpty>
            Security event store unavailable. Migrate Phase 17 schema or check
            connectivity. Do not invent event counts.
          </OpsEmpty>
        ) : events.length === 0 ? (
          <OpsEmpty>No security events recorded.</OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type</th>
                <th>Status</th>
                <th>Summary</th>
                <th>Detected</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span
                      className={`fj-ops-pill ${
                        e.severity === "critical" || e.severity === "high"
                          ? "fj-ops-pill--critical"
                          : ""
                      }`}
                    >
                      {e.severity}
                    </span>
                  </td>
                  <td>{e.event_type}</td>
                  <td>{e.status}</td>
                  <td>{e.evidence_summary}</td>
                  <td>{e.detection_time.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>
    </>
  );
}
