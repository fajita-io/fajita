import { evaluateGuardedAction } from "./guards";
import { POST_LAUNCH_FIXTURES } from "./fixtures";

export type ExperimentStatus =
  | "proposed"
  | "designing"
  | "awaiting_review"
  | "approved"
  | "scheduled"
  | "running"
  | "paused"
  | "stopped_early"
  | "completed"
  | "analyzing"
  | "adopted"
  | "rejected"
  | "inconclusive"
  | "archived";

const STARTABLE: ExperimentStatus[] = ["approved", "scheduled", "paused"];

export function listExperiments() {
  return POST_LAUNCH_FIXTURES.experiments.map((e) => ({
    ...e,
    completeness: "fixture" as const,
  }));
}

/**
 * Transition an experiment toward running. Refuses during Phase 19 block or
 * stabilization freeze. Does not mutate persistence yet (fixture registry).
 */
export function attemptStartExperiment(experimentId: string): {
  ok: boolean;
  status?: ExperimentStatus;
  reason: string;
} {
  const guard = evaluateGuardedAction("start_experiment");
  if (!guard.allowed) {
    return { ok: false, reason: guard.reason };
  }

  const experiment = POST_LAUNCH_FIXTURES.experiments.find(
    (e) => e.id === experimentId,
  );
  if (!experiment) {
    return { ok: false, reason: `Unknown experiment ${experimentId}` };
  }

  if (!STARTABLE.includes(experiment.status as ExperimentStatus)) {
    return {
      ok: false,
      reason: `Experiment ${experimentId} status ${experiment.status} is not startable`,
    };
  }

  return {
    ok: true,
    status: "running",
    reason: "Start permitted. Persist via experiment registry when wired to DB.",
  };
}
