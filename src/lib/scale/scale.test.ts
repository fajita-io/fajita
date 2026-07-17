import { describe, expect, it } from "vitest";

import {
  assertScaleActionAllowed,
  buildCampaignUrl,
  canEnterStage,
  canLaunchCampaign,
  computeCac,
  computePayback,
  computeRetainedRevenue,
  evaluateReferralEligibility,
  evaluateScaleReadiness,
  evaluateThreshold,
  FIXTURE_CAMPAIGNS,
  getCurrentScaleStage,
  gateStatusLabel,
  resolveAttributionConflict,
  runScenarioForecast,
  defaultScenarioInputs,
  validateAttributionParams,
  CAPACITY_THRESHOLDS,
  CHANNEL_INVENTORY,
  SCALE_STAGES,
  LIFETIME_DEAL_DECISION,
} from "@/lib/scale";

describe("Phase 20 scale readiness", () => {
  it("blocks scale while Phase 18 is Not Ready and Phase 19 inactive", () => {
    const readiness = evaluateScaleReadiness();
    expect(readiness.gateStatus).toBe("not_eligible");
    expect(readiness.phase19StabilizationActive).toBe(false);
    expect(readiness.canIncreasePaidTraffic).toBe(false);
    expect(readiness.canAdvancePastStage0).toBe(false);
    expect(readiness.blockers.some((b) => b.id === "SB-001")).toBe(true);
    expect(readiness.blockers.some((b) => b.id === "SB-002")).toBe(true);
    expect(gateStatusLabel(readiness.gateStatus)).toBe("Not eligible");
  });

  it("keeps current stage at baseline Stage 0", () => {
    const stage = getCurrentScaleStage();
    expect(stage.stage).toBe(0);
    expect(stage.key).toBe("baseline");
    expect(SCALE_STAGES).toHaveLength(5);
    expect(canEnterStage("limited_validation").allowed).toBe(false);
  });

  it("blocks campaign launch and partner actions", () => {
    const gate = assertScaleActionAllowed("campaign.launch");
    expect(gate.allowed).toBe(false);
    const campaign = FIXTURE_CAMPAIGNS.find((c) => c.status === "paused")!;
    const launch = canLaunchCampaign({
      ...campaign,
      status: "approved",
      capacityReviewed: true,
      supportReviewed: true,
      claimsReviewed: true,
    });
    expect(launch.allowed).toBe(false);
  });
});

describe("retained revenue and CAC", () => {
  it("computes net retained MRR movement and labels immature Day-30", () => {
    const result = computeRetainedRevenue({
      newPaidMrrCents: 10_000,
      activatedNewMrrCents: 8_000,
      day7RetainedNewMrrCents: 6_000,
      day30RetainedNewMrrCents: null,
      expansionMrrCents: 1_000,
      reactivationMrrCents: 0,
      contractionMrrCents: 500,
      churnedMrrCents: 1_000,
      channelRetainedMrrCents: { organic_search: 6_000 },
      cohortDate: "2026-07-01",
      completeness: "partial",
      day30Available: false,
    });
    expect(result.netRetainedMrrMovementCents).toBe(5500);
    expect(result.day30RetainedNewMrrCents).toBeNull();
    expect(result.meta.immatureCohort).toBe(true);
  });

  it("uses activated orgs not signups as CAC denominator", () => {
    const cac = computeCac({
      eligibleChannelCostCents: 100_000,
      activatedPaidOrganizations: 4,
      day7RetainedOrganizations: 2,
      day30RetainedOrganizations: null,
      fullyLoadedCostCents: 120_000,
      cohortDate: "2026-07-01",
      channel: "organic_search",
      completeness: "partial",
      costAllocationMethod: "direct",
    });
    expect(cac.directActivatedCacCents).toBe(25_000);
    expect(cac.fullyLoadedActivatedCacCents).toBe(30_000);
    expect(cac.day7RetainedCacCents).toBe(50_000);
    expect(cac.meta.label).toContain("Signups are not the denominator");
  });

  it("labels payback as estimate and rejects zero contribution", () => {
    const payback = computePayback({
      cacCents: 50_000,
      expectedMonthlyContributionCents: 0,
      cohortDate: "2026-07-01",
      completeness: "partial",
      includedCosts: ["fees"],
      excludedCosts: ["overhead"],
      assumptions: ["flat contribution"],
    });
    expect(payback.paybackMonths).toBeNull();
    expect(payback.isEstimate).toBe(true);
  });
});

