export type ThermalStackState =
  | "operational"
  | "verifying"
  | "degraded"
  | "down"
  | "recovering"
  | "maintenance";

export interface ThermalStateSpec {
  /** Customer-facing state label. */
  label: string;
  /** One-line explanation used by the controller and screen readers. */
  description: string;
  /** Semantic token for the dominant signal color. */
  signalColor: string;
  softColor: string;
  /** Seconds per signal cycle; lower is more urgent. 0 disables travel. */
  pulseSeconds: number;
  /** 0 to 1. Drives the heat-glow opacity under the surface. */
  heatLevel: number;
  /** Which waveform the surface shows. */
  waveform: "calm" | "tense" | "spike";
}

export const thermalStates: Record<ThermalStackState, ThermalStateSpec> = {
  operational: {
    label: "Operational",
    description: "All checks passing. Stable rhythm, controlled warmth.",
    signalColor: "var(--color-status-operational-bold)",
    softColor: "var(--color-status-operational-soft)",
    pulseSeconds: 3.6,
    heatLevel: 0.18,
    waveform: "calm",
  },
  verifying: {
    label: "Verifying",
    description:
      "A check failed once. Fajita re-checks from other regions before alerting anyone.",
    signalColor: "var(--color-status-verifying-bold)",
    softColor: "var(--color-status-verifying-soft)",
    pulseSeconds: 1.6,
    heatLevel: 0.4,
    waveform: "tense",
  },
  degraded: {
    label: "Degraded",
    description: "Responses are slowing. Thermal expansion, controlled tension.",
    signalColor: "var(--color-status-degraded-bold)",
    softColor: "var(--color-status-degraded-soft)",
    pulseSeconds: 2.4,
    heatLevel: 0.6,
    waveform: "tense",
  },
  down: {
    label: "Down",
    description:
      "Outage confirmed. A precise flare, an alert on its way. No chaos.",
    signalColor: "var(--color-status-down-bold)",
    softColor: "var(--color-status-down-soft)",
    pulseSeconds: 1.2,
    heatLevel: 1,
    waveform: "spike",
  },
  recovering: {
    label: "Recovering",
    description: "Checks are passing again. The temperature falls.",
    signalColor: "var(--color-status-recovering-bold)",
    softColor: "var(--color-status-recovering-soft)",
    pulseSeconds: 2.8,
    heatLevel: 0.32,
    waveform: "calm",
  },
  maintenance: {
    label: "Maintenance",
    description: "Planned work in progress. Calm, deliberate, no alarm.",
    signalColor: "var(--color-status-maintenance-bold)",
    softColor: "var(--color-status-maintenance-soft)",
    pulseSeconds: 4.2,
    heatLevel: 0.12,
    waveform: "calm",
  },
};

export const thermalStackJourney: ThermalStackState[] = [
  "operational",
  "verifying",
  "degraded",
  "down",
  "recovering",
  "operational",
];
