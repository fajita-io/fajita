import { describe, expect, it } from "vitest";

import {
  dedupKeys,
  LIFECYCLE_MESSAGE_KEYS,
  LIFECYCLE_MESSAGES,
  LIFECYCLE_TIMING,
  lifecycleMessage,
} from "./messages";

/**
 * Registry integrity and dedup determinism. The unique dedup_key column is
 * the database authority; these tests pin the key builders so a refactor
 * cannot silently change scopes and re-send old messages.
 */

describe("lifecycle message registry", () => {
  it("classifies every message into a known class", () => {
    const classes = new Set(["required", "setup", "report", "reactivation"]);
    for (const key of LIFECYCLE_MESSAGE_KEYS) {
      expect(classes.has(LIFECYCLE_MESSAGES[key].class)).toBe(true);
    }
  });

  it("gives optional classes a preference and required class none", () => {
    for (const key of LIFECYCLE_MESSAGE_KEYS) {
      const def = LIFECYCLE_MESSAGES[key];
      if (def.class === "required") {
        expect(def.preference).toBeNull();
      } else {
        expect(def.preference).not.toBeNull();
      }
    }
  });

  it("keeps definition key equal to the registry key", () => {
    for (const key of LIFECYCLE_MESSAGE_KEYS) {
      expect(LIFECYCLE_MESSAGES[key].key).toBe(key);
    }
  });

  it("resolves known keys and rejects unknown keys", () => {
    expect(lifecycleMessage("welcome")).toBeDefined();
    expect(lifecycleMessage("does_not_exist")).toBeUndefined();
  });

  it("has positive template versions", () => {
    for (const key of LIFECYCLE_MESSAGE_KEYS) {
      expect(LIFECYCLE_MESSAGES[key].templateVersion).toBeGreaterThan(0);
    }
  });
});

describe("dedup keys", () => {
  const org = "org-1";
  const user = "user-1";

  it("is deterministic", () => {
    expect(dedupKeys.welcome(user)).toBe(dedupKeys.welcome(user));
    expect(dedupKeys.weeklyReport(org, "2026-07-06", user)).toBe(
      dedupKeys.weeklyReport(org, "2026-07-06", user),
    );
  });

  it("scopes the welcome to the user, once ever", () => {
    expect(dedupKeys.welcome("a")).not.toBe(dedupKeys.welcome("b"));
  });

  it("separates setup reminder stages so the schedule stays bounded", () => {
    expect(dedupKeys.setupReminder(org, user, 1)).not.toBe(
      dedupKeys.setupReminder(org, user, 2),
    );
  });

  it("scopes weekly reports to org, period, and recipient", () => {
    const base = dedupKeys.weeklyReport(org, "2026-07-06", user);
    expect(dedupKeys.weeklyReport(org, "2026-07-13", user)).not.toBe(base);
    expect(dedupKeys.weeklyReport("org-2", "2026-07-06", user)).not.toBe(base);
    expect(dedupKeys.weeklyReport(org, "2026-07-06", "user-2")).not.toBe(base);
  });

  it("scopes incident recaps to incident and recipient", () => {
    const base = dedupKeys.incidentRecap("inc-1", user);
    expect(dedupKeys.incidentRecap("inc-2", user)).not.toBe(base);
    expect(dedupKeys.incidentRecap("inc-1", "user-2")).not.toBe(base);
  });

  it("scopes usage notices to limit, threshold, and billing period", () => {
    const base = dedupKeys.usageLimitNotice(org, "monitors", 80, "2026-07-01", user);
    expect(
      dedupKeys.usageLimitNotice(org, "monitors", 100, "2026-07-01", user),
    ).not.toBe(base);
    expect(
      dedupKeys.usageLimitNotice(org, "monitors", 80, "2026-08-01", user),
    ).not.toBe(base);
  });

  it("scopes pre-deletion reminders to deletion request and stage", () => {
    const base = dedupKeys.preDeletionReminder("req-1", "7d", user);
    expect(dedupKeys.preDeletionReminder("req-1", "1d", user)).not.toBe(base);
    expect(dedupKeys.preDeletionReminder("req-2", "7d", user)).not.toBe(base);
  });

  it("never collides across message types for the same identifiers", () => {
    const keys = [
      dedupKeys.welcome(user),
      dedupKeys.setupReminder(org, user, 1),
      dedupKeys.firstMonitorLive(org, user),
      dedupKeys.firstFailureEducation(org, user),
      dedupKeys.alertChannelReminder(org, user, 1),
      dedupKeys.statusPageReminder(org, user),
      dedupKeys.activationComplete(org, user),
      dedupKeys.weeklyReport(org, "2026-07-06", user),
      dedupKeys.incidentRecap("inc-1", user),
      dedupKeys.cancellationConfirmation("can-1", user),
      dedupKeys.preDeletionReminder("req-1", "7d", user),
      dedupKeys.reactivationReminder("can-1", user),
    ];
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("stays under the 200-character dedup_key limit", () => {
    const longId = "0".repeat(36);
    const longest = dedupKeys.usageLimitNotice(
      longId,
      "status_pages",
      100,
      "2026-07-01",
      longId,
    );
    expect(longest.length).toBeLessThanOrEqual(200);
  });
});

describe("lifecycle timing bounds", () => {
  it("keeps setup reminders bounded to 24h and 72h", () => {
    expect(LIFECYCLE_TIMING.setupReminderFirstAfterMs).toBe(24 * 3600_000);
    expect(LIFECYCLE_TIMING.setupReminderFinalAfterMs).toBe(72 * 3600_000);
  });

  it("keeps recap eligibility above transient noise", () => {
    expect(LIFECYCLE_TIMING.incidentRecapMinDurationMs).toBeGreaterThanOrEqual(
      60_000,
    );
    expect(
      LIFECYCLE_TIMING.incidentRecapStabilizationMs,
    ).toBeGreaterThanOrEqual(10 * 60_000);
  });

  it("sends the final pre-deletion reminder before deletion, not after", () => {
    expect(LIFECYCLE_TIMING.preDeletionFinalBeforeMs).toBeGreaterThan(0);
    expect(LIFECYCLE_TIMING.preDeletionFirstBeforeMs).toBeGreaterThan(
      LIFECYCLE_TIMING.preDeletionFinalBeforeMs,
    );
  });
});
