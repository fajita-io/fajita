"use client";

import { useEffect, useRef, useState } from "react";

import { ThermalStack } from "@/components/brand/thermal-stack/thermal-stack";
import type { ThermalStackState } from "@/components/brand/thermal-stack/types";
import { trackGoalOnce } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

interface NarrativeStep {
  state: ThermalStackState;
  title: string;
  caption: string;
}

/**
 * The hero monitoring journey: eight beats from steady state through
 * detection, verification, alert, public status, and recovery.
 */
const steps: NarrativeStep[] = [
  {
    state: "operational",
    title: "All quiet",
    caption: "Four services checked on schedule. Steady rhythm, controlled warmth.",
  },
  {
    state: "degraded",
    title: "Something warms up",
    caption: "API response time climbs from 180 ms toward 2 seconds.",
  },
  {
    state: "verifying",
    title: "Fajita re-checks",
    caption: "One failure is not an incident yet. Fajita verifies before it speaks.",
  },
  {
    state: "down",
    title: "Outage confirmed",
    caption: "A second check agrees. An incident opens. No panic, one precise flare.",
  },
  {
    state: "down",
    title: "The team hears first",
    caption: "The alert lands in Slack and email before the first support ticket.",
  },
  {
    state: "down",
    title: "Customers get an answer",
    caption: "The public status page already says what is happening.",
  },
  {
    state: "recovering",
    title: "Recovery confirmed",
    caption: "Checks pass again. One clear all-clear goes to the same channels.",
  },
  {
    state: "operational",
    title: "Back to quiet",
    caption: "The incident is on the record. The watching never stopped.",
  },
];

/**
 * Hero visual: the Thermal Stack telling the product story. Never
 * autoplays; the visitor starts it (Phase 1 rule: no first-viewport
 * autoplay without a gesture). Fully step-navigable by keyboard and
 * readable without motion: every beat is plain text.
 */
export function HeroNarrative() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= steps.length) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 2800);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing]);

  const step = steps[index];
  const finished = index === steps.length - 1;

  const start = () => {
    trackGoalOnce(DataFastGoals.demoStarted, { demo: "hero" });
    setIndex(0);
    setPlaying(true);
  };

  return (
    <div className="fj-hero-demo">
      <div className="fj-hero-demo__stage">
        <ThermalStack state={step.state} animated={playing} />
        <div className="fj-hero-demo__narration" aria-live="polite">
          <p className="fj-body-sm">
            <strong style={{ color: "var(--color-text-primary)" }}>
              {index + 1} of {steps.length}: {step.title}.
            </strong>{" "}
            {step.caption}
          </p>
        </div>
        <div className="fj-hero-demo__controls">
          <button
            type="button"
            className="fj-scenario-chip"
            onClick={() => {
              if (playing) {
                setPlaying(false);
              } else if (finished) {
                start();
              } else {
                start();
              }
            }}
          >
            {playing ? "Pause" : finished ? "Replay the story" : "Play the story"}
          </button>
          <div
            className="fj-hero-demo__steps"
            role="group"
            aria-label="Story steps"
          >
            {steps.map((s, i) => (
              <button
                key={i}
                type="button"
                className="fj-hero-demo__step"
                aria-label={`Step ${i + 1}: ${s.title}`}
                aria-current={i === index ? "step" : undefined}
                onClick={() => {
                  setPlaying(false);
                  setIndex(i);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
