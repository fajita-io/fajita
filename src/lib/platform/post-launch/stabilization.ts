/**
 * Formal post-launch stabilization window.
 * Until launch is authorized and observation starts, phase remains pre_launch.
 */

import { buildGoLiveApproval } from "@/lib/platform/readiness";

import { evaluatePhase19Prerequisites } from "./prerequisites";
import type { StabilizationPhase, StabilizationWindow } from "./types";

const PHASE_LABELS: Record<StabilizationPhase, string> = {
  pre_launch: "Pre-launch (Phase 19 blocked)",
  intensive_72h: "First 72 hours: intensive stabilization",
  launch_14d: "First 14 days: launch stabilization",
  controlled_30d: "First 30 days: controlled learning",
  normal: "After 30 days: normal experimentation eligibility",
};

export function resolveStabilizationPhase(opts?: {
  launchStartedAt?: string | null;
  now?: Date;
  authorized?: boolean;
}): StabilizationPhase {
  const authorized =
    opts?.authorized ??
    evaluatePhase19Prerequisites().authorization !== "blocked";
  const started = opts?.launchStartedAt ?? buildGoLiveApproval().launchDate;
  if (!authorized || !started) {
    return "pre_launch";
  }

  const now = opts?.now ?? new Date();
  const start = new Date(started);
  const elapsedMs = now.getTime() - start.getTime();
  const hours = elapsedMs / (1000 * 60 * 60);
  const days = hours / 24;

  if (hours < 72) return "intensive_72h";
  if (days < 14) return "launch_14d";
  if (days < 30) return "controlled_30d";
  return "normal";
}

export function getStabilizationWindow(opts?: {
  launchStartedAt?: string | null;
  now?: Date;
}): StabilizationWindow {
  const prereq = evaluatePhase19Prerequisites();
  const authorized = prereq.authorization !== "blocked";
  const phase = resolveStabilizationPhase({
    ...opts,
    authorized,
  });

  const changeFreeze = phase === "pre_launch" || phase === "intensive_72h";
  const experimentsEligible = phase === "normal";
  const trafficExpansionEligible =
    authorized &&
    (phase === "controlled_30d" || phase === "normal") &&
    prereq.authorization === "authorized";

  const notes: string[] = [];
  if (phase === "pre_launch") {
    notes.push(
      "Phase 18 is not authorized for public launch. Stabilization clock has not started.",
    );
    notes.push(
      "Do not compare launch-day metrics to mature benchmarks until baselines exist after Stage 2.",
    );
  }
  if (phase === "intensive_72h") {
    notes.push("Freeze noncritical product changes. Review platform health continuously during operating hours.");
  }
  if (phase === "launch_14d") {
    notes.push(
      "Prioritize defects and confusion. Avoid major conversion experiments, pricing changes, and onboarding rewrites.",
    );
  }
  if (phase === "controlled_30d") {
    notes.push(
      "Establish baselines, interview customers, resolve launch regressions, prepare first controlled experiments.",
    );
  }
  if (phase === "normal") {
    notes.push(
      "Experiments eligible when registry, approval, and guardrails are in place.",
    );
  }

  return {
    phase,
    phaseLabel: PHASE_LABELS[phase],
    changeFreeze,
    experimentsEligible,
    trafficExpansionEligible,
    notes,
  };
}
