"use client";

import { useState, type CSSProperties } from "react";

import { DemoFrame } from "@/components/design-system/primitives";
import { StatusDot } from "@/components/design-system/status/status-badge";
import { statusSpecs, type OperationalStatus } from "@/components/design-system/status/status";
import { UptimeChart, type UptimeDay } from "@/components/design-system/uptime-chart";

type ScenarioId =
  | "operational"
  | "degraded"
  | "incident"
  | "maintenance"
  | "resolved";

interface ComponentRow {
  name: string;
  status: OperationalStatus;
}

interface Update {
  time: string;
  title: string;
  body: string;
}

interface Scenario {
  id: ScenarioId;
  chip: string;
  banner: string;
  bannerStatus: OperationalStatus;
  components: ComponentRow[];
  updates: Update[];
}

/**
 * The five states a status page must be good at. Fictional but plausible
 * customer ("Mesa Labs"), consistent with the rest of the site's demo data.
 */
const scenarios: Scenario[] = [
  {
    id: "operational",
    chip: "Operational",
    banner: "All systems operational",
    bannerStatus: "operational",
    components: [
      { name: "Web application", status: "operational" },
      { name: "API", status: "operational" },
      { name: "Checkout", status: "operational" },
      { name: "Background jobs", status: "operational" },
    ],
    updates: [],
  },
  {
    id: "degraded",
    chip: "Degraded",
    banner: "Degraded performance on the API",
    bannerStatus: "degraded",
    components: [
      { name: "Web application", status: "operational" },
      { name: "API", status: "degraded" },
      { name: "Checkout", status: "operational" },
      { name: "Background jobs", status: "operational" },
    ],
    updates: [
      {
        time: "14:22 MST",
        title: "Investigating",
        body: "API response times are elevated. We are investigating and will update within 30 minutes.",
      },
    ],
  },
  {
    id: "incident",
    chip: "Active incident",
    banner: "Outage: checkout is unavailable",
    bannerStatus: "down",
    components: [
      { name: "Web application", status: "operational" },
      { name: "API", status: "degraded" },
      { name: "Checkout", status: "down" },
      { name: "Background jobs", status: "operational" },
    ],
    updates: [
      {
        time: "09:41 MST",
        title: "Identified",
        body: "The cause is a failed database migration on the checkout service. A fix is being deployed.",
      },
      {
        time: "09:18 MST",
        title: "Investigating",
        body: "Checkout requests are failing. We are investigating. Orders already placed are not affected.",
      },
    ],
  },
  {
    id: "maintenance",
    chip: "Maintenance",
    banner: "Scheduled maintenance in progress",
    bannerStatus: "maintenance",
    components: [
      { name: "Web application", status: "operational" },
      { name: "API", status: "maintenance" },
      { name: "Checkout", status: "operational" },
      { name: "Background jobs", status: "maintenance" },
    ],
    updates: [
      {
        time: "02:00 MST",
        title: "Maintenance started",
        body: "Database upgrade in progress. Expected duration 45 minutes. The API may return brief errors.",
      },
    ],
  },
  {
    id: "resolved",
    chip: "Resolved",
    banner: "All systems operational",
    bannerStatus: "operational",
    components: [
      { name: "Web application", status: "operational" },
      { name: "API", status: "operational" },
      { name: "Checkout", status: "operational" },
      { name: "Background jobs", status: "operational" },
    ],
    updates: [
      {
        time: "10:03 MST",
        title: "Resolved",
        body: "Checkout has been fully restored. Total impact: 45 minutes. A postmortem will follow.",
      },
      {
        time: "09:41 MST",
        title: "Identified",
        body: "The cause is a failed database migration on the checkout service. A fix is being deployed.",
      },
    ],
  },
];

function historyFor(id: ScenarioId): UptimeDay[] {
  const days: UptimeDay[] = [];
  const start = new Date("2026-07-16T00:00:00Z");
  for (let i = 89; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    let status: UptimeDay["status"] = "operational";
    if (i === 44) status = "degraded";
    if (i === 0 && (id === "incident" || id === "degraded")) {
      status = id === "incident" ? "down" : "degraded";
    }
    days.push({ date: d.toISOString().slice(0, 10), status });
  }
  return days;
}

/**
 * Simulated status page in five scenarios. Marketing-only primitives;
 * the real status-page system ships in a later phase and may adapt these
 * visual patterns without sharing this component's state.
 */
export function StatusPagePreview() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("incident");
  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const bannerSpec = statusSpecs[scenario.bannerStatus];
  const bannerVars = {
    "--status-text": bannerSpec.text,
    "--status-bold": bannerSpec.bold,
    "--status-soft": bannerSpec.soft,
  } as CSSProperties;

  return (
    <div className="fj-status-preview">
      <div className="fj-status-preview__scenarios" role="group" aria-label="Status page scenario">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            className="fj-scenario-chip"
            aria-pressed={s.id === scenarioId}
            onClick={() => setScenarioId(s.id)}
          >
            {s.chip}
          </button>
        ))}
      </div>

      <DemoFrame title="status.mesa-labs.dev · example status page">
        <div className="fj-statuspage">
          <div className="fj-statuspage__masthead">
            <span className="fj-statuspage__brand">
              <span className="fj-statuspage__brand-mark" aria-hidden>
                M
              </span>
              Mesa Labs status
            </span>
            <span className="fj-caption">Updated moments ago</span>
          </div>

          <div className="fj-statuspage__banner" style={bannerVars} role="status">
            <StatusDot status={scenario.bannerStatus} />
            {scenario.banner}
          </div>

          <div className="fj-statuspage__components">
            {scenario.components.map((c) => (
              <div key={c.name} className="fj-statuspage__component">
                <span className="fj-statuspage__component-name">{c.name}</span>
                <span className="fj-statuspage__component-state">
                  <StatusDot status={c.status} />
                  {statusSpecs[c.status].label}
                </span>
              </div>
            ))}
          </div>

          {scenario.updates.length > 0 ? (
            <div
              className="fj-statuspage__incident"
              style={bannerVars}
              aria-label="Incident timeline"
            >
              {scenario.updates.map((u) => (
                <div key={u.time} className="fj-statuspage__update">
                  <time>{u.time}</time>
                  <strong>{u.title}.</strong> {u.body}
                </div>
              ))}
            </div>
          ) : null}

          <UptimeChart
            days={historyFor(scenario.id)}
            label="API uptime · last 90 days"
          />

          <div className="fj-statuspage__foot">
            <span className="fj-caption">
              Subscribe to updates by email or RSS
            </span>
            <span className="fj-caption">Monitored by Fajita</span>
          </div>
        </div>
      </DemoFrame>
    </div>
  );
}
