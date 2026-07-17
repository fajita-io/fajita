"use client";

import { useMemo, useState } from "react";

import {
  evaluate,
  initialSnapshot,
  type CheckInput,
  type EngineConfig,
  type EvalOutcome,
} from "@/lib/incidents/state-machine";

interface Step extends Omit<CheckInput, "at"> {
  note?: string;
}

interface Scenario {
  id: string;
  title: string;
  summary: string;
  config?: Partial<EngineConfig>;
  steps: Step[];
  /** What the operator should conclude from the run. */
  expect: string;
}

const MIN = 60_000;

function cfg(over?: Partial<EngineConfig>): EngineConfig {
  return {
    failureThreshold: 2,
    recoveryThreshold: 2,
    reopenWindowSeconds: 600,
    criticality: "normal",
    incidentSuppressed: false,
    ...over,
  };
}

const fail = (category: string, httpStatus?: number): Step => ({
  status: "failure",
  category,
  httpStatus: httpStatus ?? null,
});
const ok = (): Step => ({ status: "success", category: null });

const SCENARIOS: Scenario[] = [
  {
    id: "noise",
    title: "One bad request is noise",
    summary: "A single eligible failure followed by a success. No incident opens.",
    steps: [ok(), fail("connection_reset"), ok()],
    expect:
      "The failure enters verifying_failure. The next success clears it back to operational. No incident, no alert event.",
  },
  {
    id: "confirm",
    title: "Confirmed outage opens an incident",
    summary: "Two consecutive eligible failures meet the default threshold.",
    steps: [ok(), fail("unexpected_status", 500), fail("unexpected_status", 500)],
    expect:
      "First failure verifies. Second confirmed failure opens a down incident with attached evidence.",
  },
  {
    id: "recover",
    title: "Recovery is confirmed, not assumed",
    summary: "An open incident requires two consecutive successes to resolve.",
    steps: [
      fail("unexpected_status", 503),
      fail("unexpected_status", 503),
      ok(),
      ok(),
    ],
    expect:
      "Incident opens on the second failure. The first success enters recovering. The second success resolves.",
  },
  {
    id: "recover-interrupt",
    title: "A failure during recovery holds the incident",
    summary: "Recovery is interrupted by another failure before it confirms.",
    steps: [
      fail("connection_refused"),
      fail("connection_refused"),
      ok(),
      fail("connection_refused"),
      ok(),
      ok(),
    ],
    expect:
      "The interrupting failure returns to down and continues the same incident. It does not open a new one.",
  },
  {
    id: "flapping",
    title: "Flapping is contained, not multiplied",
    summary:
      "A monitor rapidly alternating pass and fail stays inside one incident and raises the recovery bar.",
    steps: [
      fail("response_timeout"),
      fail("response_timeout"),
      ok(),
      fail("response_timeout"),
      ok(),
      fail("response_timeout"),
      ok(),
      fail("response_timeout"),
      ok(),
      ok(),
      ok(),
      ok(),
    ],
    expect:
      "One incident stays open through the churn. After flapping is detected the recovery threshold increases, so more clean successes are required before it resolves.",
  },
  {
    id: "degraded",
    title: "Degraded is distinct from down",
    summary:
      "A 200 response that fails a non-critical assertion is degraded, not down.",
    steps: [ok(), fail("assertion_failed", 200), fail("assertion_failed", 200)],
    expect:
      "The endpoint answers but a required check fails. The incident opens as degraded, not down.",
  },
  {
    id: "tls",
    title: "Expired certificate is an outage",
    summary: "TLS expiry blocks customer access.",
    config: { criticality: "high" },
    steps: [ok(), fail("tls_expired"), fail("tls_expired")],
    expect: "Two confirmed TLS failures open a down incident.",
  },
  {
    id: "heartbeat",
    title: "A missed heartbeat opens an incident",
    summary: "A synthetic heartbeat_missed result flows through the same machine.",
    steps: [ok(), fail("heartbeat_missed"), fail("heartbeat_missed")],
    expect:
      "Missed pings are recorded as synthetic failures and confirm into a down incident.",
  },
  {
    id: "config",
    title: "Customer misconfiguration does not blame the service",
    summary: "A blocked destination is a configuration failure, not an outage.",
    steps: [fail("blocked_destination"), fail("blocked_destination")],
    expect:
      "The result is classified config and ignored for incident purposes. No incident opens.",
  },
  {
    id: "platform",
    title: "Fajita's own failure is not a customer outage",
    summary: "A worker_error is platform uncertainty.",
    steps: [ok(), fail("worker_error"), fail("worker_error")],
    expect:
      "The monitor moves to unknown. Fajita does not label the customer service down for its own internal failure.",
  },
  {
    id: "maintenance",
    title: "Maintenance suppresses new incidents",
    summary: "During maintenance, eligible failures do not open incidents.",
    steps: [
      ok(),
      { ...fail("unexpected_status", 500), maintenanceSuppress: true },
      { ...fail("unexpected_status", 500), maintenanceSuppress: true },
    ],
    expect:
      "Checks continue and results are stored, but the monitor is marked under maintenance instead of opening an incident.",
  },
  {
    id: "critical",
    title: "Critical monitors confirm one step sooner",
    summary: "A critical monitor uses a documented reduced threshold.",
    config: { criticality: "critical" },
    steps: [ok(), fail("unexpected_status", 500)],
    expect:
      "With criticality critical, the effective failure threshold drops by one, so a single confirmed failure opens the incident.",
  },
];

