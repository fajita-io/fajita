/**
 * Controlled synonym registry for glossary search and internal linking.
 * Synonyms map to canonical term slugs. Version when material mappings change.
 */

export const GLOSSARY_SYNONYM_VERSION = "2026-07-17";

/** Lowercase synonym phrase → canonical term slug. */
export const GLOSSARY_SYNONYMS: Record<string, string> = {
  "uptime checker": "uptime-monitoring",
  "website checker": "website-monitoring",
  "website uptime monitoring": "website-monitoring",
  "api uptime monitoring": "api-monitoring",
  "api availability monitoring": "api-monitoring",
  "endpoint monitoring": "endpoint-monitoring",
  "cron monitor": "heartbeat-monitoring",
  "cron monitoring": "heartbeat-monitoring",
  "dead man switch": "dead-mans-switch",
  "dead man's switch": "dead-mans-switch",
  "dead mans switch": "dead-mans-switch",
  "ssl expiry monitor": "ssl-certificate-monitoring",
  "ssl monitoring": "ssl-certificate-monitoring",
  "certificate monitoring": "ssl-certificate-monitoring",
  "tls certificate monitoring": "ssl-certificate-monitoring",
  "outage page": "status-page",
  "service status page": "status-page",
  "uptime status page": "status-page",
  "webhook secret": "webhook-signature",
  "webhook signing secret": "webhook-signature",
  "response time monitor": "response-time-threshold",
  "response-time monitoring": "response-time-threshold",
  "downtime alert": "outage-alert",
  "system incident": "incident",
  "service outage": "major-outage",
  "mttr": "mean-time-to-recovery",
  "mttd": "mean-time-to-detect",
  "mtbf": "mean-time-between-failures",
  "sla": "service-level-agreement",
  "slo": "service-level-objective",
  "sli": "service-level-indicator",
  "rto": "recovery-time-objective",
  "rpo": "recovery-point-objective",
  "ttfb": "time-to-first-byte",
  "ssl cert": "ssl-certificate",
  "tls cert": "tls-certificate",
  "health endpoint": "health-endpoint",
  "availability check": "availability-check",
  "quiet hours": "quiet-hours",
  "dead letter": "dead-letter-queue",
  "dead letter queue": "dead-letter-queue",
  "statuspage": "status-page",
  "public status page": "public-status-page",
  "custom domain status page": "custom-status-page-domain",
};

/** Expand a query with synonym replacements for search ranking. */
export function expandWithGlossarySynonyms(query: string): string[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];
  const expansions = new Set<string>([raw]);
  if (GLOSSARY_SYNONYMS[raw]) {
    expansions.add(GLOSSARY_SYNONYMS[raw].replace(/-/g, " "));
  }
  for (const [synonym, slug] of Object.entries(GLOSSARY_SYNONYMS)) {
    if (raw.includes(synonym)) {
      expansions.add(raw.replace(synonym, slug.replace(/-/g, " ")));
      expansions.add(slug.replace(/-/g, " "));
    }
  }
  return Array.from(expansions);
}

export function resolveSynonymSlug(query: string): string | undefined {
  return GLOSSARY_SYNONYMS[query.trim().toLowerCase()];
}
