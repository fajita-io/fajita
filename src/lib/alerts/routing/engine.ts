/**
 * Pure alert routing evaluator.
 *
 * Given one event and the organization's rules, decide which channels receive
 * a delivery, which are suppressed and why, and when (quiet-hours delay). No
 * database or network access lives here, so the logic is fully unit tested.
 * The consumer enforces channel state (paused/unhealthy) separately and turns
 * these decisions into delivery intents.
 *
 * Precedence: when the same channel is selected by more than one matching rule,
 * the most specific rule (monitor > group > tag > organization) provides the
 * explanation and scheduling. A channel delivered by any rule is never
 * suppressed by another.
 */

import { SCOPE_PRECEDENCE, type QuietBehavior, type RecoveryBehavior, type ScopeKind } from "@/lib/alerts/constants";
import { type QuietWindow, evaluateQuiet, nextWindowEnd } from "@/lib/alerts/quiet-hours";

export interface EventContext {
  organizationId: string;
  outboxId: string;
  incidentId: string | null;
  monitorId: string | null;
  monitorGroupIds: string[];
  monitorTagIds: string[];
  eventType: string;
  severity: string | null;
  isRecovery: boolean;
}

export interface RoutingRuleChannel {
  channelId: string;
  role: "primary" | "recovery_only" | "fallback";
  fallbackOrder: number | null;
}

export interface RoutingRuleInput {
  id: string;
  name: string;
  status: "active" | "disabled";
  scopeKind: ScopeKind;
  recoveryBehavior: RecoveryBehavior;
  deduplicate: boolean;
  quietBehavior: QuietBehavior;
  eventTypes: string[]; // empty = all event types
  severities: string[]; // empty = all severities
  monitorIds: string[];
  groupIds: string[];
  tagIds: string[];
  channels: RoutingRuleChannel[];
  quietWindows: QuietWindow[];
}

export interface RoutingDecision {
  channelId: string;
  ruleId: string;
  ruleName: string;
  kind: "event" | "recovery";
  /** null = deliver now; a Date = delayed until the quiet window ends. */
  scheduledAt: Date | null;
  explanation: string;
}

export interface RoutingSuppression {
  channelId: string | null;
  ruleId: string | null;
  reason: string;
  explanation: string;
}

export interface RoutingResult {
  decisions: RoutingDecision[];
  suppressions: RoutingSuppression[];
  matchedRuleIds: string[];
}

interface Match {
  matched: boolean;
  specificity: number;
}

function matchScope(rule: RoutingRuleInput, event: EventContext): Match {
  const hasSelectors =
    rule.monitorIds.length > 0 ||
    rule.groupIds.length > 0 ||
    rule.tagIds.length > 0;

  if (!hasSelectors) {
    return { matched: true, specificity: SCOPE_PRECEDENCE.organization };
  }
  if (event.monitorId && rule.monitorIds.includes(event.monitorId)) {
    return { matched: true, specificity: SCOPE_PRECEDENCE.monitor };
  }
  if (rule.groupIds.some((g) => event.monitorGroupIds.includes(g))) {
    return { matched: true, specificity: SCOPE_PRECEDENCE.group };
  }
  if (rule.tagIds.some((t) => event.monitorTagIds.includes(t))) {
    return { matched: true, specificity: SCOPE_PRECEDENCE.tag };
  }
  return { matched: false, specificity: SCOPE_PRECEDENCE.organization };
}

function matchesEvent(rule: RoutingRuleInput, event: EventContext): Match {
  if (rule.status !== "active") return { matched: false, specificity: 0 };
  if (rule.eventTypes.length > 0 && !rule.eventTypes.includes(event.eventType)) {
    return { matched: false, specificity: 0 };
  }
  if (rule.severities.length > 0) {
    // A severity-restricted rule cannot match an event without a severity.
    if (!event.severity || !rule.severities.includes(event.severity)) {
      return { matched: false, specificity: 0 };
    }
  }
  return matchScope(rule, event);
}

type Action =
  | { kind: "deliver"; channelId: string; scheduledAt: Date | null; explanation: string; specificity: number; ruleId: string; ruleName: string; deliverKind: "event" | "recovery" }
  | { kind: "suppress"; channelId: string; reason: string; explanation: string; specificity: number; ruleId: string; ruleName: string };

