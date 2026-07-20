import { describe, expect, it } from "vitest";

import { geniusContextForRoute } from "@/lib/genius/route-context";

describe("geniusContextForRoute", () => {
  it("maps overview routes", () => {
    expect(geniusContextForRoute("/app")).toEqual({
      feature: "Overview",
      route: "/app",
    });
  });

  it("maps nested monitor routes without treating UUIDs as tabs", () => {
    expect(
      geniusContextForRoute("/app/monitors/550e8400-e29b-41d4-a716-446655440000"),
    ).toEqual({
      feature: "Monitors",
      route: "/app/monitors/550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("maps settings tabs", () => {
    expect(geniusContextForRoute("/app/settings/billing")).toEqual({
      feature: "Settings",
      route: "/app/settings/billing",
      selectedTab: "billing",
    });
  });

  it("maps support with product context", () => {
    expect(geniusContextForRoute("/app/support")).toEqual({
      feature: "Support",
      route: "/app/support",
    });
  });
});
