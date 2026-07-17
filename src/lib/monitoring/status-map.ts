import type { OperationalStatus } from "@/components/design-system/status/status";

/**
 * Mapping from monitor domain states to the shared operational status vocabulary
 * used by StatusBadge / StatusIcon (which encode state as shape, not color
 * alone). Kept client-safe and centralized so every surface labels a result the
 * same way. Lifecycle status (draft/active/paused) is deliberately separate from
 * the latest check result: a single failed check is never presented as "Down".
 */

export interface MappedStatus {
  status: OperationalStatus;
  label: string;
}

/** Latest check result -> operational status + label. */
export function resultToStatus(result: string | null): MappedStatus {
  switch (result) {
    case "success":
      return { status: "operational", label: "Success" };
    case "failure":
      return { status: "down", label: "Failed" };
    case "error":
      return { status: "down", label: "Error" };
    case "timed_out":
      return { status: "down", label: "Timed out" };
    case "blocked":
      return { status: "maintenance", label: "Blocked" };
    case "canceled":
      return { status: "paused", label: "Canceled" };
    default:
      return { status: "unknown", label: "No results yet" };
  }
}

/** Monitor lifecycle status -> human label. Presented separately from results. */
export function lifecycleLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "disabled":
      return "Disabled";
    case "archived":
      return "Archived";
    case "pending_deletion":
      return "Deletion pending";
    case "deleted":
      return "Deleted";
    default:
      return status;
  }
}

/** Heartbeat token state -> operational status + label. */
export function heartbeatToStatus(state: string | null): MappedStatus {
  switch (state) {
    case "healthy":
      return { status: "operational", label: "Received" };
    case "late":
      return { status: "degraded", label: "Late" };
    case "missed":
      return { status: "down", label: "Missed" };
    case "paused":
      return { status: "paused", label: "Paused" };
    case "pending":
      return { status: "unknown", label: "Waiting for first ping" };
    case "revoked":
      return { status: "unknown", label: "Revoked" };
    default:
      return { status: "unknown", label: "Unknown" };
  }
}

/** Certificate days remaining -> operational status + label. */
export function sslToStatus(
  daysRemaining: number | null,
  warnDays = 30,
  critDays = 7,
): MappedStatus {
  if (daysRemaining === null) return { status: "unknown", label: "No results yet" };
  if (daysRemaining < 0) return { status: "down", label: "Expired" };
  if (daysRemaining <= critDays) return { status: "down", label: `${daysRemaining} days left` };
  if (daysRemaining <= warnDays)
    return { status: "degraded", label: `${daysRemaining} days left` };
  return { status: "operational", label: `${daysRemaining} days left` };
}

/** Human failure-category explanation for a customer, never a raw engine error. */
export function failureExplanation(
  category: string | null,
  httpStatus: number | null,
): string {
  switch (category) {
    case "dns_failure":
      return "Fajita could not find an address for this hostname. Check the spelling and DNS configuration.";
    case "blocked_destination":
      return "Fajita cannot connect to private, local, or restricted network addresses.";
    case "connection_refused":
      return "The server refused the connection. Confirm the service is online and accepting public traffic.";
    case "connection_reset":
      return "The connection was reset before Fajita received a response.";
    case "connect_timeout":
      return "Fajita could not open a connection before the timeout.";
    case "tls_failure":
      return "The secure connection could not be established.";
    case "tls_expired":
      return "The certificate has expired.";
    case "tls_hostname_mismatch":
      return "The certificate does not match the hostname being monitored.";
    case "response_timeout":
      return "The endpoint did not respond before the timeout.";
    case "unexpected_status":
      return httpStatus
        ? `Fajita expected a successful response but received HTTP ${httpStatus}.`
        : "Fajita received an unexpected HTTP status.";
    case "response_too_large":
      return "The response was larger than the configured size limit.";
    case "invalid_json":
      return "The endpoint responded, but the body was not valid JSON.";
    case "assertion_failed":
      return "The endpoint responded, but one of your success checks did not pass.";
    case "redirect_blocked":
      return "A redirect pointed to a private or blocked destination and was rejected.";
    case "redirect_limit":
      return "The endpoint redirected more times than allowed.";
    case "unsupported_scheme":
      return "Only http and https destinations can be monitored.";
    case "invalid_configuration":
      return "This monitor's configuration cannot be run as written.";
    case "heartbeat_missed":
      return "A heartbeat did not arrive within the expected window.";
    case "worker_error":
      return "Fajita hit a problem running this check. It will try again on the next scheduled run.";
    default:
      return "Fajita could not complete this check.";
  }
}
