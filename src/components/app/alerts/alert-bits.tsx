import type { BrandIconName } from "@/components/design-system/icons";
import { BrandIcon } from "@/components/design-system/icons";
import type { AlertProvider } from "@/lib/alerts/constants";
import { alertEvent } from "@/lib/alerts/events";

/* ------------------------------------------------------------------ */
/* Provider identity                                                   */
/* ------------------------------------------------------------------ */

export const PROVIDER_LABEL: Record<AlertProvider, string> = {
  email: "Email",
  slack: "Slack",
  discord: "Discord",
  webhook: "Webhook",
};

export const PROVIDER_ICON: Record<AlertProvider, BrandIconName> = {
  email: "subscriber",
  slack: "team",
  discord: "team",
  webhook: "webhook",
};

export const PROVIDER_BLURB: Record<AlertProvider, string> = {
  email: "Send to named people. Each address is verified before it can receive an alert.",
  slack: "Post to a Slack channel through an incoming webhook you control.",
  discord: "Post to a Discord channel through a webhook you control.",
  webhook: "Sign and POST a JSON envelope to your own endpoint. You verify the signature.",
};

export function ProviderMark({ provider, size = 16 }: { provider: AlertProvider; size?: number }) {
  return (
    <span className={`fj-provider-mark fj-provider-mark--${provider}`} aria-hidden="true">
      <BrandIcon name={PROVIDER_ICON[provider]} size={size} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Channel health                                                      */
/* ------------------------------------------------------------------ */

const HEALTH_LABEL: Record<string, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  failing: "Failing",
  paused: "Paused",
  unverified: "Untested",
  disabled: "Disabled",
};

/** Health badge. Never color only: always carries a word and a shape. */
export function HealthBadge({ health }: { health: string }) {
  const label = HEALTH_LABEL[health] ?? health;
  return (
    <span className={`fj-health fj-health--${health}`}>
      <span className="fj-health__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  testing: "Testing",
  active: "Active",
  paused: "Paused",
  degraded: "Degraded",
  disabled: "Disabled",
  pending_deletion: "Deleting",
  deleted: "Deleted",
};

export function channelStatusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

/* ------------------------------------------------------------------ */
/* Delivery outcome                                                    */
/* ------------------------------------------------------------------ */

const DELIVERY_LABEL: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  processing: "Sending",
  delivered: "Delivered",
  failed: "Failed",
  dead_letter: "Gave up",
  suppressed: "Held back",
  canceled: "Canceled",
};

export function DeliveryStatusBadge({ status }: { status: string }) {
  const label = DELIVERY_LABEL[status] ?? status;
  return (
    <span className={`fj-dstatus fj-dstatus--${status}`}>
      <span className="fj-dstatus__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Event + severity labels                                             */
/* ------------------------------------------------------------------ */

export function eventLabel(type: string): string {
  return alertEvent(type)?.label ?? type;
}

const SEVERITY_LABEL: Record<string, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
  maintenance: "Maintenance",
  informational: "Info",
};

export function SeverityTag({ severity }: { severity: string | null }) {
  if (!severity) return null;
  return <span className={`fj-sev fj-sev--${severity}`}>{SEVERITY_LABEL[severity] ?? severity}</span>;
}

/* ------------------------------------------------------------------ */
/* Error category (customer-facing labels for the log)                 */
/* ------------------------------------------------------------------ */

const ERROR_LABEL: Record<string, string> = {
  authentication_failed: "Authentication rejected",
  permission_denied: "Permission denied",
  destination_missing: "Destination not found",
  provider_rate_limited: "Rate limited",
  provider_unavailable: "Provider unavailable",
  request_timed_out: "Timed out",
  connection_failed: "Could not connect",
  payload_rejected: "Payload rejected",
  webhook_blocked: "Blocked for safety",
  recipient_suppressed: "Recipient suppressed",
  configuration_error: "Configuration problem",
  internal_error: "Internal error",
};

export function errorLabel(category: string | null): string | null {
  if (!category) return null;
  return ERROR_LABEL[category] ?? category;
}
