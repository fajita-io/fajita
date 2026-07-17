"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton, BrandCard } from "@/components/design-system/primitives";
import {
  activateMonitorAction,
  createMonitorAction,
  deleteMonitorAction,
  pauseMonitorAction,
  resumeMonitorAction,
  testMonitorConfigAction,
} from "@/lib/app/actions/monitors";
import type { MonitorSummary } from "@/lib/monitoring/monitors";
import type { SecurityEventView } from "@/lib/monitoring/security-events";

const MONITOR_TYPES = ["http", "https", "api", "ssl", "heartbeat"] as const;
const INTERVALS = [60, 300, 600, 900, 1800, 3600] as const;

interface Props {
  organizationId: string;
  monitors: MonitorSummary[];
  securityEvents: SecurityEventView[];
}

type Feedback = { kind: "ok" | "error"; message: string } | null;

export function EngineLabClient({
  organizationId,
  monitors,
  securityEvents,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [name, setName] = useState("Marketing site");
  const [monitorType, setMonitorType] =
    useState<(typeof MONITOR_TYPES)[number]>("https");
  const [targetUrl, setTargetUrl] = useState("https://example.com/");
  const [interval, setInterval] = useState<number>(300);

  function buildConfig() {
    return {
      name,
      monitor_type: monitorType,
      target_url: monitorType === "heartbeat" ? null : targetUrl,
      check_interval_seconds: interval,
      expected_status_codes: [200],
    };
  }

  function onTest() {
    setFeedback(null);
    startTransition(async () => {
      const res = await testMonitorConfigAction(organizationId, buildConfig());
      if (res.ok) {
        setFeedback({
          kind: res.data?.outcome === "blocked" ? "error" : "ok",
          message: res.data?.message ?? "Tested.",
        });
      } else {
        setFeedback({ kind: "error", message: res.error });
      }
    });
  }

  function onCreate() {
    setFeedback(null);
    startTransition(async () => {
      const res = await createMonitorAction(organizationId, buildConfig());
      if (res.ok) {
        setFeedback({ kind: "ok", message: "Draft monitor created." });
        router.refresh();
      } else {
        setFeedback({ kind: "error", message: res.error });
      }
    });
  }

  function runOnMonitor(
    label: string,
    fn: () => Promise<{ ok: boolean; error?: string }>,
  ) {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setFeedback({ kind: "ok", message: `${label} complete.` });
        router.refresh();
      } else {
        setFeedback({ kind: "error", message: res.error ?? "Action failed." });
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {feedback ? (
        <div
          role="status"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 10,
            fontSize: "0.9rem",
            border: "1px solid var(--color-border-subtle)",
            background:
              feedback.kind === "ok"
                ? "var(--color-surface-inset, rgba(0,0,0,0.03))"
                : "rgba(200,40,40,0.08)",
            color:
              feedback.kind === "ok"
                ? "var(--color-text)"
                : "var(--color-status-down, #b00020)",
          }}
        >
          {feedback.message}
        </div>
      ) : null}

      <BrandCard>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Create a monitor</h2>
        <div
          style={{
            display: "grid",
            gap: "0.85rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <label style={labelStyle}>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Type
            <select
              value={monitorType}
              onChange={(e) =>
                setMonitorType(
                  e.target.value as (typeof MONITOR_TYPES)[number],
                )
              }
              style={inputStyle}
            >
              {MONITOR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          {monitorType !== "heartbeat" ? (
            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              Target URL
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/health"
                style={inputStyle}
              />
            </label>
          ) : null}
          <label style={labelStyle}>
            Interval (seconds)
            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              style={inputStyle}
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
          <BrandButton variant="secondary" onClick={onTest} disabled={pending}>
            Test configuration
          </BrandButton>
          <BrandButton onClick={onCreate} disabled={pending}>
            Create draft
          </BrandButton>
        </div>
      </BrandCard>

      <section>
        <h2 style={{ fontSize: "1.1rem" }}>Monitors ({monitors.length})</h2>
        {monitors.length === 0 ? (
          <BrandCard>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
              No monitors yet. Create a draft above, then activate it to schedule
              checks.
            </p>
          </BrandCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {monitors.map((m) => (
              <BrandCard key={m.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>{m.name}</strong>{" "}
                    <span style={tagStyle}>{m.monitorType}</span>{" "}
                    <span style={tagStyle}>{m.status}</span>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--color-text-muted)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {m.targetUrl ?? "heartbeat"} · every{" "}
                      {m.checkIntervalSeconds}s ·{" "}
                      {m.lastResultStatus
                        ? `last: ${m.lastResultStatus}`
                        : "no checks yet"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {m.status !== "active" ? (
                      <BrandButton
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          runOnMonitor("Activate", () =>
                            m.status === "paused"
                              ? resumeMonitorAction(organizationId, m.id)
                              : activateMonitorAction(organizationId, m.id),
                          )
                        }
                      >
                        {m.status === "paused" ? "Resume" : "Activate"}
                      </BrandButton>
                    ) : (
                      <BrandButton
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          runOnMonitor("Pause", () =>
                            pauseMonitorAction(organizationId, m.id),
                          )
                        }
                      >
                        Pause
                      </BrandButton>
                    )}
                    <BrandButton
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        runOnMonitor("Delete", () =>
                          deleteMonitorAction(organizationId, m.id),
                        )
                      }
                    >
                      Delete
                    </BrandButton>
                  </div>
                </div>
              </BrandCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem" }}>
          Recent security events ({securityEvents.length})
        </h2>
        {securityEvents.length === 0 ? (
          <BrandCard>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
              No security events recorded. Blocked destinations, SSRF attempts,
              and rate-limit enforcement appear here.
            </p>
          </BrandCard>
        ) : (
          <BrandCard>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.88rem" }}>
              {securityEvents.map((e) => (
                <li key={e.id} style={{ marginBottom: "0.35rem" }}>
                  <span style={tagStyle}>{e.severity}</span>{" "}
                  <code>{e.eventType}</code> · {e.safeSummary}
                </li>
              ))}
            </ul>
          </BrandCard>
        )}
      </section>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem",
  fontSize: "0.82rem",
  color: "var(--color-text-muted)",
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.6rem",
  borderRadius: 8,
  border: "1px solid var(--color-border-subtle)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  fontSize: "0.9rem",
};

const tagStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  padding: "0.1rem 0.4rem",
  borderRadius: 6,
  border: "1px solid var(--color-border-subtle)",
  color: "var(--color-text-muted)",
};
