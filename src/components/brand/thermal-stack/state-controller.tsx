"use client";

import { useEffect, useRef, useState } from "react";

import { ThermalStack } from "./thermal-stack";
import {
  thermalStackJourney,
  thermalStates,
  type ThermalStackState,
} from "./types";

export interface ThermalStackControllerProps {
  initialState?: ThermalStackState;
  /** Autoplay the incident journey (operational through recovery). Off by default. */
  autoplay?: boolean;
  simplified?: boolean;
}

const stateOrder = Object.keys(thermalStates) as ThermalStackState[];

/**
 * Interactive controller for the Thermal Stack: state switcher plus an
 * optional incident-journey autoplay. Used by the Brand Lab and, later,
 * by marketing demonstrations. Autoplay pauses on any manual selection
 * and never runs for reduced-motion users.
 */
export function ThermalStackController({
  initialState = "operational",
  autoplay = false,
  simplified = false,
}: ThermalStackControllerProps) {
  const [state, setState] = useState<ThermalStackState>(initialState);
  const [playing, setPlaying] = useState(autoplay);
  const step = useRef(0);

  useEffect(() => {
    if (!playing) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setPlaying(false);
      return;
    }
    const id = window.setInterval(() => {
      step.current = (step.current + 1) % thermalStackJourney.length;
      setState(thermalStackJourney[step.current]);
    }, 3000);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div>
      <ThermalStack state={state} simplified={simplified} />
      <div
        role="group"
        aria-label="Thermal Stack state"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          marginTop: "var(--space-4)",
        }}
      >
        {stateOrder.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setPlaying(false);
              setState(s);
            }}
            aria-pressed={state === s}
            className="fj-interactive"
            style={{
              font: "inherit",
              fontSize: "var(--text-label)",
              fontWeight: 500,
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-pill)",
              border: `1.5px solid ${state === s ? thermalStates[s].signalColor : "var(--color-border-subtle)"}`,
              background:
                state === s ? thermalStates[s].softColor : "transparent",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            {thermalStates[s].label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className="fj-interactive"
          style={{
            font: "inherit",
            fontSize: "var(--text-label)",
            fontWeight: 500,
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-pill)",
            border: "1.5px solid var(--color-border-strong)",
            background: playing
              ? "var(--color-background-inset)"
              : "transparent",
            color: "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          {playing ? "Stop journey" : "Play incident journey"}
        </button>
      </div>
    </div>
  );
}
