export type ThresholdLevel = "normal" | "warning" | "scale" | "critical";

export interface CapacityThreshold {
  resourceKey: string;
  label: string;
  unit: string;
  currentUsage: number;
  normalMax: number;
  warningThreshold: number;
  scaleThreshold: number;
  criticalThreshold: number;
  leadTimeHours: number;
  scalingAction: string;
  costImpactCents: number | null;
  owner: string;
  runbookPath: string;
}

export const CAPACITY_THRESHOLDS: CapacityThreshold[] = [
  {
    resourceKey: "checks_per_minute",
    label: "Checks per minute",
    unit: "checks/min",
    currentUsage: 0,
    normalMax: 200,
    warningThreshold: 160,
    scaleThreshold: 180,
    criticalThreshold: 195,
    leadTimeHours: 24,
    scalingAction: "Add worker instances within tested concurrency",
    costImpactCents: 5_000,
    owner: "engineering",
    runbookPath: "/docs/engineering/capacity-thresholds.md",
  },
  {
    resourceKey: "worker_utilization",
    label: "Worker utilization",
    unit: "ratio",
    currentUsage: 0,
    normalMax: 0.7,
    warningThreshold: 0.75,
    scaleThreshold: 0.85,
    criticalThreshold: 0.92,
    leadTimeHours: 12,
    scalingAction: "Add workers or rebalance regions",
    costImpactCents: 8_000,
    owner: "engineering",
    runbookPath: "/docs/engineering/capacity-thresholds.md",
  },
  {
    resourceKey: "queue_lag_seconds",
    label: "Queue lag",
    unit: "seconds",
    currentUsage: 0,
    normalMax: 30,
    warningThreshold: 60,
    scaleThreshold: 120,
    criticalThreshold: 300,
    leadTimeHours: 6,
    scalingAction: "Investigate leases; add capacity before campaigns",
    costImpactCents: null,
    owner: "operations",
    runbookPath: "/docs/engineering/capacity-thresholds.md",
  },
  {
    resourceKey: "database_cpu",
    label: "Database CPU",
    unit: "ratio",
    currentUsage: 0,
    normalMax: 0.6,
    warningThreshold: 0.7,
    scaleThreshold: 0.8,
    criticalThreshold: 0.9,
    leadTimeHours: 48,
    scalingAction: "Query review first; provider tier only after evidence",
    costImpactCents: 20_000,
    owner: "engineering",
    runbookPath: "/docs/engineering/capacity-thresholds.md",
  },
  {
    resourceKey: "support_open_conversations",
    label: "Open support conversations",
    unit: "count",
    currentUsage: 0,
    normalMax: 15,
    warningThreshold: 25,
    scaleThreshold: 40,
    criticalThreshold: 60,
    leadTimeHours: 168,
    scalingAction: "Pause growth intake; evaluate support hiring trigger",
    costImpactCents: null,
    owner: "support",
    runbookPath: "/docs/operations/support-capacity-model.md",
  },
];

export function evaluateThreshold(t: CapacityThreshold): ThresholdLevel {
  if (t.currentUsage >= t.criticalThreshold) return "critical";
  if (t.currentUsage >= t.scaleThreshold) return "scale";
  if (t.currentUsage >= t.warningThreshold) return "warning";
  return "normal";
}

export interface ProviderCapacity {
  providerKey: string;
  tier: string;
  hardLimit: string;
  softLimit: string;
  rateLimit: string;
  currentUsage: string;
  warningThreshold: string;
  upgradeLeadTimeHours: number;
  costNote: string;
  failureBehavior: string;
  fallback: string;
  owner: string;
}

