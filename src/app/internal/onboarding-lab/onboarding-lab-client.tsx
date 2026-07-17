"use client";

import { useMemo, useState } from "react";

export interface LabPreview {
  key: string;
  label: string;
  messageClass: string;
  templateVersion: number;
  subject: string;
  previewText: string;
  html: string;
  text: string;
}

type ViewMode = "desktop" | "mobile" | "text";

export function OnboardingLabClient({ previews }: { previews: LabPreview[] }) {
  const [selectedKey, setSelectedKey] = useState(previews[0]?.key ?? "");
  const [mode, setMode] = useState<ViewMode>("desktop");

  const selected = useMemo(
    () => previews.find((p) => p.key === selectedKey) ?? previews[0],
    [previews, selectedKey],
  );

  if (!selected) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Onboarding lab</h1>
        <p>No templates registered.</p>
      </main>
    );
  }

  const frameWidth = mode === "mobile" ? 390 : 720;

  return (
    <main style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        aria-label="Lifecycle email templates"
        style={{
          width: 280,
          borderRight: "1px solid #333",
          padding: 16,
          overflowY: "auto",
        }}
      >
        <h1 style={{ fontSize: 18 }}>Onboarding lab</h1>
        <p style={{ fontSize: 13, color: "#888" }}>
          Preview data. Nothing on this page sends email.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {previews.map((p) => (
            <li key={p.key}>
              <button
                type="button"
                onClick={() => setSelectedKey(p.key)}
                aria-current={p.key === selected.key ? "true" : undefined}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  marginBottom: 4,
                  borderRadius: 6,
                  border: "1px solid transparent",
                  background: p.key === selected.key ? "#222" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "block", fontWeight: 600 }}>
                  {p.label}
                </span>
                <span style={{ fontSize: 12, color: "#888" }}>
                  {p.messageClass} · v{p.templateVersion}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <header style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
            Subject
          </p>
          <h2 style={{ margin: "2px 0 4px", fontSize: 18 }}>
            {selected.subject}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
            Preview text: {selected.previewText}
          </p>
        </header>

        <div
          role="group"
          aria-label="Preview mode"
          style={{ display: "flex", gap: 8, marginBottom: 16 }}
        >
          {(["desktop", "mobile", "text"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #444",
                background: mode === m ? "#333" : "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              {m === "text" ? "Plain text" : m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {mode === "text" ? (
          <pre
            style={{
              maxWidth: 720,
              whiteSpace: "pre-wrap",
              border: "1px solid #333",
              borderRadius: 8,
              padding: 16,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {selected.text}
          </pre>
        ) : (
          <iframe
            title={`Preview: ${selected.label}`}
            srcDoc={selected.html}
            sandbox=""
            style={{
              width: frameWidth,
              height: "72vh",
              border: "1px solid #333",
              borderRadius: 8,
              background: "#fff",
            }}
          />
        )}
      </section>
    </main>
  );
}
