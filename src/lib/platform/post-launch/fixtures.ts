/**
 * Deterministic Phase 19 fixtures. Fake identities and example domains only.
 * Never treat as live customer data.
 */

export const POST_LAUNCH_FIXTURE_VERSION = "phase19-fixtures-v1";

export const POST_LAUNCH_FIXTURES = {
  cohorts: [
    {
      id: "cohort_launch_week",
      name: "Launch-week cohort",
      definition: "Organizations created during Stage 0 launch week",
      startDate: "2026-07-17",
      endDate: "2026-07-24",
      acquisitionSource: "direct",
      productVersion: "0.19.0",
      onboardingVersion: "onboarding-v1",
      pricingVersion: "catalog-v1",
      dataCompleteness: "fixture" as const,
    },
    {
      id: "cohort_organic",
      name: "Organic-launch cohort",
      definition: "Content or docs originated signups",
      startDate: "2026-07-17",
      endDate: null,
      acquisitionSource: "organic",
      productVersion: "0.19.0",
      onboardingVersion: "onboarding-v1",
      pricingVersion: "catalog-v1",
      dataCompleteness: "fixture" as const,
    },
  ],
  organizations: [
    {
      id: "11111111-1919-4000-8000-000000000001",
      name: "Launch Week Labs",
      segment: "solo_founder",
      state: "activated",
      acquisitionSource: "direct",
      plan: "pro",
    },
    {
      id: "11111111-1919-4000-8000-000000000002",
      name: "Setup Stall Co",
      segment: "solo_founder",
      state: "setup_stalled",
      acquisitionSource: "organic",
      plan: "starter",
    },
    {
      id: "11111111-1919-4000-8000-000000000003",
      name: "Retained Pulse LLC",
      segment: "small_engineering",
      state: "retained",
      acquisitionSource: "affiliate",
      plan: "business",
    },
    {
      id: "11111111-1919-4000-8000-000000000004",
      name: "Canceled Example Inc",
      segment: "ecommerce",
      state: "canceled",
      acquisitionSource: "comparison",
      plan: "starter",
    },
  ],
  bugs: [
    {
      id: "BUG-19001",
      title: "Monitor test error copy unclear for JSON path",
      severity: "high" as const,
      productArea: "monitors",
      status: "confirmed",
      isRegression: true,
      organizationsAffected: 1,
      summary: "Operators cannot tell which assertion failed during monitor test.",
    },
    {
      id: "BUG-19002",
      title: "Status page preview spacing drift on mobile",
      severity: "low" as const,
      productArea: "status_pages",
      status: "prioritized",
      isRegression: false,
      organizationsAffected: 0,
      summary: "Cosmetic padding issue on 360px width.",
    },
  ],
  feedback: [
    {
      id: "FB-19001",
      sanitizedSummary: "Wants clearer next step after first successful check",
      source: "onboarding_feedback",
      categories: ["usability_issue", "documentation_gap"],
      productArea: "onboarding",
      status: "triaged",
    },
    {
      id: "FB-19002",
      sanitizedSummary: "Praised calm incident language on status page",
      source: "support_handoff",
      categories: ["positive_feedback", "testimonial_candidate"],
      productArea: "status_pages",
      status: "new",
    },
  ],
  requests: [
    {
      id: "REQ-19001",
      capability: "SMS alert channel",
      underlyingProblem: "Need phone alerts when on call without Slack",
      status: "researching",
      frequency: 3,
      mrrRepresentedCents: 5700,
      strategicFit: 2,
    },
    {
      id: "REQ-19002",
      capability: "Text-message notifications",
      underlyingProblem: "Need phone alerts when on call without Slack",
      status: "new",
      frequency: 1,
      mrrRepresentedCents: 900,
      strategicFit: 2,
      relatedRequestId: "REQ-19001",
    },
    {
      id: "REQ-19003",
      capability: "Browser synthetic monitoring",
      underlyingProblem: "Want full page render checks",
      status: "rejected",
      frequency: 2,
      mrrRepresentedCents: 1900,
      strategicFit: 1,
      decisionReason: "Conflicts with lightweight HTTP/API/cron positioning; too complex for value",
    },
  ],
  experiments: [
    {
      id: "EXP-19001",
      name: "First-monitor next step",
      status: "proposed",
      riskClass: "low",
      hypothesis: "Clear post-test CTA increases monitor activation",
      primaryMetric: "monitor_activated_rate",
    },
    {
      id: "EXP-19002",
      name: "Alert setup sequencing",
      status: "paused",
      riskClass: "medium",
      hypothesis: "Prompt after first scheduled check improves alert verification",
      primaryMetric: "alert_channel_verified_rate",
      stopReason: "Stabilization freeze; not started while intensive_72h active",
    },
  ],
  interviews: [
    {
      id: "INT-19001",
      candidateOrgId: "11111111-1919-4000-8000-000000000002",
      status: "candidate",
      criteria: "setup_stalled",
      consentRecording: null,
      consentQuote: null,
    },
  ],
  advocacy: [
    {
      id: "ADV-19001",
      orgId: "11111111-1919-4000-8000-000000000003",
      type: "testimonial",
      status: "eligible",
      quoteApproved: false,
    },
  ],
  activationFunnel: [
    { step: "account_created", count: 40, completeness: "fixture" as const },
    { step: "organization_created", count: 36, completeness: "fixture" as const },
    { step: "monitor_test_passed", count: 22, completeness: "fixture" as const },
    { step: "monitor_activated", count: 18, completeness: "fixture" as const },
    { step: "first_scheduled_result", count: 16, completeness: "fixture" as const },
    { step: "alert_connected", count: 9, completeness: "fixture" as const },
    { step: "status_page_published", count: 5, completeness: "fixture" as const },
    { step: "full_activation", count: 4, completeness: "fixture" as const },
  ],
  retention: {
    day1: 0.72,
    day7: 0.48,
    day14: 0.41,
    day30: 0.33,
    completeness: "fixture" as const,
  },
  churn: {
    voluntary: 2,
    involuntary: 1,
    reasons: [
      { reason: "difficult_setup", count: 1 },
      { reason: "too_expensive", count: 1 },
      { reason: "payment_failure", count: 1 },
    ],
    completeness: "fixture" as const,
  },
} as const;

export function dedupeRequestKey(capability: string, underlyingProblem: string): string {
  return `${capability.trim().toLowerCase()}|${underlyingProblem.trim().toLowerCase()}`;
}

export function findDuplicateRequests(
  requests: ReadonlyArray<{
    id: string;
    capability: string;
    underlyingProblem: string;
  }>,
): Array<{ primaryId: string; duplicateId: string }> {
  const seen = new Map<string, string>();
  const dupes: Array<{ primaryId: string; duplicateId: string }> = [];
  for (const req of requests) {
    const key = dedupeRequestKey(req.capability, req.underlyingProblem);
    // Related SMS / text-message variants share underlying problem.
    const problemKey = req.underlyingProblem.trim().toLowerCase();
    const existingByProblem = [...seen.entries()].find(([k]) =>
      k.endsWith(`|${problemKey}`),
    );
    if (existingByProblem && existingByProblem[1] !== req.id) {
      dupes.push({
        primaryId: existingByProblem[1],
        duplicateId: req.id,
      });
      continue;
    }
    if (seen.has(key)) {
      dupes.push({ primaryId: seen.get(key)!, duplicateId: req.id });
    } else {
      seen.set(key, req.id);
    }
  }
  return dupes;
}
