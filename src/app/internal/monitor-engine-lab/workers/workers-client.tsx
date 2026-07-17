"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton, BrandCard } from "@/components/design-system/primitives";
import { markWorkerDrainingAction } from "@/lib/app/actions/worker-ops";
import type { WorkerView } from "@/lib/monitoring/workers";

function ago(iso: string | null): string {
  if (!iso) return "never";
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.round(secs / 60)}m ago`;
  return `${Math.round(secs / 3600)}h ago`;
}

export function WorkersClient({ workers }: { workers: WorkerView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function drain(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await markWorkerDrainingAction(id);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  if (workers.length === 0) {
    return (
      <BrandCard>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
          No workers have registered yet. A worker registers on startup and
          appears here with its region, version, and health.
        </p>
      </BrandCard>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {error ? (
        <div
          role="status"
          style={{
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            fontSize: "0.88rem",
            color: "var(--color-status-down, #b00020)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          {error}
        </div>
      ) : null}

      {workers.map((w) => (
        <BrandCard key={w.id}>
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
              <strong>{w.workerKey}</strong>{" "}
              <span style={tag}>{w.status}</span>{" "}
              <span style={tag}>{w.region}</span>{" "}
              <span style={tag}>contract v{w.contractVersion}</span>
              <div style={meta}>
                {w.version ?? "unknown build"} · heartbeat {ago(w.lastHeartbeatAt)}{" "}
                · {w.activeLeaseCount} active leases · lag{" "}
                {w.queueLagSeconds ?? 0}s · {w.recentSuccessCount}✓/
                {w.recentFailureCount}✗
                {w.avgExecutionMs != null ? ` · avg ${w.avgExecutionMs}ms` : ""}
              </div>
            </div>
            <BrandButton
              size="sm"
              variant="secondary"
              disabled={pending || w.shutdownRequested}
              onClick={() => drain(w.id)}
            >
              {w.shutdownRequested ? "Draining" : "Request drain"}
            </BrandButton>
          </div>
        </BrandCard>
      ))}
    </div>
  );
}

const tag: React.CSSProperties = {
  fontSize: "0.72rem",
  padding: "0.1rem 0.4rem",
  borderRadius: 6,
  border: "1px solid var(--color-border-subtle)",
  color: "var(--color-text-muted)",
};

const meta: React.CSSProperties = {
  fontSize: "0.82rem",
  color: "var(--color-text-muted)",
  marginTop: "0.25rem",
};