interface Row {
  step: number;
  input: string;
  outcome: EvalOutcome;
}

function runScenario(scenario: Scenario): Row[] {
  const config = cfg(scenario.config);
  let snap = initialSnapshot();
  const rows: Row[] = [];
  scenario.steps.forEach((step, i) => {
    const input: CheckInput = { ...step, at: i * (2 * MIN) };
    const outcome = evaluate(snap, input, config);
    rows.push({
      step: i + 1,
      input: describeInput(step),
      outcome,
    });
    snap = outcome.next;
  });
  return rows;
}

function describeInput(step: Step): string {
  if (step.status === "success") return "success";
  const parts = [step.category ?? step.status];
  if (step.httpStatus) parts.push(`HTTP ${step.httpStatus}`);
  if (step.maintenanceSuppress) parts.push("maintenance");
  return parts.join(" · ");
}

const ACTION_TONE: Record<string, string> = {
  incident_opened: "var(--color-status-down-bold)",
  incident_reopened: "var(--color-status-down-bold)",
  incident_continued: "var(--color-status-down-bold)",
  resolved: "var(--color-status-operational-bold)",
  operational: "var(--color-status-operational-bold)",
  recovery_started: "var(--color-status-operational-bold)",
  recovering: "var(--color-status-operational-bold)",
  verifying: "var(--color-status-verifying-bold)",
  maintenance_suppressed: "var(--color-status-maintenance-bold)",
  platform_uncertainty: "var(--color-text-muted)",
  config_ignored: "var(--color-text-muted)",
  ignored: "var(--color-text-muted)",
  monitor_suppressed: "var(--color-text-muted)",
};

export function IncidentLabClient() {
  const [openId, setOpenId] = useState<string>(SCENARIOS[0].id);
  const results = useMemo(
    () => SCENARIOS.map((s) => ({ scenario: s, rows: runScenario(s) })),
    [],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {results.map(({ scenario, rows }) => {
        const open = openId === scenario.id;
        const final = rows[rows.length - 1]?.outcome.next;
        return (
          <section
            key={scenario.id}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg, 12px)",
              background: "var(--color-background-secondary)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? "" : scenario.id)}
              aria-expanded={open}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "1rem 1.25rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "inherit",
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <strong style={{ fontSize: "1rem" }}>{scenario.title}</strong>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                  {scenario.summary}
                </span>
              </span>
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: final?.activeIncident
                    ? "var(--color-status-down-bold)"
                    : "var(--color-status-operational-bold)",
                  whiteSpace: "nowrap",
                }}
              >
                {final?.state}
              </span>
            </button>

            {open ? (
              <div style={{ padding: "0 1.25rem 1.25rem" }}>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.82rem",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <thead>
                      <tr style={{ textAlign: "left", color: "var(--color-text-muted)" }}>
                        <Th>#</Th>
                        <Th>Check result</Th>
                        <Th>Action</Th>
                        <Th>Transition</Th>
                        <Th>State</Th>
                        <Th>Incident</Th>
                        <Th>Flapping</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const t = row.outcome.transition;
                        return (
                          <tr key={row.step} style={{ borderTop: "1px solid var(--color-border)" }}>
                            <Td>{row.step}</Td>
                            <Td>{row.input}</Td>
                            <Td style={{ color: ACTION_TONE[row.outcome.action] ?? "inherit" }}>
                              {row.outcome.action}
                            </Td>
                            <Td>{t ? `${t.from} \u2192 ${t.to}` : "\u2014"}</Td>
                            <Td>{row.outcome.next.state}</Td>
                            <Td>{row.outcome.next.activeIncident ? "yes" : "no"}</Td>
                            <Td>{row.outcome.next.flapping ? "yes" : "no"}</Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p
                  style={{
                    marginTop: "0.85rem",
                    marginBottom: 0,
                    color: "var(--color-text-muted)",
                    fontSize: "0.85rem",
                    maxWidth: "72ch",
                  }}
                >
                  {scenario.expect}
                </p>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "0.5rem 0.75rem 0.5rem 0", fontWeight: 600 }}>{children}</th>;
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "0.4rem 0.75rem 0.4rem 0", ...style }}>{children}</td>;
}
