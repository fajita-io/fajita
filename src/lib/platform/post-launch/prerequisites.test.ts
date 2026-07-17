import { describe, expect, it } from "vitest";

import {
  attemptStartExperiment,
  evaluateGuardedAction,
  evaluatePhase19Prerequisites,
  findDuplicateRequests,
  getStabilizationWindow,
  isPhase19GrowthAuthorized,
  POST_LAUNCH_FIXTURES,
  POST_LAUNCH_ROUTES,
  resolveStabilizationPhase,
} from "@/lib/platform/post-launch";
import {
  computeClassification,
  buildGoLiveApproval,
} from "@/lib/platform/readiness";

describe("Phase 19 after Stage-0 authorization", () => {
  it("authorizes Phase 19 when Phase 18 is Conditionally Ready", () => {
    expect(computeClassification()).toBe("conditionally_ready");
    expect(buildGoLiveApproval().launchStage).toBe("stage_0");
    const result = evaluatePhase19Prerequisites("2026-07-17T23:45:00.000Z");
    expect(result.authorization).toBe("conditionally_authorized");
    expect(isPhase19GrowthAuthorized(result)).toBe(true);
    expect(result.failedCritical).toHaveLength(0);
  });

  it("keeps intensive stabilization freeze for launch day", () => {
    const window = getStabilizationWindow({
      launchStartedAt: "2026-07-17",
      now: new Date("2026-07-17T20:00:00.000Z"),
    });
    expect(window.phase).toBe("intensive_72h");
    expect(window.changeFreeze).toBe(true);
    expect(window.experimentsEligible).toBe(false);
    expect(evaluateGuardedAction("start_experiment").allowed).toBe(false);
    expect(attemptStartExperiment("EXP-19001").ok).toBe(false);
  });

  it("registers post-launch routes and fixture inventory", () => {
    expect(POST_LAUNCH_ROUTES).toHaveLength(14);
    expect(POST_LAUNCH_FIXTURES.bugs.length).toBeGreaterThan(0);
    expect(POST_LAUNCH_FIXTURES.experiments.length).toBeGreaterThan(0);
  });

  it("dedupes related SMS / text-message requests by underlying problem", () => {
    const dupes = findDuplicateRequests([...POST_LAUNCH_FIXTURES.requests]);
    expect(dupes.some((d) => d.duplicateId === "REQ-19002")).toBe(true);
  });

  it("computes later stabilization phases when authorized with start date", () => {
    const start = "2026-07-01T00:00:00.000Z";
    expect(
      resolveStabilizationPhase({
        authorized: true,
        launchStartedAt: start,
        now: new Date("2026-08-15T00:00:00.000Z"),
      }),
    ).toBe("normal");
  });
});
