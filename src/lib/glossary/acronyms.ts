/**
 * Acronym registry. Dedicated pages exist only when editorial review approved
 * a distinct educational need. Otherwise the acronym maps to a canonical term.
 */

export const GLOSSARY_ACRONYM_VERSION = "2026-07-17";

export interface AcronymEntry {
  acronym: string;
  expanded: string;
  canonicalSlug: string;
  category: string;
  pronunciation?: string;
  fajitaSupports: boolean;
  dedicatedPage: boolean;
  related: string[];
}

export const GLOSSARY_ACRONYMS: AcronymEntry[] = [
  {
    acronym: "API",
    expanded: "Application Programming Interface",
    canonicalSlug: "api",
    category: "apis-webhooks",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["api-endpoint", "api-monitoring", "http-status-code"],
  },
  {
    acronym: "DNS",
    expanded: "Domain Name System",
    canonicalSlug: "dns",
    category: "ssl-dns",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["dns-resolution", "dns-record", "cname-record"],
  },
  {
    acronym: "HTTP",
    expanded: "Hypertext Transfer Protocol",
    canonicalSlug: "http-monitoring",
    category: "monitoring",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["https-monitoring", "http-status-code", "http-timeout"],
  },
  {
    acronym: "HTTPS",
    expanded: "Hypertext Transfer Protocol Secure",
    canonicalSlug: "https-monitoring",
    category: "monitoring",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["ssl-certificate", "tls-handshake", "https-certificate"],
  },
  {
    acronym: "SSL",
    expanded: "Secure Sockets Layer",
    canonicalSlug: "ssl-certificate",
    category: "ssl-dns",
    pronunciation: "ess-ess-ell",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["tls-certificate", "ssl-certificate-monitoring"],
  },
  {
    acronym: "TLS",
    expanded: "Transport Layer Security",
    canonicalSlug: "tls-certificate",
    category: "ssl-dns",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["ssl-certificate", "tls-handshake", "managed-tls"],
  },
  {
    acronym: "MTTR",
    expanded: "Mean Time to Recovery",
    canonicalSlug: "mean-time-to-recovery",
    category: "reliability-metrics",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["mean-time-to-detect", "incident-resolution", "uptime"],
  },
  {
    acronym: "MTTD",
    expanded: "Mean Time to Detect",
    canonicalSlug: "mean-time-to-detect",
    category: "reliability-metrics",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["mean-time-to-recovery", "incident-detection"],
  },
  {
    acronym: "MTBF",
    expanded: "Mean Time Between Failures",
    canonicalSlug: "mean-time-between-failures",
    category: "reliability-metrics",
    fajitaSupports: false,
    dedicatedPage: true,
    related: ["reliability", "uptime", "mean-time-to-recovery"],
  },
  {
    acronym: "SLA",
    expanded: "Service-Level Agreement",
    canonicalSlug: "service-level-agreement",
    category: "reliability-metrics",
    fajitaSupports: false,
    dedicatedPage: true,
    related: ["service-level-objective", "service-level-indicator", "uptime-percentage"],
  },
  {
    acronym: "SLO",
    expanded: "Service-Level Objective",
    canonicalSlug: "service-level-objective",
    category: "reliability-metrics",
    fajitaSupports: false,
    dedicatedPage: true,
    related: ["service-level-agreement", "service-level-indicator"],
  },
  {
    acronym: "SLI",
    expanded: "Service-Level Indicator",
    canonicalSlug: "service-level-indicator",
    category: "reliability-metrics",
    fajitaSupports: false,
    dedicatedPage: true,
    related: ["service-level-objective", "uptime-percentage", "error-rate"],
  },
  {
    acronym: "TTFB",
    expanded: "Time to First Byte",
    canonicalSlug: "time-to-first-byte",
    category: "performance",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["latency", "response-time"],
  },
  {
    acronym: "RTO",
    expanded: "Recovery Time Objective",
    canonicalSlug: "recovery-time-objective",
    category: "reliability-metrics",
    fajitaSupports: false,
    dedicatedPage: true,
    related: ["recovery-point-objective", "mean-time-to-recovery"],
  },
  {
    acronym: "RPO",
    expanded: "Recovery Point Objective",
    canonicalSlug: "recovery-point-objective",
    category: "reliability-metrics",
    fajitaSupports: false,
    dedicatedPage: true,
    related: ["recovery-time-objective"],
  },
  {
    acronym: "JSON",
    expanded: "JavaScript Object Notation",
    canonicalSlug: "json-response",
    category: "apis-webhooks",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["json-path", "api-health-check"],
  },
  {
    acronym: "HMAC",
    expanded: "Hash-based Message Authentication Code",
    canonicalSlug: "hmac",
    category: "apis-webhooks",
    pronunciation: "aitch-mac",
    fajitaSupports: true,
    dedicatedPage: true,
    related: ["webhook-signature", "webhook"],
  },
  {
    acronym: "CDN",
    expanded: "Content Delivery Network",
    canonicalSlug: "external-monitoring",
    category: "monitoring",
    fajitaSupports: false,
    dedicatedPage: false,
    related: ["external-monitoring", "website-monitoring"],
  },
];

export function acronymByKey(acronym: string): AcronymEntry | undefined {
  return GLOSSARY_ACRONYMS.find(
    (a) => a.acronym.toLowerCase() === acronym.trim().toLowerCase(),
  );
}
