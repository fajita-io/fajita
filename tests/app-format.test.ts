import { describe, expect, it } from "vitest";

import { actionLabel, relativeTime } from "@/lib/app/format";

describe("actionLabel", () => {
  it("maps known audit actions to plain language", () => {
    expect(actionLabel("organization.created")).toBe("created the organization");
    expect(actionLabel("invitation.accepted")).toBe("accepted an invitation");
    expect(actionLabel("member.role_changed")).toBe("changed a member's role");
  });

  it("falls back to a readable form for unknown actions", () => {
    expect(actionLabel("something.new_thing")).toBe("something new thing");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-07-16T12:00:00Z");

  it("formats past times", () => {
    expect(relativeTime("2026-07-16T10:00:00Z", now)).toBe("2 hours ago");
    expect(relativeTime("2026-07-15T12:00:00Z", now)).toBe("yesterday");
  });
});
