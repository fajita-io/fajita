import { DemoFrame } from "@/components/design-system/primitives";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { AlertFlow } from "@/components/site/alert-flow";
import { MonitorPreview } from "@/components/site/monitor-preview";
import { StatusPagePreview } from "@/components/site/status-page-preview";
import { demoEndpoints } from "@/lib/site/demo-brand";
import type { FeatureSlug } from "@/lib/site/features";

interface ConsoleDemo {
  title: string;
  status: "operational" | "down";
  statusLabel: string;
  lines: { text: string; tone?: "ok" | "bad" }[];
}

const consoleDemos: Partial<Record<FeatureSlug, ConsoleDemo>> = {
  "api-monitoring": {
    title: "fajita · api check",
    status: "down",
    statusLabel: "Assertion failed",
    lines: [
      { text: `GET ${demoEndpoints.apiOrders.url}` },
      { text: "→ 200 OK · 3,840 ms", tone: "bad" },
      { text: "assert response < 800 ms ✗ (3,840 ms)", tone: "bad" },
      { text: 'assert json body.status == "ok" ✓', tone: "ok" },
      { text: "verifying · re-checking before alerting…" },
      { text: "second check agrees · incident opened", tone: "bad" },
    ],
  },
  "ssl-monitoring": {
    title: "fajita · certificate check",
    status: "operational",
    statusLabel: "Watching",
    lines: [
      { text: `TLS ${demoEndpoints.tls.label}` },
      { text: "→ valid · expires 2027-02-13 (212 days)", tone: "ok" },
      { text: "chain complete ✓ issuer trusted ✓", tone: "ok" },
      { text: "reminders at 30 days and 7 days" },
      { text: "invalid chain alerts immediately" },
    ],
  },
  "cron-monitoring": {
    title: "fajita · heartbeat",
    status: "down",
    statusLabel: "Missed run",
    lines: [
      { text: "heartbeat nightly-backup · expected every 24h" },
      { text: "→ last ping 26.2h ago", tone: "bad" },
      { text: "grace window 2h · exceeded", tone: "bad" },
      { text: "incident opened · 'nightly-backup went quiet'" },
      { text: "your script's side: curl -fsS https://hb.fajita.io/p/…" },
    ],
  },
};

/**
 * Per-feature product demonstration. Server-renderable except the
 * status-page scenario switcher; every surface uses the demo frame so
 * simulation is visually distinct from live product claims.
 */
export function FeatureDemo({ slug }: { slug: FeatureSlug }) {
  if (slug === "uptime-monitoring") return <MonitorPreview />;
  if (slug === "status-pages") return <StatusPagePreview />;
  if (slug === "incident-communication")
    return (
      <DemoFrame title="fajita · incident alert routing">
        <AlertFlow />
      </DemoFrame>
    );

  const demo = consoleDemos[slug];
  if (!demo) return null;

  return (
    <DemoFrame title={demo.title}>
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          <StatusBadge status={demo.status} label={demo.statusLabel} />
          <span className="fj-caption">demonstration data</span>
        </div>
        <pre className="fj-console" aria-label={`Example: ${demo.title}`}>
          {demo.lines.map((line, i) => (
            <span
              key={i}
              className={`fj-console__line${line.tone ? ` fj-console__line--${line.tone}` : ""}`}
            >
              {line.text}
            </span>
          ))}
        </pre>
      </div>
    </DemoFrame>
  );
}
