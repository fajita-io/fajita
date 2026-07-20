/**
 * Feature availability. The code registry below is the source of truth; the
 * feature_flag_overrides table can flip a flag on for a specific organization
 * (private beta). Enforcement is server-side; the client receives only the
 * resolved boolean map, never the stage machinery.
 *
 * A feature is "available" to customers when its stage is public_beta or ga.
 * Earlier stages are visible only to platform admins (as Planned) so we never
 * ship a broken or fake customer surface.
 */

export const FEATURE_STAGES = [
  "development",
  "internal",
  "private_beta",
  "public_beta",
  "ga",
  "disabled",
  "deprecated",
] as const;
export type FeatureStage = (typeof FEATURE_STAGES)[number];

export const FEATURE_KEYS = [
  "monitors",
  "incidents",
  "maintenance",
  "statusPages",
  "statusSubscribers",
  "integrations",
  "reports",
  "billing",
  "affiliates",
  "pamphletSupport",
  "commandPalette",
  "notificationCenter",
  "globalSearch",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

interface FeatureDef {
  stage: FeatureStage;
  /** Human owner/area, documented for handoff. */
  description: string;
}

/**
 * Phase 3 state: account/shell features are GA; every product feature that
 * belongs to a later phase is `development` (hidden from customers).
 */
export const FEATURE_REGISTRY: Record<FeatureKey, FeatureDef> = {
  monitors: { stage: "ga", description: "Monitoring product (Phase 5: customer creation, testing, management, history)" },
  incidents: { stage: "ga", description: "Incident engine (Phase 6: confirmation, recovery, maintenance, timelines)" },
  maintenance: { stage: "ga", description: "Maintenance windows and suppression (Phase 6)" },
  statusPages: { stage: "ga", description: "Public status pages (Phase 8: hosted subdomains, custom domains, components, incident/maintenance publication, uptime history, themes, public renderer)" },
  statusSubscribers: { stage: "ga", description: "Status-page subscribers (Phase 9: double opt-in, preferences, incident/maintenance email, unsubscribe, bounce/complaint handling)" },
  integrations: { stage: "ga", description: "Alert channels, routing, and delivery (Phase 7: email, Slack, Discord, generic webhooks; retries, dead letters, delivery log)" },
  reports: { stage: "ga", description: "Weekly reliability reports and incident recaps (Phase 11)" },
  billing: { stage: "ga", description: "Stripe checkout, portal, entitlements, and grace periods (Phase 10). UI available; paid lockout controlled by BILLING_ENFORCEMENT_ENABLED." },
  affiliates: { stage: "ga", description: "Affiliate program (Phase 12: applications, referral tracking, recurring commissions, ledger, payouts, fraud controls)" },
  pamphletSupport: { stage: "ga", description: "Ask Fajita support chatbot powered by Pamphlet (Phase 16). Local approved-knowledge answers; Pamphlet provider APIs remain deferred until a verified contract exists." },
  commandPalette: { stage: "ga", description: "Command palette (Phase 3)" },
  notificationCenter: { stage: "ga", description: "In-app notification center (Phase 3)" },
  globalSearch: { stage: "ga", description: "Application search (Phase 3)" },
};

export function isStageAvailable(stage: FeatureStage): boolean {
  return stage === "public_beta" || stage === "ga";
}

export type FeatureMap = Record<FeatureKey, boolean>;

/** Code-only availability map (no org overrides). Safe for client and server. */
export function baseFeatureMap(): FeatureMap {
  const map = {} as FeatureMap;
  for (const key of FEATURE_KEYS) {
    map[key] = isStageAvailable(FEATURE_REGISTRY[key].stage);
  }
  return map;
}
