"use client";

import { useEffect, useId, useRef, useState } from "react";

import { BrandIcon, type BrandIconName } from "@/components/design-system/icons";
import { DemoFrame } from "@/components/design-system/primitives";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { InteractiveSampleLabel } from "@/components/site/interactive-sample-label";
import { demoEndpoints } from "@/lib/site/demo-brand";

interface CoverageKind {
  id: string;
  icon: BrandIconName;
  label: string;
  value: string;
  /** Console lines: what a check actually looks like. */
  lines: { text: string; tone?: "ok" | "bad" }[];
  href: string;
}

const kinds: CoverageKind[] = [
  {
    id: "website",
    icon: "monitor-http",
    label: "Website",
    value:
      "Availability, status codes, and response time for every page that matters. A real request, not a ping.",
    lines: [
      { text: `GET ${demoEndpoints.site.url}` },
      { text: "→ 200 OK · 212 ms", tone: "ok" },
      { text: "assert status == 200 ✓ response < 1000 ms ✓", tone: "ok" },
      { text: "next check on schedule" },
    ],
    href: "/features/uptime-monitoring",
  },
  {
    id: "api",
    icon: "monitor-api",
    label: "API",
    value:
      "Check status codes, response speed, keywords, and JSON values before a broken endpoint reaches your customers.",
    lines: [
      { text: `GET ${demoEndpoints.apiHealth.url}` },
      { text: "→ 200 OK · 184 ms", tone: "ok" },
      { text: 'assert json body.status == "ok" ✓', tone: "ok" },
      { text: "assert response < 500 ms ✓", tone: "ok" },
    ],
    href: "/features/api-monitoring",
  },
  {
    id: "ssl",
    icon: "monitor-ssl",
    label: "SSL",
    value:
      "Expiry dates, validity, and the certificate chain your visitors actually receive. Warnings long before the browser shows one.",
    lines: [
      { text: `TLS ${demoEndpoints.tls.label}` },
      { text: "→ valid · expires in 212 days", tone: "ok" },
      { text: "chain complete ✓ issuer trusted ✓", tone: "ok" },
      { text: "warn at 30 days · alert at 7 days" },
    ],
    href: "/features/ssl-monitoring",
  },
  {
    id: "cron",
    icon: "monitor-cron",
    label: "Cron",
    value:
      "Every scheduled job gets a heartbeat URL. A missed ping past its grace window counts as a failure, verified and alerted like any outage.",
    lines: [
      { text: "heartbeat nightly-backup · expected every 24h" },
      { text: "→ last ping 22.4h ago", tone: "ok" },
      { text: "grace window 2h · within schedule ✓", tone: "ok" },
      { text: "silence past 26h opens an incident" },
    ],
    href: "/features/cron-monitoring",
  },
  {
    id: "heartbeat",
    icon: "response-time",
    label: "Heartbeat",
    value:
      "Anything that can make an HTTP request can be monitored: workers, queues, deploy hooks, the script nobody remembers writing.",
    lines: [
      { text: "POST https://hb.fajita.io/p/7f2… (from your worker)" },
      { text: "→ received · queue-consumer alive", tone: "ok" },
      { text: "expected every 5 min · on time ✓", tone: "ok" },
      { text: "one curl line. that is the integration." },
    ],
    href: "/features/cron-monitoring",
  },
];

/**
 * Monitoring coverage as one central interface with the five monitor types
 * selected around it. Tabs follow the ARIA pattern: arrow keys move
 * selection, panel content swaps without motion dependence.
 */
export function CoverageExplorer() {
  const [active, setActive] = useState(0);
  const [tabOrientation, setTabOrientation] = useState<"vertical" | "horizontal">(
    "vertical",
  );
  const baseId = useId();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 63.75rem)");
    const sync = () => setTabOrientation(mq.matches ? "horizontal" : "vertical");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const kind = kinds[active];

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (active + 1) % kinds.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = (active - 1 + kinds.length) % kinds.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = kinds.length - 1;
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <div className="fj-coverage">
      <div
        className="fj-coverage__tabs"
        role="tablist"
        aria-label="Monitor types"
        aria-orientation={tabOrientation}
        onKeyDown={onKeyDown}
      >
        {kinds.map((k, i) => (
          <button
            key={k.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${k.id}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="fj-coverage__tab"
            onClick={() => setActive(i)}
          >
            <BrandIcon name={k.icon} size={18} />
            {k.label} monitoring
          </button>
        ))}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${kind.id}`}
        className="fj-coverage__panel"
        tabIndex={0}
      >
        <DemoFrame title={`fajita · ${kind.label.toLowerCase()} check`}>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <StatusBadge status="operational" label="Passing" />
              <InteractiveSampleLabel detail="Check passing" />
            </div>
            <pre className="fj-console" aria-label={`Example ${kind.label} check`}>
              {kind.lines.map((line, i) => (
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
        <p className="fj-body fj-coverage__value">{kind.value}</p>
        <p style={{ marginTop: "var(--space-3)" }}>
          <a
            href={kind.href}
            className="fj-body-sm"
            style={{
              color: "var(--color-brand-text)",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: "0.2em",
            }}
          >
            More on {kind.label.toLowerCase()} monitoring
          </a>
        </p>
      </div>
    </div>
  );
}
