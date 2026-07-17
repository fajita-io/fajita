/**
 * Deterministic fixtures for /internal/scale-lab.
 * Fake organizations, partners, costs. Never production data.
 */

export const SCALE_LAB_FIXTURES = {
  notEligibleGate: {
    gateStatus: "not_eligible",
    reason: "Phase 18 Not Ready + Phase 19 inactive",
  },
  eligibleLimitedGate: {
    gateStatus: "eligible_limited",
    reason: "Fixture only: would require cleared blockers",
  },
  organicHighQuality: {
    channel: "organic_search",
    paid: 10,
    activated: 8,
    day7: 6,
    refundsCents: 0,
  },
  organicHighTrafficLowQuality: {
    channel: "organic_search",
    visitors: 50000,
    paid: 3,
    activated: 1,
    day7: 0,
  },
  affiliateHighRetention: {
    affiliateId: "aff_fixture_good",
    activated: 10,
    day7: 9,
    day30: 7,
    refundRate: 0.05,
  },
  affiliateHighRefund: {
    affiliateId: "aff_fixture_refund",
    activated: 8,
    day7: 2,
    refundRate: 0.45,
  },
  referralCohort: {
    referralCode: "fjref_fixture_01",
    signups: 5,
    paid: 2,
    activated: 2,
    day7: 2,
  },
  referralAbuse: {
    referralCode: "fjref_fixture_abuse",
    selfReferralAttempts: 3,
    duplicateAttempts: 2,
  },
  paidSearchCohort: {
    campaignKey: "fixture-paused-paid-search",
    spendCents: 42000,
    activated: 2,
    day7: 1,
  },
  paidSocialPoorFit: {
    campaignKey: "fixture-paid-social-reject",
    spendCents: 250000,
    activated: 4,
    day7: 1,
    supportContacts: 22,
  },
  newsletterSponsorship: {
    partnerId: "partner_fixture_proposed",
    costCents: 50000,
  },
  partnerLaunch: {
    expectedVisits: 8000,
    expectedSignups: 120,
    expectedPaid: 8,
  },
  marketplaceListing: {
    platform: "Fixture Directory",
    status: "researching",
  },
  productLaunchSpike: {
    peakVisitsPerMinute: 400,
    supportSpike: 40,
  },
  capacityWarning: {
    resourceKey: "worker_utilization",
    level: "warning",
  },
  workerSaturation: {
    resourceKey: "worker_utilization",
    level: "critical",
  },
  databaseSaturation: {
    resourceKey: "database_cpu",
    level: "scale",
  },
  supportBacklog: {
    openConversations: 45,
    oldestHours: 72,
  },
  costSpike: {
    metric: "resend.month_to_date",
    baselineCents: 12000,
    currentCents: 48000,
  },
  strongPayback: {
    paybackMonths: 2.4,
  },
  weakPayback: {
    paybackMonths: null,
    reason: "Contribution non-positive",
  },
  hiringTrigger: {
    triggerKey: "support_backlog_unsafe",
    satisfied: false,
  },
  concentrationRisk: {
    channelShareOfNewMrr: 0.82,
    channel: "affiliates",
  },
  fraudEvent: {
    type: "affiliate_self_referral",
    status: "review",
  },
  pausedCampaign: {
    id: "camp_fixture_paused",
    status: "paused",
  },
} as const;

export type ScaleLabFixtureKey = keyof typeof SCALE_LAB_FIXTURES;
