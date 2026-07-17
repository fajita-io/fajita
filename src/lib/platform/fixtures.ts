/**
 * Deterministic fixtures for /internal/operations-lab.
 * Fake identifiers only. Never production customer data.
 */

export const OPS_LAB_FIXTURES = {
  healthyOrganization: {
    id: "11111111-1111-4111-8111-111111111101",
    name: "Northwind Demo Co",
    health: "healthy",
    plan: "pro",
    mrrCents: 4900,
  },
  setupStalledOrganization: {
    id: "11111111-1111-4111-8111-111111111102",
    name: "Lagoon Startup",
    health: "setup_stalled",
    plan: "starter",
    mrrCents: 1900,
  },
  atRiskOrganization: {
    id: "11111111-1111-4111-8111-111111111103",
    name: "Amber Systems",
    health: "at_risk",
    plan: "business",
    mrrCents: 19900,
  },
  paymentRestrictedOrganization: {
    id: "11111111-1111-4111-8111-111111111104",
    name: "Past Due LLC",
    health: "payment_issue",
    plan: "pro",
    mrrCents: 4900,
  },
  workerOffline: {
    id: "worker_fixture_offline",
    region: "iad",
    lastHeartbeatAt: "2026-07-01T00:00:00.000Z",
  },
  regionDegraded: {
    region: "sfo",
    state: "degraded",
    successRate: 0.91,
  },
  alertDeadLetter: {
    id: "dl_fixture_001",
    channel: "slack",
    failureCategory: "invalid_credentials",
    attempts: 8,
  },
  securityEvent: {
    id: "sec_fixture_001",
    type: "ssrf_block",
    severity: "high",
    status: "new",
  },
  approvalRequest: {
    id: "appr_fixture_001",
    type: "feature_flag.rollout",
    risk: "high",
    state: "submitted",
  },
  costAnomaly: {
    id: "cost_fixture_001",
    metric: "resend.month_to_date",
    baselineCents: 12000,
    currentCents: 48000,
  },
} as const;

export type OpsLabFixtureKey = keyof typeof OPS_LAB_FIXTURES;
