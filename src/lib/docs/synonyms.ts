/**
 * Controlled search synonyms. Versioned so changes are reviewable. Each entry
 * maps user language to the canonical term used in the docs. Only add mappings
 * that are genuinely equivalent; misleading synonyms hurt more than they help.
 */
export const SYNONYMS_VERSION = "2026-07-17";

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  cron: ["heartbeat"],
  job: ["heartbeat"],
  "cron job": ["heartbeat"],
  "job monitor": ["heartbeat"],
  "uptime page": ["status page"],
  "webhook secret": ["signing key", "signing secret"],
  outage: ["incident", "down"],
  certificate: ["ssl", "tls"],
  cert: ["ssl", "tls"],
  workspace: ["organization"],
  "team member": ["member"],
  "cancel plan": ["cancel subscription"],
  "invoice failed": ["payment failed"],
  jsonpath: ["json path"],
  notification: ["alert"],
  "text message": ["alert"],
  probe: ["monitor", "check"],
};

/** Expand a query with synonyms for indexing/matching (lowercased). */
export function expandWithSynonyms(query: string): string[] {
  const q = query.toLowerCase().trim();
  const extra = new Set<string>();
  for (const [key, values] of Object.entries(SEARCH_SYNONYMS)) {
    if (q.includes(key)) {
      for (const v of values) extra.add(v);
    }
  }
  return [q, ...extra];
}
