/**
 * Scale analytics / snapshot jobs. Calculations run out of band, not on
 * customer requests. Idempotent keys required.
 */

export const SCALE_JOBS = [
  {
    key: "channel_quality_snapshots",
    description: "Rebuild channel quality scorecards by cohort",
    cadence: "daily",
  },
  {
    key: "retained_cac",
    description: "Compute activated and retained CAC by channel",
    cadence: "daily",
  },
  {
    key: "payback_estimates",
    description: "Contribution-based payback estimates",
    cadence: "daily",
  },
  {
    key: "campaign_spend_reconciliation",
    description: "Reconcile imported spend vs budget caps",
    cadence: "hourly",
  },
  {
    key: "referral_attribution_reconciliation",
    description: "Reconcile referral attributions vs affiliate locks",
    cadence: "hourly",
  },
  {
    key: "partner_result_snapshots",
    description: "Partner result rollups",
    cadence: "daily",
  },
  {
    key: "content_compounding_snapshots",
    description: "Content activation/retention quality",
    cadence: "daily",
  },
  {
    key: "capacity_forecasts",
    description: "30/90/180/365 day resource forecasts",
    cadence: "daily",
  },
  {
    key: "provider_capacity_checks",
    description: "Provider limit proximity checks",
    cadence: "hourly",
  },
  {
    key: "hiring_trigger_evaluation",
    description: "Evaluate hiring triggers from support/reliability trends",
    cadence: "weekly",
  },
  {
    key: "forecast_variance",
    description: "Actual vs forecast variance",
    cadence: "weekly",
  },
  {
    key: "concentration_risk",
    description: "Channel and partner concentration alerts",
    cadence: "weekly",
  },
  {
    key: "scale_readiness",
    description: "Persist scale readiness snapshot",
    cadence: "hourly",
  },
] as const;

export type ScaleJobKey = (typeof SCALE_JOBS)[number]["key"];

export function scaleJobIdempotencyKey(
  job: ScaleJobKey,
  periodEnd: string,
): string {
  return `scale:${job}:${periodEnd}`;
}