export const PROVIDER_CAPACITY: ProviderCapacity[] = [
  {
    providerKey: "supabase",
    tier: "unverified_in_scale_model",
    hardLimit: "Plan connection/storage limits",
    softLimit: "CPU / IO bursting",
    rateLimit: "API rate limits per plan",
    currentUsage: "unknown_until_measured",
    warningThreshold: "70% of plan",
    upgradeLeadTimeHours: 24,
    costNote: "Document before campaign launch",
    failureBehavior: "Write failures threaten check ingestion",
    fallback: "Pause non-critical analytics jobs",
    owner: "engineering",
  },
  {
    providerKey: "vercel",
    tier: "unverified_in_scale_model",
    hardLimit: "Function / bandwidth plan limits",
    softLimit: "Concurrent serverless",
    rateLimit: "Platform rate limits",
    currentUsage: "unknown_until_measured",
    warningThreshold: "70% of plan",
    upgradeLeadTimeHours: 24,
    costNote: "Campaign pages must stay light",
    failureBehavior: "Public pages degrade",
    fallback: "Disable heavy lab routes; keep status pages",
    owner: "engineering",
  },
  {
    providerKey: "clerk",
    tier: "unverified_in_scale_model",
    hardLimit: "MAU / API limits",
    softLimit: "Auth spike capacity",
    rateLimit: "API",
    currentUsage: "unknown_until_measured",
    warningThreshold: "70% MAU",
    upgradeLeadTimeHours: 48,
    costNote: "Signup spikes need reservation",
    failureBehavior: "Signup / login failures",
    fallback: "Pause public signup control",
    owner: "operations",
  },
  {
    providerKey: "stripe",
    tier: "standard",
    hardLimit: "Radar / API rate limits",
    softLimit: "Webhook throughput",
    rateLimit: "API",
    currentUsage: "unknown_until_measured",
    warningThreshold: "Elevated payment failures",
    upgradeLeadTimeHours: 72,
    costNote: "Fees in contribution model",
    failureBehavior: "Checkout / webhook delays",
    fallback: "Pause checkout control; preserve existing subs",
    owner: "billing_operations",
  },
  {
    providerKey: "resend",
    tier: "unverified_in_scale_model",
    hardLimit: "Monthly email quota",
    softLimit: "Daily send burst",
    rateLimit: "API",
    currentUsage: "unknown_until_measured",
    warningThreshold: "70% monthly quota",
    upgradeLeadTimeHours: 24,
    costNote: "Subscriber + lifecycle volume",
    failureBehavior: "Alert/lifecycle delay",
    fallback: "Prioritize incident and security mail",
    owner: "operations",
  },
];

export type ScaleStopControl =
  | "pause_public_signup"
  | "pause_checkout"
  | "pause_campaign"
  | "pause_affiliate_applications"
  | "pause_referral_prompts"
  | "pause_partner_launch"
  | "disable_high_risk_free_tool"
  | "limit_monitor_creation"
  | "limit_manual_tests"
  | "disable_provider_integration"
  | "drain_region"
  | "pause_feature_flag";

export interface ScaleStopDefinition {
  control: ScaleStopControl;
  label: string;
  customerImpact: string;
  restoration: string;
  permission: string;
}

export const SCALE_STOP_CONTROLS: ScaleStopDefinition[] = [
  {
    control: "pause_public_signup",
    label: "Pause public signup",
    customerImpact: "New accounts cannot register; existing customers unaffected",
    restoration: "Clear reason, capacity check, audit, then re-enable",
    permission: "scale.capacity.manage",
  },
  {
    control: "pause_checkout",
    label: "Pause checkout",
    customerImpact: "New paid conversions blocked; existing subscriptions continue",
    restoration: "Billing health check + audit",
    permission: "scale.capacity.manage",
  },
  {
    control: "pause_campaign",
    label: "Pause campaign",
    customerImpact: "Marketing intake stops; product monitoring continues",
    restoration: "Owner review of stop condition",
    permission: "scale.campaigns.pause",
  },
  {
    control: "pause_affiliate_applications",
    label: "Pause affiliate applications",
    customerImpact: "New affiliate intake stops; existing affiliates unchanged",
    restoration: "Affiliate ops review",
    permission: "scale.channels.manage",
  },
  {
    control: "pause_referral_prompts",
    label: "Pause referral prompts",
    customerImpact: "In-app referral CTAs hidden",
    restoration: "Eligibility + support capacity review",
    permission: "scale.referrals.manage",
  },
  {
    control: "pause_partner_launch",
    label: "Pause partner launch",
    customerImpact: "Partner campaign links may 503 or redirect to status",
    restoration: "Partner + capacity approval",
    permission: "scale.partners.manage",
  },
];
