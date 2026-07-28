import type { LifecycleMessageKey } from "../messages";

/**
 * Deterministic preview fixtures for every lifecycle template. Used by the
 * email preview system, the onboarding lab, and render tests. All values are
 * obviously fictional and labeled as preview data by the preview UI; nothing
 * here is ever sent.
 */
export const LIFECYCLE_EMAIL_FIXTURES: Record<
  LifecycleMessageKey,
  Record<string, unknown>
> = {
  welcome: {},
  setup_reminder: {
    organization_name: "Northwind Labs",
    stage: 1,
  },
  monitor_draft_reminder: {
    organization_name: "Northwind Labs",
    monitor_name: "Marketing site",
    monitor_type: "website",
    monitor_id: "00000000-0000-0000-0000-000000000001",
  },
  first_monitor_live: {
    organization_name: "Northwind Labs",
    monitor_name: "Marketing site",
    monitor_id: "00000000-0000-0000-0000-000000000001",
    check_interval_seconds: 300,
    first_check_status: "success",
    first_check_failed: false,
    first_check_at: "2026-07-06T14:32:00.000Z",
  },
  first_failure_education: {
    organization_name: "Northwind Labs",
    monitor_name: "Payments API",
    monitor_id: "00000000-0000-0000-0000-000000000002",
    failure_category: "timed_out",
  },
  alert_channel_reminder: {
    organization_name: "Northwind Labs",
    active_monitor_count: 2,
  },
  status_page_reminder: {
    organization_name: "Northwind Labs",
  },
  activation_complete: {
    organization_name: "Northwind Labs",
    active_monitor_count: 3,
    verified_channel_count: 1,
    published_status_page_count: 1,
    activated_at: "2026-07-08T09:15:00.000Z",
  },
  weekly_report: {
    organization_name: "Northwind Labs",
    period_label: "July 6 through July 12, 2026",
    report_id: "00000000-0000-0000-0000-000000000010",
    success_rate_label: "99.94%",
    checks_completed: 12_402,
    active_monitors: 6,
    monitors_with_failures: 1,
    incident_count: 1,
    avg_response_ms: 412,
    data_completeness: "complete",
    warnings: ["Certificate for the marketing site expires in 21 days."],
    recommended_actions: [
      "Renew the marketing site certificate before August 2.",
      "Map the Payments API monitor to a public component.",
    ],
  },
  incident_recap: {
    organization_name: "Northwind Labs",
    incident_title: "Checkout API latency",
    incident_id: "00000000-0000-0000-0000-000000000020",
    severity_label: "Major",
    duration_label: "42 minutes",
    started_at: "2026-07-09T03:12:00.000Z",
    resolved_at: "2026-07-09T03:54:00.000Z",
    affected_monitors: ["Checkout API"],
    resolution_summary:
      "Fajita confirmed the incident after two eligible failed checks. Recovery was confirmed after two consecutive successful checks.",
  },
  usage_limit_notice: {
    organization_name: "Northwind Labs",
    limit_key: "active_monitors",
    threshold: 80,
    usage: 8,
    limit: 10,
  },
  cancellation_confirmation: {
    organization_name: "Northwind Labs",
    effective_at: "2026-08-01T00:00:00.000Z",
    active_monitor_count: 6,
    published_status_page_count: 1,
  },
  pre_deletion_reminder: {
    organization_name: "Northwind Labs",
    deletion_scheduled_for: "2026-08-15T00:00:00.000Z",
    stage: "7d",
  },
  reactivation_reminder: {
    organization_name: "Northwind Labs",
    active_monitor_count: 6,
    published_status_page_count: 1,
  },
};
