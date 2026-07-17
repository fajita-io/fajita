import { CAPACITY_THRESHOLDS, evaluateThreshold, PROVIDER_CAPACITY } from "./capacity";
import { buildFixtureScorecards, CHANNEL_INVENTORY, channelsByState } from "./channels";
import { FIXTURE_CAMPAIGNS } from "./campaigns";
import { HIRING_TRIGGERS } from "./hiring";
import { computeRetainedRevenue } from "./metrics";
import { FIXTURE_PARTNERS } from "./partners";
import { evaluateScaleReadiness, gateStatusLabel } from "./readiness";
import { getCurrentScaleStage } from "./stages";

export function loadScaleOverview() {
  const readiness = evaluateScaleReadiness();
  const stage = getCurrentScaleStage();
  const scorecards = buildFixtureScorecards();

  const retained = computeRetainedRevenue({
    newPaidMrrCents: 0,
    activatedNewMrrCents: 0,
    day7RetainedNewMrrCents: 0,
    day30RetainedNewMrrCents: null,
    expansionMrrCents: 0,
    reactivationMrrCents: 0,
    contractionMrrCents: 0,
    churnedMrrCents: 0,
    channelRetainedMrrCents: {},
    cohortDate: new Date().toISOString().slice(0, 10),
    completeness: "unavailable",
    day30Available: false,
  });

  const capacity = CAPACITY_THRESHOLDS.map((t) => ({
    ...t,
    level: evaluateThreshold(t),
  }));

  return {
    readiness,
    gateLabel: gateStatusLabel(readiness.gateStatus),
    stage,
    retainedGrowth: retained,
    liveRetainedEvidence: "unavailable" as const,
    channels: {
      inventory: CHANNEL_INVENTORY,
      validating: channelsByState("validating"),
      repeatable: channelsByState("repeatable"),
      scaling: channelsByState("scaling"),
      paused: channelsByState("paused"),
      rejected: channelsByState("rejected"),
      scorecards,
    },
    campaigns: {
      active: FIXTURE_CAMPAIGNS.filter((c) => c.status === "active"),
      paused: FIXTURE_CAMPAIGNS.filter((c) => c.status === "paused"),
      all: FIXTURE_CAMPAIGNS,
    },
    partners: FIXTURE_PARTNERS,
    capacity,
    providers: PROVIDER_CAPACITY,
    hiring: HIRING_TRIGGERS,
    attention: [
      ...readiness.blockers.map((b) => `${b.id}: ${b.title}`),
      ...channelsByState("paused").map((c) => `Paused channel: ${c.name}`),
      ...HIRING_TRIGGERS.filter((t) => t.satisfied).map(
        (t) => `Hiring trigger satisfied: ${t.label}`,
      ),
      ...capacity
        .filter((c) => c.level !== "normal")
        .map((c) => `Capacity ${c.level}: ${c.label}`),
    ],
    deepLinks: [
      { href: "/internal/revenue", label: "Revenue" },
      { href: "/internal/customers", label: "Customers" },
      { href: "/internal/product/usage", label: "Product usage" },
      { href: "/internal/affiliates", label: "Affiliates" },
      { href: "/internal/support", label: "Support" },
      { href: "/internal/content", label: "Content" },
      { href: "/internal/security", label: "Security" },
      { href: "/internal/infrastructure", label: "Infrastructure" },
      { href: "/internal/costs", label: "Costs" },
      { href: "/internal/approvals", label: "Approvals" },
      { href: "/internal/reports", label: "Reports" },
      { href: "/internal/readiness", label: "Phase 18 readiness" },
    ],
  };
}
