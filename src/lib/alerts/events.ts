/**
 * Central registry of alert event types.
 *
 * One definition of every event the alert system can route and deliver. The
 * incident engine writes a smaller set of raw events to the outbox; the
 * delivery consumer derives the more specific SSL and heartbeat events from an
 * incident's correlation key. `emitted` marks whether the platform currently
 * produces the event, so the rule builder can be honest about what will fire.
 *
 * Pure module: safe to import on client and server.
 */

export type AlertEventCategory =
  | "incident"
  | "maintenance"
  | "ssl"
  | "heartbeat"
  | "monitor";

export interface AlertEventDefinition {
  /** Stable event key, e.g. "incident.opened". */
  type: string;
  label: string;
  category: AlertEventCategory;
  /** True for recovery/return-to-normal events (resolved, restored, completed). */
  recovery: boolean;
  /** True when the platform emits this event today (vs registered for later). */
  emitted: boolean;
  /** Included in the recommended default routing rule. */
  inDefaultRule: boolean;
  /** Short, customer-facing description used in the rule builder. */
  description: string;
}

export const ALERT_EVENT_TYPES: readonly AlertEventDefinition[] = [
  // Incident lifecycle.
  {
    type: "incident.opened",
    label: "Incident opened",
    category: "incident",
    recovery: false,
    emitted: true,
    inDefaultRule: true,
    description: "A confirmed failure opened an incident.",
  },
  {
    type: "incident.updated",
    label: "Incident update posted",
    category: "incident",
    recovery: false,
    emitted: true,
    inDefaultRule: false,
    description: "An operator posted a public-ready update.",
  },
  {
    type: "incident.reopened",
    label: "Incident reopened",
    category: "incident",
    recovery: false,
    emitted: true,
    inDefaultRule: true,
    description: "A failure returned within the reopen window.",
  },
  {
    type: "incident.recovery_started",
    label: "Recovery started",
    category: "incident",
    recovery: true,
    emitted: true,
    inDefaultRule: false,
    description: "The service began recovering.",
  },
  {
    type: "incident.resolved",
    label: "Incident resolved",
    category: "incident",
    recovery: true,
    emitted: true,
    inDefaultRule: true,
    description: "The incident resolved and the service is operational.",
  },
  // Maintenance.
  {
    type: "maintenance.scheduled",
    label: "Maintenance scheduled",
    category: "maintenance",
    recovery: false,
    emitted: true,
    inDefaultRule: false,
    description: "A maintenance window was scheduled.",
  },
  {
    type: "maintenance.started",
    label: "Maintenance started",
    category: "maintenance",
    recovery: false,
    emitted: true,
    inDefaultRule: true,
    description: "A maintenance window began.",
  },
  {
    type: "maintenance.updated",
    label: "Maintenance updated",
    category: "maintenance",
    recovery: false,
    emitted: true,
    inDefaultRule: false,
    description: "A scheduled maintenance window changed.",
  },
  {
    type: "maintenance.completed",
    label: "Maintenance completed",
    category: "maintenance",
    recovery: true,
    emitted: true,
    inDefaultRule: true,
    description: "A maintenance window finished.",
  },
  {
    type: "maintenance.canceled",
    label: "Maintenance canceled",
    category: "maintenance",
    recovery: false,
    emitted: true,
    inDefaultRule: false,
    description: "A scheduled maintenance window was canceled.",
  },
  // SSL (derived by the consumer from tls incidents).
  {
    type: "monitor.ssl_critical",
    label: "SSL certificate critical",
    category: "ssl",
    recovery: false,
    emitted: true,
    inDefaultRule: true,
    description: "A certificate is close to expiry or invalid.",
  },
  {
    type: "monitor.ssl_restored",
    label: "SSL certificate restored",
    category: "ssl",
    recovery: true,
    emitted: true,
    inDefaultRule: false,
    description: "A certificate was renewed and is valid again.",
  },
  // Heartbeat (derived by the consumer from heartbeat incidents).
  {
    type: "monitor.heartbeat_missed",
    label: "Heartbeat missed",
    category: "heartbeat",
    recovery: false,
    emitted: true,
    inDefaultRule: true,
    description: "A scheduled job did not check in.",
  },
  {
    type: "monitor.heartbeat_restored",
    label: "Heartbeat restored",
    category: "heartbeat",
    recovery: true,
    emitted: true,
    inDefaultRule: false,
    description: "A scheduled job checked in again.",
  },
  // Flapping.
  {
    type: "monitor.flapping",
    label: "Flapping detected",
    category: "monitor",
    recovery: false,
    emitted: true,
    inDefaultRule: false,
    description: "A monitor changed state repeatedly in a short window.",
  },
] as const;

const EVENT_BY_TYPE = new Map(ALERT_EVENT_TYPES.map((e) => [e.type, e]));

export function alertEvent(type: string): AlertEventDefinition | undefined {
  return EVENT_BY_TYPE.get(type);
}

export function isKnownEventType(type: string): boolean {
  return EVENT_BY_TYPE.has(type);
}

export function isRecoveryEvent(type: string): boolean {
  return EVENT_BY_TYPE.get(type)?.recovery ?? false;
}

export const DEFAULT_RULE_EVENT_TYPES: readonly string[] =
  ALERT_EVENT_TYPES.filter((e) => e.inDefaultRule).map((e) => e.type);

export const SELECTABLE_EVENT_TYPES: readonly string[] =
  ALERT_EVENT_TYPES.filter((e) => e.emitted).map((e) => e.type);

/**
 * Derive the most specific event type from a raw outbox event and the incident
 * that produced it. An `incident.opened` for a TLS failure becomes
 * `monitor.ssl_critical`; a heartbeat failure becomes `monitor.heartbeat_missed`.
 * Resolution mirrors this for the restored events. Everything else passes
 * through unchanged.
 */
export function deriveEventType(
  rawEventType: string,
  correlationKey: string | null | undefined,
): string {
  const key = (correlationKey ?? "").split(":")[0];
  if (rawEventType === "incident.opened" || rawEventType === "incident.reopened") {
    if (key === "tls") return "monitor.ssl_critical";
    if (key === "heartbeat") return "monitor.heartbeat_missed";
  }
  if (rawEventType === "incident.resolved") {
    if (key === "tls") return "monitor.ssl_restored";
    if (key === "heartbeat") return "monitor.heartbeat_restored";
  }
  return rawEventType;
}
