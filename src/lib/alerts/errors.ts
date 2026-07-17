/**
 * Provider-agnostic error taxonomy.
 *
 * Every raw provider failure maps to one of these categories, and every
 * category maps to a calm, customer-facing explanation that never blames the
 * customer, never uses food jokes, and never leaks a raw provider exception,
 * token, URL, or response body. Categories also decide retryability.
 *
 * Pure module (client + server safe).
 */

export const ERROR_CATEGORIES = [
  "authentication_failed",
  "permission_denied",
  "destination_missing",
  "channel_missing",
  "recipient_invalid",
  "recipient_suppressed",
  "provider_rate_limited",
  "provider_unavailable",
  "request_timed_out",
  "dns_failure",
  "tls_failure",
  "webhook_blocked",
  "payload_rejected",
  "signature_config_invalid",
  "response_too_large",
  "configuration_error",
  "unknown_provider_error",
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

/** Categories that are safe to retry (transient). Everything else is permanent. */
const RETRYABLE = new Set<ErrorCategory>([
  "provider_rate_limited",
  "provider_unavailable",
  "request_timed_out",
  "dns_failure",
  "tls_failure",
]);

export function isRetryable(category: ErrorCategory): boolean {
  return RETRYABLE.has(category);
}

/** Map a category to a delivery-attempt result classification. */
export function resultForCategory(
  category: ErrorCategory,
): "retryable_failure" | "permanent_failure" {
  return isRetryable(category) ? "retryable_failure" : "permanent_failure";
}

const CUSTOMER_COPY: Record<ErrorCategory, string> = {
  authentication_failed:
    "The provider rejected these credentials. Reconnect the channel and run another test.",
  permission_denied:
    "The provider denied access to the destination. Check the channel's permissions and run a test.",
  destination_missing:
    "The destination no longer exists. Replace it and run a test before reactivating the channel.",
  channel_missing:
    "Fajita can no longer reach the selected channel. Choose another destination or reconnect.",
  recipient_invalid:
    "The recipient address is not valid. Use another verified address.",
  recipient_suppressed:
    "The email provider stopped delivery to this address after a bounce or complaint. Use another verified address.",
  provider_rate_limited:
    "The provider is rate limiting delivery. Fajita will retry shortly according to the channel policy.",
  provider_unavailable:
    "The provider is temporarily unavailable. Fajita will retry according to the channel policy.",
  request_timed_out:
    "The endpoint did not respond before the delivery timeout. Fajita will retry according to the channel policy.",
  dns_failure:
    "Fajita could not resolve the destination host. Fajita will retry according to the channel policy.",
  tls_failure:
    "Fajita could not establish a secure connection to the destination. Fajita will retry according to the channel policy.",
  webhook_blocked:
    "Fajita cannot send alerts to private, local, or restricted network addresses.",
  payload_rejected:
    "The endpoint rejected the message. Confirm it accepts the Fajita event format.",
  signature_config_invalid:
    "The channel's signing configuration is incomplete. Rotate the signing key and run a test.",
  response_too_large:
    "The endpoint returned an unusually large response. Confirm it returns a small acknowledgment.",
  configuration_error:
    "This channel is not fully configured. Review its settings and run a test.",
  unknown_provider_error:
    "Delivery failed for an unexpected reason. Fajita will retry according to the channel policy.",
};

export function customerFacingError(category: ErrorCategory): string {
  return CUSTOMER_COPY[category] ?? CUSTOMER_COPY.unknown_provider_error;
}

/** Classify an HTTP status from a webhook/provider endpoint. */
export function categorizeHttpStatus(status: number): {
  ok: boolean;
  category?: ErrorCategory;
} {
  if (status >= 200 && status < 300) return { ok: true };
  if (status === 401) return { ok: false, category: "authentication_failed" };
  if (status === 403) return { ok: false, category: "permission_denied" };
  if (status === 404 || status === 410)
    return { ok: false, category: "destination_missing" };
  if (status === 408) return { ok: false, category: "request_timed_out" };
  if (status === 429) return { ok: false, category: "provider_rate_limited" };
  if (status >= 500) return { ok: false, category: "provider_unavailable" };
  // Other 4xx: permanent payload rejection.
  return { ok: false, category: "payload_rejected" };
}
