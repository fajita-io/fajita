import type { BrandIconName } from "@/components/design-system/icons";

/**
 * Client-safe display helpers for the monitor product. Pure formatting and
 * label lookups only. No secrets, no server imports. Every surface uses these
 * so wording and iconography never drift between the list, the wizard, and the
 * detail pages.
 */

export type MonitorTypeKey = "http" | "https" | "api" | "ssl" | "heartbeat";

/** The four customer-facing monitor types, keyed by wizard route segment. */
export const MONITOR_TYPE_ROUTES = {
  website: "https",
  api: "api",
  ssl: "ssl",
  heartbeat: "heartbeat",
} as const;

export type WizardTypeSegment = keyof typeof MONITOR_TYPE_ROUTES;

export function typeLabel(monitorType: string): string {
  switch (monitorType) {
    case "http":
    case "https":
      return "Website";
    case "api":
      return "API";
    case "ssl":
      return "SSL certificate";
    case "heartbeat":
      return "Heartbeat";
    default:
      return monitorType;
  }
}

export function typeIcon(monitorType: string): BrandIconName {
  switch (monitorType) {
    case "api":
      return "monitor-api";
    case "ssl":
      return "monitor-ssl";
    case "heartbeat":
      return "monitor-cron";
    default:
      return "monitor-http";
  }
}

export function methodLabel(method: string): string {
  return method.toUpperCase();
}

/** Human label for an assertion type, plain language, no condition syntax. */
export function assertionLabel(type: string): string {
  const map: Record<string, string> = {
    status_code_in: "Status code is one of",
    response_time_below: "Responds faster than",
    body_contains: "Body contains",
    body_not_contains: "Body does not contain",
    header_equals: "Response header equals",
    json_path_exists: "JSON path exists",
    json_path_not_exists: "JSON path does not exist",
    json_path_equals: "JSON value equals",
    json_path_not_equals: "JSON value does not equal",
    json_number_gt: "JSON number greater than",
    json_number_gte: "JSON number at least",
    json_number_lt: "JSON number less than",
    json_number_lte: "JSON number at most",
    json_contains_string: "JSON value contains",
    json_boolean_true: "JSON value is true",
    json_boolean_false: "JSON value is false",
    tls_valid: "Certificate is valid",
    tls_hostname_matches: "Certificate hostname matches",
    tls_expires_after_days: "Certificate valid for at least (days)",
    heartbeat_within_grace: "Heartbeat arrives within grace period",
  };
  return map[type] ?? type;
}

export function secretTypeLabel(type: string): string {
  switch (type) {
    case "bearer_token":
      return "Bearer token";
    case "basic_auth":
      return "Basic authentication";
    case "custom_header":
      return "Custom secret header";
    case "api_key":
      return "API key";
    case "authorization_header":
      return "Authorization header";
    default:
      return type;
  }
}

/** Compact relative time, e.g. "2 min ago", "in 4 min", "just now". */
export function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Never";
  const diffMs = then - Date.now();
  const future = diffMs > 0;
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  if (sec < 45) return future ? "in a moment" : "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return future ? `in ${min} min` : `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return future ? `in ${hr} h` : `${hr} h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return future ? `in ${day} d` : `${day} d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Absolute UTC timestamp for tooltips and precise displays. */
export function absoluteTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Customer-facing explanation for a failure category. Plain language, never a
 * raw worker error or stack trace, and never blames the customer. Mirrors the
 * Phase 4 failure taxonomy.
 */
export function failureExplanation(
  category: string | null,
  httpStatus?: number | null,
): string {
  switch (category) {
    case "dns":
    case "dns_failure":
      return "Fajita could not find an address for this hostname. Check the spelling and DNS configuration.";
    case "connection":
    case "connection_refused":
      return "The server rejected the connection. Confirm the service is online and accepting public HTTPS traffic.";
    case "timeout":
      return "The endpoint did not respond before the timeout.";
    case "unexpected_status":
    case "status":
      return httpStatus
        ? `Fajita expected a successful response but received HTTP ${httpStatus}.`
        : "Fajita received an unexpected status code.";
    case "invalid_json":
      return "The endpoint responded, but the body was not valid JSON.";
    case "assertion":
    case "assertion_failed":
      return "The endpoint responded, but one of your success rules did not pass.";
    case "blocked":
    case "blocked_destination":
      return "Fajita cannot connect to private, local, or restricted network addresses.";
    case "tls":
    case "tls_failure":
      return "Fajita could not complete a secure connection to this endpoint.";
    case "tls_hostname":
    case "tls_hostname_mismatch":
      return "The certificate does not match the hostname being monitored.";
    case "response_too_large":
      return "The response was larger than Fajita will read for a check.";
    default:
      return "Fajita could not complete this check.";
  }
}

/** Human label for a monitor audit action, used in activity feeds. */
export function activityLabel(action: string): string {
  const map: Record<string, string> = {
    "monitor.created": "Monitor created",
    "monitor.activated": "Activated",
    "monitor.tested": "Configuration tested",
    "monitor.paused": "Paused",
    "monitor.resumed": "Resumed",
    "monitor.version_created": "Configuration updated",
    "monitor.manual_check_requested": "Manual check run",
    "monitor.duplicated": "Duplicated",
    "monitor.archived": "Archived",
    "monitor.restored": "Restored",
    "monitor.deleted": "Deleted",
    "monitor.group_changed": "Group changed",
    "monitor.secret_added": "Credential added",
    "monitor.secret_rotated": "Credential replaced",
    "monitor.heartbeat_token_created": "Ping URL created",
    "monitor.heartbeat_token_rotated": "Ping URL rotated",
    "monitor.heartbeat_token_revoked": "Ping URL revoked",
    "monitor.bulk_action": "Bulk action",
  };
  return map[action] ?? action.replace("monitor.", "").replace(/_/g, " ");
}

/** Exact UTC calendar date, e.g. for certificate expiry copy. */
export function exactDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
