import type { PartnerModel, PartnerStatus } from "./types";

export interface PartnerRecord {
  id: string;
  name: string;
  category: string;
  audience: string;
  distributionMethod: string;
  productFit: string;
  valueExchange: string;
  dataSharing: string;
  legalReview: string;
  securityReview: string;
  owner: string;
  status: PartnerStatus;
  model: PartnerModel;
  exitProcess: string;
}

export const PARTNER_DUE_DILIGENCE_CHECKLIST = [
  "Legal identity",
  "Website",
  "Audience fit",
  "Reputation",
  "Claims accuracy",
  "Privacy policy",
  "Security posture if data exchanged",
  "Commercial terms",
  "Trademark use",
  "Spam practices",
  "Customer support quality",
  "Data requirements",
  "Conflict of interest",
  "Exit process",
];

export const FIXTURE_PARTNERS: PartnerRecord[] = [
  {
    id: "partner_fixture_proposed",
    name: "Fixture Hosting Newsletter",
    category: "newsletter",
    audience: "Indie SaaS operators",
    distributionMethod: "Sponsored issue + educational guide",
    productFit: "Uptime before launch",
    valueExchange: "Flat sponsorship; no customer list exchange",
    dataSharing: "none",
    legalReview: "not_started",
    securityReview: "not_started",
    owner: "founder",
    status: "proposed",
    model: "educational",
    exitProcess: "Remove links; preserve attribution history; notify owner",
  },
  {
    id: "partner_fixture_rejected",
    name: "Fixture Logo Swap Network",
    category: "other",
    audience: "Unclear",
    distributionMethod: "Logo wall only",
    productFit: "Weak",
    valueExchange: "Logo for logo",
    dataSharing: "requested_customer_list",
    legalReview: "rejected",
    securityReview: "rejected",
    owner: "founder",
    status: "rejected",
    model: "community",
    exitProcess: "Do not engage",
  },
];

export const AGENCY_BOUNDARIES = [
  "Agencies create their own Fajita organization",
  "Agencies join client orgs only via normal invitations",
  "Client owns client data and billing unless explicitly configured",
  "No white-label dashboards",
  "No reseller billing",
  "No cross-client aggregation",
  "No master agency override",
  "No unrestricted impersonation",
];

export const NATIVE_INTEGRATION_GATE = [
  "Repeated validated demand",
  "Evidence generic webhooks are insufficient",
  "Retention or activation opportunity",
  "Stable provider API",
  "Secure authentication model",
  "Clear permission scope",
  "Support owner",
  "Maintenance owner",
  "Provider test environment",
  "Revocation flow",
  "Data map",
  "Legal review",
  "Transferability",
];

/** Lifetime deal default for Phase 20. */
export const LIFETIME_DEAL_DECISION = {
  decision: "No lifetime deal" as const,
  rationale: [
    "Long-term cost model incomplete",
    "Monitoring compute forecast incomplete",
    "Support cost forecast incomplete",
    "Transfer implications unreviewed",
    "Do not use LTD as launch cash shortcut",
  ],
  requiresSeparateStrategicDecision: true,
};
