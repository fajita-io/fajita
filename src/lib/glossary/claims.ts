import { publicClaims, type ClaimStatus } from "@/lib/site/claims";

/**
 * Product-claim validation for glossary "How Fajita handles this" sections.
 */

const ALLOWED_PRODUCT_AREAS = new Set([
  "website-monitoring",
  "api-monitoring",
  "ssl-monitoring",
  "heartbeat-monitoring",
  "cron-monitoring",
  "uptime-monitoring",
  "status-pages",
  "incident-communication",
  "alerts",
  "webhooks",
  "subscribers",
  "billing",
  "affiliates",
  "maintenance",
  "assertions",
]);

const ALLOWED_CLAIM_IDS = [
  "monitor-website",
  "monitor-api",
  "monitor-ssl",
  "monitor-cron",
  "monitor-heartbeat",
  "verify-before-alert",
  "alert-email",
  "alert-slack",
  "alert-discord",
  "alert-webhook",
  "status-pages",
  "status-subscribers",
  "status-custom-domain",
  "uptime-history",
] as const;

function isPubliclyClaimable(status: ClaimStatus): boolean {
  return status === "available-now" || status === "at-launch";
}

export function assertProductAreaAllowed(area: string): void {
  if (!ALLOWED_PRODUCT_AREAS.has(area)) {
    throw new Error(`Glossary product area not allowed: "${area}"`);
  }
}

export function validatePublicClaimsForGlossary(): string[] {
  const byId = new Map(publicClaims.map((c) => [c.id, c]));
  const errors: string[] = [];
  for (const id of ALLOWED_CLAIM_IDS) {
    const claim = byId.get(id);
    if (!claim) {
      errors.push(`Glossary references missing claim "${id}"`);
      continue;
    }
    if (!isPubliclyClaimable(claim.status)) {
      errors.push(
        `Glossary references claim "${id}" which is not publicly claimable (${claim.status})`,
      );
    }
  }
  return errors;
}

/** Phrases that must never be claimed as Fajita features. */
export const FORBIDDEN_PRODUCT_CLAIMS = [
  "browser monitoring",
  "real-user monitoring",
  "session replay",
  "pagerduty",
  "microsoft teams",
  "on-call schedule",
  "kubernetes monitoring",
  "ai diagnosis",
  "ai root-cause",
  "private agent",
  "saml",
  "mobile app",
];
