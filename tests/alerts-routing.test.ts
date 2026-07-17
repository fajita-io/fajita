import { describe, expect, it } from "vitest";

import {
  evaluateRouting,
  type EventContext,
  type RoutingRuleInput,
} from "@/lib/alerts/routing/engine";
import type { QuietWindow } from "@/lib/alerts/quiet-hours";

function baseEvent(overrides: Partial<EventContext> = {}): EventContext {
  return {
    organizationId: "org1",
    outboxId: "ob1",
    incidentId: "inc1",
    monitorId: "mon1",
    monitorGroupIds: ["grp1"],
    monitorTagIds: ["tag1"],
    eventType: "incident.opened",
    severity: "major",
    isRecovery: false,
    ...overrides,
  };
}

function rule(overrides: Partial<RoutingRuleInput> = {}): RoutingRuleInput {
  return {
    id: "r1",
    name: "Rule",
    status: "active",
    scopeKind: "organization",
    recoveryBehavior: "same_channels",
    deduplicate: true,
    quietBehavior: "suppress",
    eventTypes: [],
    severities: [],
    monitorIds: [],
    groupIds: [],
    tagIds: [],
    channels: [{ channelId: "ch1", role: "primary", fallbackOrder: null }],
    quietWindows: [],
    ...overrides,
  };
}

describe("evaluateRouting matching", () => {
  it("matches an org-wide rule with no selectors", () => {
    const res = evaluateRouting({
      event: baseEvent(),
      rules: [rule()],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(),
      now: new Date("2026-07-21T12:00:00Z"),
    });
    expect(res.decisions).toHaveLength(1);
    expect(res.decisions[0].channelId).toBe("ch1");
    expect(res.decisions[0].kind).toBe("event");
  });

  it("does not match when event type is excluded", () => {
    const res = evaluateRouting({
      event: baseEvent({ eventType: "incident.opened" }),
      rules: [rule({ eventTypes: ["incident.resolved"] })],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(),
      now: new Date(),
    });
    expect(res.decisions).toHaveLength(0);
    expect(res.matchedRuleIds).toHaveLength(0);
  });

  it("severity-restricted rule does not match an event without severity", () => {
    const res = evaluateRouting({
      event: baseEvent({ eventType: "maintenance.started", severity: null }),
      rules: [rule({ severities: ["critical"] })],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(),
      now: new Date(),
    });
    expect(res.decisions).toHaveLength(0);
  });

  it("prefers the most specific rule for a shared channel", () => {
    const orgRule = rule({ id: "org", name: "Org", scopeKind: "organization" });
    const monRule = rule({ id: "mon", name: "Monitor", scopeKind: "monitor", monitorIds: ["mon1"] });
    const res = evaluateRouting({
      event: baseEvent(),
      rules: [orgRule, monRule],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(),
      now: new Date(),
    });
    expect(res.decisions).toHaveLength(1);
    expect(res.decisions[0].ruleId).toBe("mon");
  });

  it("matches by group and by tag", () => {
    const groupRes = evaluateRouting({
      event: baseEvent({ monitorId: "other" }),
      rules: [rule({ groupIds: ["grp1"] })],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(),
      now: new Date(),
    });
    expect(groupRes.decisions).toHaveLength(1);

    const tagRes = evaluateRouting({
      event: baseEvent({ monitorId: "other", monitorGroupIds: [] }),
      rules: [rule({ tagIds: ["tag1"] })],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(),
      now: new Date(),
    });
    expect(tagRes.decisions).toHaveLength(1);
  });
});

describe("evaluateRouting recovery behavior", () => {
  const recoveryEvent = baseEvent({ eventType: "incident.resolved", isRecovery: true });

  it("never sends recovery when behavior is never", () => {
    const res = evaluateRouting({
      event: recoveryEvent,
      rules: [rule({ recoveryBehavior: "never" })],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(["ch1"]),
      now: new Date(),
    });
    expect(res.decisions).toHaveLength(0);
    expect(res.suppressions.some((s) => s.reason === "recovery_disabled")).toBe(true);
  });

  it("same_channels only sends to channels that received the opening", () => {
    const res = evaluateRouting({
      event: recoveryEvent,
      rules: [rule({ recoveryBehavior: "same_channels" })],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(), // never delivered opening
      now: new Date(),
    });
    expect(res.decisions).toHaveLength(0);
    expect(res.suppressions.some((s) => s.reason === "recovery_without_prior_delivery")).toBe(true);
  });

  it("same_channels delivers when the opening was delivered", () => {
    const res = evaluateRouting({
      event: recoveryEvent,
      rules: [rule({ recoveryBehavior: "same_channels" })],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(["ch1"]),
      now: new Date(),
    });
    expect(res.decisions).toHaveLength(1);
    expect(res.decisions[0].kind).toBe("recovery");
  });

  it("selected_channels sends only to recovery_only channels", () => {
    const res = evaluateRouting({
      event: recoveryEvent,
      rules: [
        rule({
          recoveryBehavior: "selected_channels",
          channels: [
            { channelId: "ch1", role: "primary", fallbackOrder: null },
            { channelId: "ch2", role: "recovery_only", fallbackOrder: null },
          ],
        }),
      ],
      orgQuietWindows: [],
      openedDeliveredChannelIds: new Set(["ch1"]),
      now: new Date(),
    });
    expect(res.decisions.map((d) => d.channelId)).toEqual(["ch2"]);
  });
});

describe("evaluateRouting quiet hours", () => {
  const allDay: QuietWindow = {
    timezone: "UTC",
    startMinute: 0,
    endMinute: 1439,
    days: [0, 1, 2, 3, 4, 5, 6],
    severityExceptions: [],
    eventTypeExceptions: [],
  };

  it("suppresses during quiet hours when behavior is suppress", () => {
    const res = evaluateRouting({
      event: baseEvent(),
      rules: [rule({ quietBehavior: "suppress" })],
      orgQuietWindows: [allDay],
      openedDeliveredChannelIds: new Set(),
      now: new Date("2026-07-21T12:00:00Z"),
    });
    expect(res.decisions).toHaveLength(0);
    expect(res.suppressions.some((s) => s.reason === "quiet_hours")).toBe(true);
  });

  it("delays during quiet hours when behavior is delay", () => {
    const res = evaluateRouting({
      event: baseEvent(),
      rules: [rule({ quietBehavior: "delay" })],
      orgQuietWindows: [allDay],
      openedDeliveredChannelIds: new Set(),
      now: new Date("2026-07-21T12:00:00Z"),
    });
    expect(res.decisions).toHaveLength(1);
    expect(res.decisions[0].scheduledAt).toBeInstanceOf(Date);
  });

  it("ignores quiet hours when behavior is ignore_quiet", () => {
    const res = evaluateRouting({
      event: baseEvent(),
      rules: [rule({ quietBehavior: "ignore_quiet" })],
      orgQuietWindows: [allDay],
      openedDeliveredChannelIds: new Set(),
      now: new Date("2026-07-21T12:00:00Z"),
    });
    expect(res.decisions).toHaveLength(1);
    expect(res.decisions[0].scheduledAt).toBeNull();
  });

  it("passes critical severity through a quiet window with a severity exception", () => {
    const res = evaluateRouting({
      event: baseEvent({ severity: "critical" }),
      rules: [rule({ quietBehavior: "suppress" })],
      orgQuietWindows: [{ ...allDay, severityExceptions: ["critical"] }],
      openedDeliveredChannelIds: new Set(),
      now: new Date("2026-07-21T12:00:00Z"),
    });
    expect(res.decisions).toHaveLength(1);
  });
});
