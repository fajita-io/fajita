/**
 * Monitor URL privacy. Target URLs can carry secrets in query parameters, so
 * ordinary views never render the full URL. These helpers produce safe,
 * redacted display strings used across the list, activity, history, and
 * analytics. A full URL is shown only in an explicit, permissioned detail view.
 *
 * Client-safe: no server imports.
 */

/** Hostname only, e.g. "api.example.com". Falls back to a safe placeholder. */
export function displayHostname(raw: string | null): string {
  if (!raw) return "";
  try {
    return new URL(raw).hostname;
  } catch {
    return "invalid URL";
  }
}

/**
 * Safe destination summary for list rows and activity: scheme, host, and path,
 * with the query string and any fragment removed. A trailing marker shows when
 * parameters were dropped so the redaction is visible, never silent.
 */
export function safeDestination(raw: string | null): string {
  if (!raw) return "";
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return "invalid URL";
  }
  const hadQuery = Boolean(u.search || u.hash);
  const path = u.pathname === "/" ? "" : u.pathname;
  const base = `${u.protocol}//${u.host}${path}`;
  return hadQuery ? `${base} (parameters hidden)` : base;
}

/**
 * Analytics-safe host label: the registrable-ish host only, never a full URL
 * or any path or query. Used for coarse type/host analytics without leaking
 * customer targets. Returns "redacted" for anything unparseable.
 */
export function analyticsSafeHost(raw: string | null): string {
  const host = displayHostname(raw);
  return host && host !== "invalid URL" ? host : "redacted";
}
