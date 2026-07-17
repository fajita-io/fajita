/**
 * Status-page hosting configuration. Client-safe. Values come from env with
 * safe defaults so local development and preview work without extra setup.
 *
 * Hosted subdomain architecture: <slug>.status.fajita.io. Custom domains point
 * a CNAME at the shared routing target and are verified with a TXT challenge.
 * Real DNS/TLS provisioning is handled by the hosting platform; see
 * docs/engineering/status-page-tls.md.
 */

const RAW_STATUS_DOMAIN =
  process.env.NEXT_PUBLIC_STATUS_PAGE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "") ??
  "status.fajita.io";

/** The zone hosted subdomains live under (e.g. "status.fajita.io"). */
export const STATUS_PAGE_ZONE = RAW_STATUS_DOMAIN;

/** CNAME target customers point custom domains at. */
export const STATUS_CNAME_TARGET =
  process.env.NEXT_PUBLIC_STATUS_CNAME_TARGET?.replace(/^https?:\/\//, "").replace(/\/$/, "") ??
  `cname.${STATUS_PAGE_ZONE}`;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io").replace(/\/$/, "");

/** Full hosted URL for a page slug (path-based fallback during development). */
export function hostedStatusUrl(slug: string): string {
  return `${APP_URL}/status/${slug}`;
}

/** Canonical hosted subdomain hostname for a slug. */
export function hostedSubdomain(slug: string): string {
  return `${slug}.${STATUS_PAGE_ZONE}`;
}

/** Marketing link used by the powered-by lockup. */
export const POWERED_BY_URL = APP_URL;

export const PUBLIC_SNAPSHOT_SCHEMA_VERSION = 1;
