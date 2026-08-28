import { STATUS_PAGE_ZONE } from "@/lib/status-pages/config";

export function normalizeStatusHost(host: string | null | undefined): string {
  return (host ?? "").split(":")[0].toLowerCase();
}

/** True when the request is on the status zone apex (status.fajita.io). */
export function isFajitaStatusApexHost(host: string | null | undefined): boolean {
  return normalizeStatusHost(host) === STATUS_PAGE_ZONE.toLowerCase();
}

/** StatusPageView basePath: empty on status.fajita.io, /status on the app host. */
export function fajitaServiceStatusBasePath(host: string | null | undefined): string {
  return isFajitaStatusApexHost(host) ? "" : "/status";
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io").replace(/\/$/, "");

/** Canonical URL for Fajita's public service status page and subpaths. */
export function fajitaServiceStatusCanonicalUrl(
  host: string | null | undefined,
  subpath = "",
): string {
  const suffix = subpath ? (subpath.startsWith("/") ? subpath : `/${subpath}`) : "";
  if (isFajitaStatusApexHost(host)) {
    return `https://${STATUS_PAGE_ZONE}${suffix || "/"}`;
  }
  return `${APP_URL}/status${suffix}`;
}

/**
 * Rewrite pathname for status-zone hosts. Returns the internal Next.js path,
 * or null when no rewrite applies / passthrough is intended.
 */
export function resolveStatusHostRewrite(
  host: string,
  pathname: string,
  statusPageZone: string = STATUS_PAGE_ZONE,
): string | null {
  const normalizedHost = host.split(":")[0].toLowerCase();
  const zone = statusPageZone.toLowerCase();
  const path = pathname || "/";

  if (normalizedHost === zone) {
    if (path.startsWith("/status")) return null;
    if (path === "/") return "/status";
    if (path === "/history" || path.startsWith("/history?")) return "/status/history";
    if (path.startsWith("/incidents/")) return `/status${path}`;
    return null;
  }

  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/status") ||
    path.startsWith("/_status-host") ||
    path.startsWith("/app")
  ) {
    return null;
  }

  if (normalizedHost.endsWith(`.${zone}`)) {
    const slug = normalizedHost.slice(0, normalizedHost.length - zone.length - 1);
    if (!slug || slug.includes(".")) return null;
    return `/status/${slug}${path === "/" ? "" : path}`;
  }

  return `/_status-host/${encodeURIComponent(normalizedHost)}${path === "/" ? "" : path}`;
}
