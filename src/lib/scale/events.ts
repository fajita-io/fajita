/**
 * Phase 20 scale analytics events. No partner contract text, customer email,
 * monitor URLs, payment details, or private forecast notes.
 */

export const SCALE_ANALYTICS_EVENTS = [
  "scale_readiness_evaluated",
  "scale_stage_changed",
  "channel_created",
  "channel_state_changed",
  "campaign_created",
  "campaign_approved",
  "campaign_activated",
  "campaign_paused",
  "campaign_completed",
  "campaign_cost_recorded",
  "partner_proposed",
  "partner_approved",
  "partner_ended",
  "referral_link_created",
  "referral_attributed",
  "referral_converted",
  "capacity_threshold_reached",
  "capacity_action_requested",
  "provider_limit_reached",
  "hiring_trigger_reached",
  "hiring_scorecard_approved",
  "forecast_generated",
  "scale_risk_created",
  "scale_decision_recorded",
] as const;

export type ScaleAnalyticsEvent = (typeof SCALE_ANALYTICS_EVENTS)[number];

export const SCALE_EVENT_FORBIDDEN_METADATA = [
  "partner_contract_text",
  "customer_email",
  "customer_identity",
  "monitor_url",
  "payment_details",
  "support_transcript",
  "private_forecast_notes",
  "contractor_pii",
] as const;
