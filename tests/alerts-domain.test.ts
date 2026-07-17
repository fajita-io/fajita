import { describe, expect, it } from "vitest";

import { categorizeHttpStatus, customerFacingError, isRetryable, resultForCategory } from "@/lib/alerts/errors";
import { deriveEventType, isRecoveryEvent, isKnownEventType, DEFAULT_RULE_EVENT_TYPES } from "@/lib/alerts/events";
import { buildSubject, previewContext } from "@/lib/alerts/messages";
import { evaluateQuiet, windowActiveAt, type QuietWindow } from "@/lib/alerts/quiet-hours";

describe("error taxonomy", () => {
  it("classifies HTTP statuses", () => {
    expect(categorizeHttpStatus(204)).toEqual({ ok: true });
    expect(categorizeHttpStatus(401).category).toBe("authentication_failed");
    expect(categorizeHttpStatus(403).category).toBe("permission_denied");
    expect(categorizeHttpStatus(404).category).toBe("destination_missing");
    expect(categorizeHttpStatus(429).category).toBe("provider_rate_limited");
    expect(categorizeHttpStatus(500).category).toBe("provider_unavailable");
    expect(categorizeHttpStatus(422).category).toBe("payload_rejected");
  });

  it("marks transient categories retryable and permanent ones not", () => {
    expect(isRetryable("provider_rate_limited")).toBe(true);
    expect(isRetryable("request_timed_out")).toBe(true);
    expect(isRetryable("authentication_failed")).toBe(false);
    expect(resultForCategory("provider_unavailable")).toBe("retryable_failure");
    expect(resultForCategory("webhook_blocked")).toBe("permanent_failure");
  });

  it("never leaks internals in customer copy", () => {
    for (const cat of ["authentication_failed", "webhook_blocked", "recipient_suppressed"] as const) {
      const msg = customerFacingError(cat);
      expect(msg.length).toBeGreaterThan(0);
      expect(msg).not.toMatch(/token|secret|stack|sql/i);
    }
  });
});

describe("event registry", () => {
  it("derives SSL and heartbeat events from correlation keys", () => {
    expect(deriveEventType("incident.opened", "tls:example.com")).toBe("monitor.ssl_critical");
    expect(deriveEventType("incident.opened", "heartbeat:job")).toBe("monitor.heartbeat_missed");
    expect(deriveEventType("incident.resolved", "tls:example.com")).toBe("monitor.ssl_restored");
    expect(deriveEventType("incident.resolved", "heartbeat:job")).toBe("monitor.heartbeat_restored");
    expect(deriveEventType("incident.opened", "http:5xx")).toBe("incident.opened");
  });

  it("recognizes recovery events", () => {
    expect(isRecoveryEvent("incident.resolved")).toBe(true);
    expect(isRecoveryEvent("monitor.ssl_restored")).toBe(true);
    expect(isRecoveryEvent("incident.opened")).toBe(false);
  });

  it("default rule events are all known", () => {
    for (const e of DEFAULT_RULE_EVENT_TYPES) expect(isKnownEventType(e)).toBe(true);
  });
});

describe("message subjects", () => {
  it("prefixes test messages", () => {
    const ctx = { ...previewContext("email"), isTest: true };
    expect(buildSubject(ctx)).toBe("[Test] Fajita alert channel test");
  });

  it("labels resolved and ssl events distinctly", () => {
    expect(buildSubject({ ...previewContext("email", "incident.resolved"), isRecovery: true })).toMatch(/^\[Resolved\]/);
    expect(buildSubject(previewContext("email", "monitor.ssl_critical"))).toMatch(/^\[SSL Critical\]/);
    expect(buildSubject(previewContext("email", "monitor.heartbeat_missed"))).toMatch(/^\[Heartbeat Missed\]/);
  });
});

describe("quiet windows", () => {
  const window: QuietWindow = {
    timezone: "UTC",
    startMinute: 22 * 60, // 22:00
    endMinute: 6 * 60, // 06:00 next day (cross-midnight)
    days: [0, 1, 2, 3, 4, 5, 6],
    severityExceptions: ["critical"],
    eventTypeExceptions: [],
  };

  it("is active inside a cross-midnight window", () => {
    expect(windowActiveAt(window, new Date("2026-07-21T23:30:00Z"))).toBe(true);
    expect(windowActiveAt(window, new Date("2026-07-21T05:00:00Z"))).toBe(true);
    expect(windowActiveAt(window, new Date("2026-07-21T12:00:00Z"))).toBe(false);
  });

  it("passes an excepted severity through", () => {
    expect(
      evaluateQuiet({ windows: [window], at: new Date("2026-07-21T23:30:00Z"), severity: "critical", eventType: "incident.opened" }),
    ).toBe("exception_passes");
    expect(
      evaluateQuiet({ windows: [window], at: new Date("2026-07-21T23:30:00Z"), severity: "major", eventType: "incident.opened" }),
    ).toBe("suppress_or_delay");
  });

  it("reports not_quiet outside the window", () => {
    expect(
      evaluateQuiet({ windows: [window], at: new Date("2026-07-21T12:00:00Z"), severity: "major", eventType: "incident.opened" }),
    ).toBe("not_quiet");
  });
});
