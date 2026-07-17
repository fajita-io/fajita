"use client";

import { useReducer } from "react";

import { StatusBadge } from "@/components/design-system/status/status-badge";
import { BrandButton } from "@/components/design-system/primitives";

import { LabGrid, LabSection, LabSpecimen } from "./lab-ui";

const durations = [
  { token: "--motion-instant", ms: "80ms", use: "hover, press feedback" },
  { token: "--motion-fast", ms: "140ms", use: "buttons, toggles, tooltips" },
  { token: "--motion-medium", ms: "240ms", use: "cards, modals, entrances" },
  { token: "--motion-slow", ms: "420ms", use: "status and thermal transitions" },
  { token: "--motion-narrative", ms: "800ms", use: "marketing storytelling only" },
];

export function MotionSection() {
  const [runId, replay] = useReducer((n: number) => n + 1, 0);

  return (
    <LabSection
      id="motion"
      title="Motion system"
      note="Four principles: nothing moves without cause; interactions confirm fast; state changes move like temperature (continuous, never teleporting); stillness is the default. Reduced motion collapses every non-essential animation to an instant state change. Full spec in docs/brand/fajita-motion-system.md."
    >
      <h3 className="fj-heading-3" style={{ marginBottom: "var(--space-4)" }}>Duration tokens</h3>
      <div style={{ display: "grid", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
        {durations.map((d) => (
          <p key={d.token} className="fj-body-sm" style={{ margin: 0 }}>
            <span className="fj-mono">{d.token}</span> · {d.ms} · {d.use}
          </p>
        ))}
      </div>

      <BrandButton variant="secondary" size="sm" onClick={replay}>
        Replay entrances
      </BrandButton>

      <LabGrid min="14rem" style={{ marginTop: "var(--space-4)" }}>
        <LabSpecimen label="Rise-in entrance (--motion-medium, enter easing)">
          <div key={`rise-${runId}`} className="fj-animate-rise fj-card" style={{ padding: "var(--space-4)" }}>
            <span className="fj-label">Monitor created</span>
          </div>
        </LabSpecimen>
        <LabSpecimen label="Fade entrance">
          <div key={`fade-${runId}`} className="fj-animate-fade fj-card" style={{ padding: "var(--space-4)" }}>
            <span className="fj-label">First check in 30 seconds</span>
          </div>
        </LabSpecimen>
        <LabSpecimen label="Thermal status transition (hover to reheat)">
          <div key={`thermal-${runId}`} className="fj-motion-thermal-demo">
            <StatusBadge status="operational" label="Hover me" />
          </div>
        </LabSpecimen>
        <LabSpecimen label="Interactive press (click me)">
          <BrandButton size="sm">Press feedback</BrandButton>
        </LabSpecimen>
      </LabGrid>

      <style>{`
        .fj-motion-thermal-demo .fj-status-badge {
          transition:
            background-color var(--motion-slow) var(--ease-thermal),
            border-color var(--motion-slow) var(--ease-thermal),
            color var(--motion-slow) var(--ease-thermal);
        }
        .fj-motion-thermal-demo:hover .fj-status-badge {
          background: var(--color-status-down-soft);
          color: var(--color-status-down);
          border-color: var(--color-status-down-bold);
        }
      `}</style>

      <p className="fj-body-sm" style={{ marginTop: "var(--space-6)", maxWidth: "52rem" }}>
        Reduced motion: enable it in your OS and replay. Entrances become
        instant, the ember pulse and signal travel stop, and every state
        change still reads through color, icon, and label.
      </p>
    </LabSection>
  );
}
