/**
 * Public claims registry: the single source of truth for what the website
 * may say Fajita does. Marketing components must not state a capability
 * that is not registered here with an appropriate status.
 *
 * Reviewed in every phase that changes product capability.
 * Docs: /docs/product/public-claims-registry.md
 */

export type ClaimStatus =
  /** Live and verifiable today. */
  | "available-now"
  /** Committed launch scope. May be described in product copy with the
   *  early-access frame; must not be presented as live today. */
  | "at-launch"
  /** Under consideration or scheduled after launch. May appear on the
   *  roadmap only. Must not appear in feature marketing. */
  | "planned"
  /** Never marketed. */
  | "internal-only"
  | "deprecated";

export interface PublicClaim {
  id: string;
  /** The strongest sentence the site is allowed to publish. */
  statement: string;
  status: ClaimStatus;
  notes?: string;
}

export const publicClaims: PublicClaim[] = [
  /* Monitor types */
  {
    id: "monitor-website",
    statement:
      "Fajita checks websites around the clock: availability, status codes, and response time.",
    status: "available-now",
  },
  {
    id: "monitor-api",
    statement:
      "Fajita checks API endpoints: HTTP method, status assertions, response-time thresholds, keyword and JSON assertions, and request headers.",
    status: "available-now",
  },
  {
    id: "monitor-ssl",
    statement:
      "Fajita watches SSL certificates for upcoming expiry and invalid chains, and warns before customers see a browser error.",
    status: "available-now",
  },
  {
    id: "monitor-cron",
    statement:
      "Fajita monitors cron jobs and background work through heartbeat URLs and expected schedules, and alerts when a job goes quiet.",
    status: "available-now",
  },
  {
    id: "monitor-heartbeat",
    statement:
      "Services can ping a private heartbeat URL; a missed ping counts as a failure.",
    status: "available-now",
  },

  /* Detection and verification */
  {
    id: "verify-before-alert",
    statement:
      "Fajita re-checks a failure before alerting anyone, so one dropped packet does not page the team.",
    status: "available-now",
  },
  {
    id: "multi-region-verification",
    statement:
      "Confirmation checks from multiple regions.",
    status: "planned",
    notes:
      "Launch scope undecided. Do not market. Site copy says 're-checks' without naming regions.",
  },
  {
    id: "check-intervals",
    statement:
      "Fast check intervals, with exact per-plan frequency published alongside pricing at launch.",
    status: "available-now",
    notes:
      "Do not publish a specific number of seconds anywhere until entitlements are final.",
  },

  /* Alerting */
  {
    id: "alert-email",
    statement: "Verified incidents alert the team by email.",
    status: "available-now",
  },
  {
    id: "alert-slack",
    statement: "Verified incidents alert a Slack channel.",
    status: "available-now",
  },
  {
    id: "alert-discord",
    statement: "Verified incidents alert a Discord channel.",
    status: "available-now",
  },
  {
    id: "alert-webhook",
    statement:
      "Verified incidents post a signed JSON payload to any webhook URL.",
    status: "available-now",
  },
  {
    id: "alert-recovery",
    statement:
      "One clear recovery message goes to the same channels when the service is healthy again.",
    status: "available-now",
  },
  {
    id: "alert-teams",
    statement: "Microsoft Teams integration.",
    status: "planned",
    notes: "Not approved for launch. Roadmap only.",
  },
  {
    id: "alert-sms",
    statement: "SMS and phone-call alerts.",
    status: "planned",
    notes: "Roadmap only.",
  },

  /* Status pages */
  {
    id: "status-pages",
    statement:
      "Every account can publish a public status page with components, incident timelines, scheduled maintenance, and uptime history.",
    status: "available-now",
  },
  {
    id: "status-subscribers",
    statement:
      "Status page visitors can subscribe to incident updates.",
    status: "available-now",
  },
  {
    id: "status-custom-domain",
    statement: "Status pages on a custom domain.",
    status: "available-now",
    notes: "Plan gating unresolved; do not attach to a specific plan yet.",
  },
  {
    id: "status-branding",
    statement:
      "Status pages carry the customer's name and logo, not a wall of Fajita branding.",
    status: "available-now",
  },

  /* History and data */
  {
    id: "uptime-history",
    statement:
      "Uptime history and response-time trends per monitor, with incident records.",
    status: "available-now",
  },
  {
    id: "data-export",
    statement: "Monitoring data and account data can be exported.",
    status: "available-now",
  },
  {
    id: "data-retention",
    statement: "Historical retention limits per plan.",
    status: "available-now",
    notes: "Published via pricing comparison and catalog entitlements.",
  },

  /* Team and account */
  {
    id: "team-access",
    statement: "Team members share an account with access to monitors and incidents.",
    status: "available-now",
    notes: "Seat limits per plan unresolved.",
  },
  {
    id: "no-agent",
    statement:
      "Fajita needs no agent, no SDK, and no code change for website, API, and SSL checks. Cron monitoring needs one line: a request to a heartbeat URL.",
    status: "available-now",
  },

  /* Billing */
  {
    id: "plans",
    statement:
      "Three plans: Starter (10 monitors), Pro (50 monitors), Business (unlimited monitors).",
    status: "available-now",
    notes: "Names and monitor limits locked in src/lib/stripe/plans.ts.",
  },
  {
    id: "pricing-amounts",
    statement: "Dollar pricing per plan.",
    status: "available-now",
    notes:
      "Published from BILLING_CATALOG via src/lib/site/pricing.ts. Must match Stripe lookup-key prices.",
  },
  {
    id: "billing-intervals",
    statement: "Monthly and annual billing.",
    status: "available-now",
    notes: "Both intervals exist as Stripe lookup keys.",
  },
  {
    id: "cancel-anytime",
    statement:
      "Subscriptions can be canceled at any time from the billing portal; access runs to the end of the paid period.",
    status: "available-now",
    notes: "Standard Stripe portal behavior; architecture committed.",
  },

  /* Security */
  {
    id: "security-tenant-separation",
    statement: "Customer data is separated per account at the database layer.",
    status: "available-now",
  },
  {
    id: "security-encrypted-secrets",
    statement:
      "Monitor credentials such as request headers are encrypted at rest and never shown back in full.",
    status: "available-now",
  },
  {
    id: "security-restricted-targets",
    statement:
      "Monitoring probes refuse private networks and internal addresses, so Fajita cannot be used to scan infrastructure it should not reach.",
    status: "available-now",
  },
  {
    id: "security-account-deletion",
    statement: "Accounts and their data can be deleted on request.",
    status: "available-now",
  },
  {
    id: "security-disclosure",
    statement:
      "Security reports are accepted through the contact form and acknowledged by a person.",
    status: "available-now",
  },
  {
    id: "security-certifications",
    statement: "SOC 2, ISO 27001, HIPAA, penetration-test, or audit claims.",
    status: "internal-only",
    notes: "PROHIBITED. No certification exists. Never publish.",
  },

  /* Website itself */
  {
    id: "site-early-access",
    statement:
      "Accounts are open for signup. Early access remains available for people who prefer to wait for an invitation.",
    status: "available-now",
  },
  {
    id: "site-contact",
    statement:
      "The contact form delivers messages to the Fajita team and messages are stored securely.",
    status: "available-now",
  },

  /* Affiliate program (Phase 12). Rates may be stated as Program Terms when
     programPublished is true; income guarantees remain prohibited. */
  {
    id: "affiliate-program",
    statement:
      "Fajita runs an affiliate program that pays commissions on eligible referred subscriptions.",
    status: "available-now",
    notes:
      "programPublished=true; Agreement and Privacy Notice in force 2026-07-17. Public /affiliates open for applications.",
  },
  {
    id: "affiliate-commission-rate",
    statement: "Any specific commission percentage, recurring months, or payout minimum.",
    status: "available-now",
    notes:
      "Version 1 Program Terms in src/lib/affiliates/config.ts and Schedule A of the Affiliate Program Agreement. State as current program terms, not guarantees.",
  },
  {
    id: "affiliate-income-guarantee",
    statement: "Guaranteed affiliate income, earnings, or traffic.",
    status: "internal-only",
    notes: "PROHIBITED. Never publish.",
  },

  /* Support chatbot (Phase 16) */
  {
    id: "support-chatbot",
    statement:
      "Ask Fajita answers product questions from approved documentation and can send a conversation to Fajita support.",
    status: "available-now",
    notes:
      "Powered by Pamphlet attribution required. Provider conversation APIs remain deferred until a verified Pamphlet contract exists. Do not claim 24/7 human support, SLAs, or autonomous account changes.",
  },
  {
    id: "support-chatbot-powered-by-pamphlet",
    statement: "Ask Fajita is powered by Pamphlet.",
    status: "available-now",
  },
  {
    id: "support-chatbot-autonomous-actions",
    statement:
      "The support chatbot creates, edits, or deletes monitors, resolves incidents, or changes billing automatically.",
    status: "internal-only",
    notes: "PROHIBITED. Chat is read-only for account tools in Phase 16.",
  },
  {
    id: "support-chatbot-human-sla",
    statement: "Guaranteed human response time or 24/7 live agents.",
    status: "internal-only",
    notes: "PROHIBITED until verified staffing exists.",
  },
];

const claimsById = new Map(publicClaims.map((c) => [c.id, c]));

export function getClaim(id: string): PublicClaim {
  const claim = claimsById.get(id);
  if (!claim) throw new Error(`Unknown public claim: ${id}`);
  return claim;
}

/** True when the claim may appear in feature marketing (not just roadmap). */
export function isMarketable(id: string): boolean {
  const s = getClaim(id).status;
  return s === "available-now" || s === "at-launch";
}