describe("campaigns and attribution", () => {
  it("allowlists campaign params and blocks open redirects", () => {
    expect(
      validateAttributionParams({ utm_source: "newsletter", email: "a@b.c" }).ok,
    ).toBe(false);
    const bad = buildCampaignUrl({
      basePath: "https://evil.example",
      source: "x",
      medium: "y",
      campaign: "z",
      siteOrigin: "https://fajita.io",
    });
    expect(bad.errors.length).toBeGreaterThan(0);
    const good = buildCampaignUrl({
      basePath: "/pricing",
      source: "newsletter",
      medium: "sponsorship",
      campaign: "test",
      siteOrigin: "https://fajita.io",
    });
    expect(good.errors).toEqual([]);
    expect(good.url).toContain("utm_campaign=test");
  });
});

describe("referrals", () => {
  it("blocks early prompts and self-referral", () => {
    const eligibility = evaluateReferralEligibility({
      coreActivated: true,
      accountAgeDays: 2,
      minAccountAgeDays: 14,
      billingHealthy: true,
      securityRestricted: false,
      unresolvedSevereSupport: false,
      satisfactionSignal: "positive",
      realProductUsage: true,
      activeIncident: false,
      paymentFailure: false,
      cancellationInProgress: false,
    });
    expect(eligibility.eligible).toBe(false);

    const conflict = resolveAttributionConflict({
      isSelfReferral: true,
      alreadyAttributed: false,
      affiliateLocked: false,
      windowExpired: false,
    });
    expect(conflict.acceptReferral).toBe(false);
    expect(conflict.conflict).toBe("self_referral");
  });

  it("defers to locked affiliate attribution without creating commissions", () => {
    const conflict = resolveAttributionConflict({
      isSelfReferral: false,
      alreadyAttributed: false,
      affiliateLocked: true,
      windowExpired: false,
    });
    expect(conflict.acceptReferral).toBe(false);
    expect(conflict.conflict).toBe("affiliate_locked");
  });
});

describe("capacity and channels", () => {
  it("classifies threshold levels", () => {
    const base = CAPACITY_THRESHOLDS[0]!;
    expect(evaluateThreshold({ ...base, currentUsage: 0 })).toBe("normal");
    expect(
      evaluateThreshold({ ...base, currentUsage: base.warningThreshold }),
    ).toBe("warning");
    expect(
      evaluateThreshold({ ...base, currentUsage: base.criticalThreshold }),
    ).toBe("critical");
  });

  it("keeps paid social rejected and paid search paused at Stage 0", () => {
    expect(CHANNEL_INVENTORY.find((c) => c.key === "paid_social")?.state).toBe(
      "rejected",
    );
    expect(CHANNEL_INVENTORY.find((c) => c.key === "paid_search")?.state).toBe(
      "paused",
    );
  });
});

describe("forecast and lifetime deal", () => {
  it("runs scenario forecasts with disclaimer", () => {
    const result = runScenarioForecast(
      "conservative",
      defaultScenarioInputs("conservative"),
    );
    expect(result.outputs.label).toBe("forecast");
    expect(result.outputs.disclaimer).toContain("Not guaranteed");
  });

  it("defaults to no lifetime deal", () => {
    expect(LIFETIME_DEAL_DECISION.decision).toBe("No lifetime deal");
  });
});
