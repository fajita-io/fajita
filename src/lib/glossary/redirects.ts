/**
 * Glossary redirect registry. Synonym aliases and deprecated slugs map to
 * canonical term paths. No chains: every source maps directly to a target.
 */

export const GLOSSARY_REDIRECT_VERSION = "2026-07-17";

/** Source slug (under /glossary/) → canonical slug. */
export const GLOSSARY_REDIRECTS: Record<string, string> = {
  "cron-monitoring": "heartbeat-monitoring",
  "website-uptime-monitoring": "website-monitoring",
  "api-availability-monitoring": "api-monitoring",
  "certificate-monitoring": "ssl-certificate-monitoring",
  "tls-certificate-monitoring": "ssl-certificate-monitoring",
  "ssl-monitoring": "ssl-certificate-monitoring",
  "service-status-page": "status-page",
  "uptime-status-page": "status-page",
  "outage-page": "status-page",
  mttr: "mean-time-to-recovery",
  mttd: "mean-time-to-detect",
  mtbf: "mean-time-between-failures",
  sla: "service-level-agreement",
  slo: "service-level-objective",
  sli: "service-level-indicator",
  ttfb: "time-to-first-byte",
  rto: "recovery-time-objective",
  rpo: "recovery-point-objective",
  "dead-man-switch": "dead-mans-switch",
  "dead-mans-switch-monitoring": "dead-mans-switch",
  "webhook-secret": "webhook-signature",
  "webhook-signing-secret": "webhook-signature",
};

export function resolveGlossaryRedirect(slug: string): string | undefined {
  return GLOSSARY_REDIRECTS[slug];
}

/** Fail loudly if a redirect chain or self-loop exists. */
export function assertRedirectIntegrity(publishedSlugs: Set<string>): void {
  for (const [from, to] of Object.entries(GLOSSARY_REDIRECTS)) {
    if (from === to) {
      throw new Error(`Glossary redirect loop: "${from}" → itself`);
    }
    if (GLOSSARY_REDIRECTS[to]) {
      throw new Error(
        `Glossary redirect chain: "${from}" → "${to}" → "${GLOSSARY_REDIRECTS[to]}"`,
      );
    }
    if (!publishedSlugs.has(to)) {
      throw new Error(
        `Glossary redirect "${from}" points to unpublished or missing "${to}"`,
      );
    }
    if (publishedSlugs.has(from)) {
      throw new Error(
        `Glossary redirect source "${from}" collides with a published term`,
      );
    }
  }
}
