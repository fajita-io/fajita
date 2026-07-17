"use client";

import { useState } from "react";

import { StatusPageView } from "@/components/status-public/status-page-view";
import { STATUS_PAGE_FIXTURES, type FixtureKey } from "@/lib/status-pages/fixtures";

import "@/app/(status)/status-page.css";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, number> = {
  desktop: 900,
  tablet: 768,
  mobile: 390,
};

export function StatusPageLabClient() {
  const [key, setKey] = useState<FixtureKey>("all_operational");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [stale, setStale] = useState(false);

  const fixture = STATUS_PAGE_FIXTURES.find((f) => f.key === key) ?? STATUS_PAGE_FIXTURES[0];
  // Simulate a stale projection: push generatedAt far into the past.
  const generatedAt = stale
    ? new Date(Date.now() - 45 * 60_000).toISOString()
    : fixture.data.generatedAt;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.8rem" }}>
          <span style={{ color: "var(--color-text-muted)" }}>Scenario</span>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value as FixtureKey)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: "1px solid var(--color-border-subtle)" }}
          >
            {STATUS_PAGE_FIXTURES.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", gap: "0.4rem", alignItems: "flex-end" }}>
          {(["desktop", "tablet", "mobile"] as Viewport[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewport(v)}
              aria-pressed={viewport === v}
              style={{
                padding: "0.4rem 0.7rem",
                borderRadius: 8,
                border: "1px solid var(--color-border-subtle)",
                background: viewport === v ? "var(--color-text-primary)" : "transparent",
                color: viewport === v ? "var(--color-background-primary)" : "inherit",
                textTransform: "capitalize",
                cursor: "pointer",
              }}
            >
              {v}
            </button>
          ))}
        </fieldset>

        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.85rem" }}>
          <input type="checkbox" checked={stale} onChange={(e) => setStale(e.target.checked)} />
          Simulate stale projection
        </label>
      </div>

      <div
        style={{
          background: "var(--color-background-elevated)",
          borderRadius: 12,
          padding: "1.5rem",
          overflowX: "auto",
        }}
      >
        <div
          className="sp-root"
          data-theme={fixture.data.theme.key}
          style={{
            width: VIEWPORT_WIDTH[viewport],
            maxWidth: "100%",
            margin: "0 auto",
            ["--sp-accent" as string]: fixture.data.theme.appearance.accentColor,
          }}
        >
          <StatusPageView
            data={fixture.data}
            basePath={`/status/${fixture.key}`}
            generatedAt={generatedAt}
          />
        </div>
      </div>
    </div>
  );
}
