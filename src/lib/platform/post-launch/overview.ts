import { evaluateGuardedAction } from "./guards";
import { POST_LAUNCH_FIXTURES } from "./fixtures";
import { evaluatePhase19Prerequisites } from "./prerequisites";
import { getStabilizationWindow } from "./stabilization";

export function loadPostLaunchOverview() {
  const authorization = evaluatePhase19Prerequisites();
  const stabilization = getStabilizationWindow();
  const fixtures = POST_LAUNCH_FIXTURES;

  return {
    authorization,
    stabilization,
    completeness: "fixture" as const,
    fixtureVersion: "phase19-fixtures-v1",
    productStability: {
      note: "Live incident and queue metrics remain on Phase 17 ops surfaces.",
      openHighBugs: fixtures.bugs.filter((b) => b.severity === "high").length,
      openLowBugs: fixtures.bugs.filter((b) => b.severity === "low").length,
    },
    activation: {
      funnel: fixtures.activationFunnel,
      medianTimeToFirstValueLabel: "incomplete (fixture)",
    },
    retention: fixtures.retention,
    churn: fixtures.churn,
    customerVoice: {
      feedback: fixtures.feedback.length,
      bugs: fixtures.bugs.length,
      requests: fixtures.requests.length,
      interviews: fixtures.interviews.length,
    },
    decisions: {
      activeExperiments: fixtures.experiments.filter((e) =>
        ["running", "scheduled"].includes(e.status),
      ).length,
      awaitingApproval: fixtures.experiments.filter((e) => e.status === "proposed")
        .length,
      highSeverityBugs: fixtures.bugs.filter((b) => b.severity === "high")
        .length,
      topFriction: "JSON-path monitor test errors (fixture)",
    },
    guards: {
      startExperiment: evaluateGuardedAction("start_experiment"),
      changeOnboarding: evaluateGuardedAction("change_onboarding"),
      changePricing: evaluateGuardedAction("change_pricing"),
      increaseTraffic: evaluateGuardedAction("increase_traffic"),
    },
    cohorts: fixtures.cohorts,
    bugs: fixtures.bugs,
    feedback: fixtures.feedback,
    requests: fixtures.requests,
    experiments: fixtures.experiments,
  };
}
