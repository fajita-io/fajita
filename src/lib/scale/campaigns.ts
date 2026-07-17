import { assertScaleActionAllowed } from "./readiness";
import type { CampaignStatus } from "./types";

export interface CampaignRecord {
  id: string;
  campaignKey: string;
  name: string;
  channelKey: string;
  objective: string;
  audience: string;
  message: string;
  offer: string;
  landingPagePath: string;
  attributionParams: Record<string, string>;
  startDate: string | null;
  endDate: string | null;
  budgetCents: number;
  spendCents: number;
  volumeCap: number | null;
  owner: string;
  status: CampaignStatus;
  capacityReviewed: boolean;
  supportReviewed: boolean;
  claimsReviewed: boolean;
  stopConditions: string[];
}

export const CAMPAIGN_ALLOWLIST_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const FORBIDDEN_PARAM_PATTERNS = [
  /email/i,
  /@/,
  /org(anization)?[_-]?name/i,
  /secret/i,
  /token/i,
  /password/i,
];

export function validateAttributionParams(
  params: Record<string, string>,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (
      !(CAMPAIGN_ALLOWLIST_PARAMS as readonly string[]).includes(key) &&
      key !== "fj_campaign"
    ) {
      errors.push(`Parameter not allowlisted: ${key}`);
    }
    for (const pattern of FORBIDDEN_PARAM_PATTERNS) {
      if (pattern.test(key) || pattern.test(value)) {
        errors.push(`Forbidden personal or secret data in ${key}`);
      }
    }
    if (value.length > 120) {
      errors.push(`Parameter ${key} exceeds max length`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function buildCampaignUrl(input: {
  basePath: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
  siteOrigin: string;
}): { url: string; errors: string[] } {
  const params: Record<string, string> = {
    utm_source: input.source,
    utm_medium: input.medium,
    utm_campaign: input.campaign,
  };
  if (input.content) params.utm_content = input.content;
  if (input.term) params.utm_term = input.term;

  const validation = validateAttributionParams(params);
  if (!validation.ok) {
    return { url: "", errors: validation.errors };
  }

  if (
    input.basePath.startsWith("http") ||
    input.basePath.includes("//") ||
    input.basePath.includes("..")
  ) {
    return { url: "", errors: ["Open redirect blocked: path must be relative"] };
  }

  const url = new URL(input.basePath.startsWith("/") ? input.basePath : `/${input.basePath}`, input.siteOrigin);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return { url: url.toString(), errors: [] };
}

export function canLaunchCampaign(campaign: CampaignRecord): {
  allowed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const gate = assertScaleActionAllowed("campaign.launch");
  if (!gate.allowed) reasons.push(gate.reason);

  if (campaign.status !== "approved" && campaign.status !== "scheduled") {
    reasons.push(`Campaign status must be approved or scheduled (is ${campaign.status})`);
  }
  if (!campaign.capacityReviewed) reasons.push("Capacity review required");
  if (!campaign.supportReviewed) reasons.push("Support review required");
  if (!campaign.claimsReviewed) reasons.push("Claims review required");
  if (campaign.budgetCents <= 0) reasons.push("Budget must be set");
  if (campaign.stopConditions.length === 0) {
    reasons.push("Stop conditions required");
  }

  return { allowed: reasons.length === 0, reasons };
}

export const FIXTURE_CAMPAIGNS: CampaignRecord[] = [
  {
    id: "camp_fixture_draft",
    campaignKey: "fixture-draft-newsletter",
    name: "Fixture draft newsletter sponsorship",
    channelKey: "partnerships",
    objective: "Activated paid organizations",
    audience: "Solo SaaS founders",
    message: "Know when your software gets too hot",
    offer: "None (standard pricing)",
    landingPagePath: "/pricing",
    attributionParams: {
      utm_source: "newsletter",
      utm_medium: "sponsorship",
      utm_campaign: "fixture-draft",
    },
    startDate: null,
    endDate: null,
    budgetCents: 50_000,
    spendCents: 0,
    volumeCap: 200,
    owner: "founder",
    status: "draft",
    capacityReviewed: false,
    supportReviewed: false,
    claimsReviewed: false,
    stopConditions: ["Activation below 20%", "Retained CAC above ceiling"],
  },
  {
    id: "camp_fixture_paused",
    campaignKey: "fixture-paused-paid-search",
    name: "Fixture paused paid search",
    channelKey: "paid_search",
    objective: "Day-7 retained paid organizations",
    audience: "High-intent uptime monitoring queries",
    message: "Monitor websites, APIs, certificates, and cron jobs",
    offer: "None",
    landingPagePath: "/",
    attributionParams: {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "fixture-paused",
    },
    startDate: "2026-04-01",
    endDate: "2026-04-15",
    budgetCents: 100_000,
    spendCents: 42_000,
    volumeCap: 500,
    owner: "founder",
    status: "paused",
    capacityReviewed: true,
    supportReviewed: true,
    claimsReviewed: true,
    stopConditions: ["Budget stop", "Retained CAC ceiling", "Scale gate blocked"],
  },
];
