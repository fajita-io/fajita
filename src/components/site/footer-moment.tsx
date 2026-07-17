"use client";

import { useEffect, useRef, useState } from "react";

import { ThermalStack } from "@/components/brand/thermal-stack/thermal-stack";
import {
  thermalStackJourney,
  thermalStates,
  type ThermalStackState,
} from "@/components/brand/thermal-stack/types";

const narration: Record<ThermalStackState, string> = {
  operational: "Everything holding steady. Fajita keeps watching.",
  verifying: "One check failed. Fajita re-checks before saying a word.",
  degraded: "Responses are slowing. The system is warming up.",
  down: "Outage confirmed. The alert is already on its way.",
  recovering: "Checks are passing again. The temperature falls.",
  maintenance: "Planned work in progress. Calm, deliberate, no alarm.",
};

/**
 * The footer's closing brand moment: a reduced Thermal Stack that plays
 * the incident journey once on request. Gesture-triggered (never
 * autoplaying), lightweight, and skippable. Reduced-motion users step
 * through the same states manually via the replay button.
 */
export function FooterMoment() {
  const [state, setState] = useState<ThermalStackState>("operational");
  const [playing, setPlaying] = useState(false);
  const step = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = reduced ? 2000 : 2600;
    const id = window.setInterval(() => {
      step.current += 1;
      if (step.current >= thermalStackJourney.length) {
        step.current = 0;
        setState("operational");
        setPlaying(false);
        return;
      }
      setState(thermalStackJourney[step.current]);
    }, interval);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-4)",
        maxWidth: "30rem",
      }}
    >
      <ThermalStack state={state} simplified />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="fj-scenario-chip"
          onClick={() => {
            step.current = 0;
            setState("operational");
            setPlaying(true);
          }}
          disabled={playing}
        >
          {playing ? "Watching an incident…" : "Watch Fajita catch one"}
        </button>
        <span className="fj-caption" role="status" aria-live="polite">
          {playing ? narration[state] : thermalStates[state].label}
        </span>
      </div>
    </div>
  );
}
