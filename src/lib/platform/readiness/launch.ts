/**
 * Launch-day command center model. Read-only metrics surface; pause actions
 * require existing platform permissions and are not automated here.
 */

import { BILLING_ENFORCEMENT_ENABLED } from "@/lib/billing/enforcement";

import { LAUNCH_BLOCKERS, openCriticalBlockers, openHighBlockers } from "./blockers";
import { buildGoLiveApproval, computeClassification, classificationLabel } from "./classification";
import { READINESS_GATES } from "./gates";

export type LaunchStage = "none" | "stage_0" | "stage_1" | "stage_2" | "stage_3";

export const LAUNCH_STOP_CONDITIONS = [
  {
    id: "STOP-TENANT",
    title: "Cross-tenant access confirmed",
    severity: "critical" as const,
  },
  {
    id: "STOP-SECRET",
    title: "Active secret exposure",
    severity: "critical" as const,
  },
  {
    id: "STOP-SSRF",
    title: "SSRF bypass to restricted network",
    severity: "critical" as const,
  },
  {
    id: "STOP-BILL-DUP",
    title: "Duplicate subscription or incorrect entitlement grant",
    severity: "critical" as const,
  },
  {
    id: "STOP-WEBHOOK",
    title: "Lost billing webhook events affecting customers",
    severity: "critical" as const,
  },
  {
    id: "STOP-QUEUE",
    title: "Monitoring scheduler backlog above threshold",
    severity: "critical" as const,
  },
  {
    id: "STOP-ALERT",
    title: "Alert delivery below threshold",
    severity: "critical" as const,
  },
  {
    id: "STOP-STATUS",
    title: "Public status-page outage",
    severity: "critical" as const,
  },
  {
    id: "STOP-BACKUP",
    title: "Database backup failure",
    severity: "critical" as const,
  },
  {
    id: "STOP-ROLLBACK",
    title: "Production rollback unavailable",
    severity: "critical" as const,
  },
] as const;

export const FEATURE_FLAG_LAUNCH_PLAN = [
  {
    flag: "signup_public",
    default: false,
    owner: "operations",
    stopMetric: "error_rate_signup",
  },
  {
    flag: "checkout_paid",
    default: false,
    owner: "billing",
    stopMetric: "payment_failure_rate",
  },
  {
    flag: "generic_webhooks",
    default: true,
    owner: "engineering",
    stopMetric: "webhook_dead_letter_rate",
  },
  {
    flag: "custom_domains",
    default: false,
    owner: "operations",
    stopMetric: "domain_provision_failure",
  },
  {
    flag: "affiliate_applications",
    default: false,
    owner: "billing",
    stopMetric: "affiliate_fraud_queue",
  },
  {
    flag: "pamphlet_account_tools",
    default: true,
    owner: "support",
    stopMetric: "support_isolation_incident",
  },
] as const;

export function getLaunchCommandCenterModel() {
  const approval = buildGoLiveApproval();
  const classification = computeClassification();

  return {
    stage: approval.launchStage as LaunchStage,
    classification,
    classificationLabel: classificationLabel(classification),
    startTime: null as string | null,
    owner: "founder",
    billingEnforcementEnabled: BILLING_ENFORCEMENT_ENABLED,
    openCriticalBlockers: openCriticalBlockers(),
    openHighBlockers: openHighBlockers(),
    openBlockers: LAUNCH_BLOCKERS.filter(
      (b) => b.status === "open" || b.status === "mitigating",
    ),
    stopConditions: LAUNCH_STOP_CONDITIONS,
    featureFlags: FEATURE_FLAG_LAUNCH_PLAN,
    gateFailures: READINESS_GATES.filter(
      (g) =>
        g.blocking &&
        (g.status === "failed" || g.status === "not_started" || g.status === "blocked"),
    ),
    approval,
    actions: [
      {
        id: "pause_signup",
        label: "Pause signup",
        href: "/internal/feature-flags",
        requires: "platform.flags.rollback",
      },
      {
        id: "pause_checkout",
        label: "Pause checkout",
        href: "/internal/feature-flags",
        requires: "platform.flags.rollback",
      },
      {
        id: "open_incident",
        label: "Open internal incident",
        href: "/internal/operations/incidents",
        requires: "platform.incidents.read",
      },
      {
        id: "status_draft",
        label: "Status update draft",
        href: "/internal/status-pages",
        requires: "platform.status_pages.read",
      },
      {
        id: "rollback",
        label: "Rollback runbook",
        href: "/internal/releases",
        requires: "platform.releases.read",
      },
    ] as const,
    metricsNote:
      "Live signup/payment/queue metrics load from Phase 17 read models when available. Until Stage 0 starts, volumes are intentionally null.",
  };
}
