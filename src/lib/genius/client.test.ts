// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatGeniusRole,
  openGeniusFeedback,
  resetGenius,
  syncGeniusIdentity,
  syncGeniusRouteContext,
} from "@/lib/genius/client";

describe("genius client", () => {
  afterEach(() => {
    delete window.Genius;
    vi.restoreAllMocks();
  });

  it("formats org roles for identify", () => {
    expect(formatGeniusRole("owner")).toBe("Owner");
    expect(formatGeniusRole(null)).toBeUndefined();
  });

  it("syncs identity when the widget API is available", () => {
    const identify = vi.fn();
    window.Genius = { identify } as unknown as typeof window.Genius;

    syncGeniusIdentity({
      userId: "user_123",
      email: "jordan@example.com",
      displayName: "Jordan Lee",
      orgRole: "admin",
      planLabel: "Pro",
    });

    expect(identify).toHaveBeenCalledWith({
      id: "user_123",
      email: "jordan@example.com",
      name: "Jordan Lee",
      plan: "Pro",
      role: "Admin",
    });
  });

  it("syncs route context", () => {
    const setContext = vi.fn();
    window.Genius = { setContext } as unknown as typeof window.Genius;

    syncGeniusRouteContext("/app/monitors");

    expect(setContext).toHaveBeenCalledWith({
      feature: "Monitors",
      route: "/app/monitors",
    });
  });

  it("opens feedback with route context", () => {
    const open = vi.fn();
    window.Genius = { open } as unknown as typeof window.Genius;

    openGeniusFeedback({
      source: "floating",
      pathname: "/app/support",
      category: "idea",
      track: false,
    });

    expect(open).toHaveBeenCalledWith({
      category: "idea",
      context: {
        feature: "Support",
        route: "/app/support",
      },
    });
  });

  it("resets identity on sign out", () => {
    const reset = vi.fn();
    window.Genius = { reset } as unknown as typeof window.Genius;

    resetGenius();
    expect(reset).toHaveBeenCalledOnce();
  });
});