function targetChannels(
  rule: RoutingRuleInput,
  event: EventContext,
  openedDelivered: Set<string>,
): { deliver: RoutingRuleChannel[]; suppress: Array<{ channel: RoutingRuleChannel; reason: string }> } {
  const primary = rule.channels.filter((c) => c.role === "primary");
  const recoveryOnly = rule.channels.filter((c) => c.role === "recovery_only");

  if (!event.isRecovery) {
    return { deliver: primary, suppress: [] };
  }

  switch (rule.recoveryBehavior) {
    case "never":
      return {
        deliver: [],
        suppress: primary.map((c) => ({ channel: c, reason: "recovery_disabled" })),
      };
    case "selected_channels":
      return { deliver: recoveryOnly, suppress: [] };
    case "same_channels":
    case "only_if_opened_delivered": {
      const deliver = primary.filter((c) => openedDelivered.has(c.channelId));
      const suppress = primary
        .filter((c) => !openedDelivered.has(c.channelId))
        .map((c) => ({ channel: c, reason: "recovery_without_prior_delivery" }));
      return { deliver, suppress };
    }
    default:
      return { deliver: primary, suppress: [] };
  }
}

export function evaluateRouting(params: {
  event: EventContext;
  rules: RoutingRuleInput[];
  orgQuietWindows: QuietWindow[];
  openedDeliveredChannelIds: Set<string>;
  now: Date;
}): RoutingResult {
  const { event, rules, orgQuietWindows, openedDeliveredChannelIds, now } = params;
  const matchedRuleIds: string[] = [];
  const actions: Action[] = [];

  for (const rule of rules) {
    const m = matchesEvent(rule, event);
    if (!m.matched) continue;
    matchedRuleIds.push(rule.id);

    const { deliver, suppress } = targetChannels(rule, event, openedDeliveredChannelIds);

    for (const { channel, reason } of suppress) {
      actions.push({
        kind: "suppress",
        channelId: channel.channelId,
        reason,
        explanation:
          reason === "recovery_disabled"
            ? `The "${rule.name}" rule does not send recovery messages.`
            : `Recovery not sent because the opening alert was never delivered to this channel.`,
        specificity: m.specificity,
        ruleId: rule.id,
        ruleName: rule.name,
      });
    }

    for (const channel of deliver) {
      // Quiet hours: combine org-wide windows with this rule's windows.
      const windows = [...orgQuietWindows, ...rule.quietWindows];
      let scheduledAt: Date | null = null;
      if (windows.length > 0 && rule.quietBehavior !== "ignore_quiet") {
        const decision = evaluateQuiet({
          windows,
          at: now,
          severity: event.severity,
          eventType: event.eventType,
        });
        if (decision === "suppress_or_delay") {
          if (rule.quietBehavior === "suppress") {
            actions.push({
              kind: "suppress",
              channelId: channel.channelId,
              reason: "quiet_hours",
              explanation: `Suppressed during quiet hours by the "${rule.name}" rule.`,
              specificity: m.specificity,
              ruleId: rule.id,
              ruleName: rule.name,
            });
            continue;
          }
          // Delay until the latest active window ends.
          const active = windows.filter((w) => {
            const d = evaluateQuiet({ windows: [w], at: now, severity: event.severity, eventType: event.eventType });
            return d === "suppress_or_delay";
          });
          scheduledAt = active
            .map((w) => nextWindowEnd(w, now))
            .reduce((a, b) => (a > b ? a : b), now);
        }
      }

      actions.push({
        kind: "deliver",
        channelId: channel.channelId,
        scheduledAt,
        explanation: `Delivered because the "${rule.name}" rule matched this ${event.severity ? `${event.severity} ` : ""}event.`,
        specificity: m.specificity,
        ruleId: rule.id,
        ruleName: rule.name,
        deliverKind: event.isRecovery ? "recovery" : "event",
      });
    }
  }

  // Aggregate per channel: any deliver wins; most specific rule provides detail.
  const deliverByChannel = new Map<string, Extract<Action, { kind: "deliver" }>>();
  const suppressByChannel = new Map<string, Extract<Action, { kind: "suppress" }>>();

  for (const a of actions) {
    if (a.kind === "deliver") {
      const existing = deliverByChannel.get(a.channelId);
      if (!existing || a.specificity < existing.specificity) {
        deliverByChannel.set(a.channelId, a);
      }
    } else {
      const existing = suppressByChannel.get(a.channelId);
      if (!existing || a.specificity < existing.specificity) {
        suppressByChannel.set(a.channelId, a);
      }
    }
  }

  const decisions: RoutingDecision[] = [...deliverByChannel.values()].map((a) => ({
    channelId: a.channelId,
    ruleId: a.ruleId,
    ruleName: a.ruleName,
    kind: a.deliverKind,
    scheduledAt: a.scheduledAt,
    explanation: a.explanation,
  }));

  const suppressions: RoutingSuppression[] = [...suppressByChannel.values()]
    .filter((a) => !deliverByChannel.has(a.channelId))
    .map((a) => ({
      channelId: a.channelId,
      ruleId: a.ruleId,
      reason: a.reason,
      explanation: a.explanation,
    }));

  return { decisions, suppressions, matchedRuleIds };
}
