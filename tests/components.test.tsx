import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusBadge, StatusDot } from "@/components/design-system/status/status-badge";
import { StatusIcon } from "@/components/design-system/status/status-icon";
import { UptimeChart, sampleUptimeDays } from "@/components/design-system/uptime-chart";
import { BrandButton, Tooltip } from "@/components/design-system/primitives";

afterEach(cleanup);

describe("status components", () => {
  it("badge always pairs icon with a text label (never color-only)", () => {
    const { container } = render(<StatusBadge status="down" />);
    expect(container.textContent).toContain("Down");
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("dot is aria-hidden decoration for adjacent labels", () => {
    const { container } = render(<StatusDot status="operational" />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("standalone status icons can carry an accessible name", () => {
    render(<StatusIcon status="degraded" labelled />);
    expect(screen.getByRole("img", { name: "Degraded" })).toBeTruthy();
  });
});

describe("uptime chart", () => {
  it("provides a text alternative summarizing every non-operational day", () => {
    const days = sampleUptimeDays(90, 7);
    const { container } = render(
      <UptimeChart days={days} label="api.acme.dev · last 90 days" />,
    );
    const bad = days.filter((d) => d.status !== "operational");
    expect(bad.length).toBeGreaterThan(0);
    expect(container.textContent).toContain(bad[0].date);
    expect(container.querySelectorAll("rect")).toHaveLength(90);
  });

  it("sample data is deterministic", () => {
    expect(sampleUptimeDays(90, 7)).toEqual(sampleUptimeDays(90, 7));
  });
});

describe("interactive primitives", () => {
  it("buttons are native buttons with visible text", () => {
    render(<BrandButton>Start monitoring</BrandButton>);
    expect(screen.getByRole("button", { name: "Start monitoring" })).toBeTruthy();
  });

  it("tooltip content is exposed via role=tooltip and works without hover", () => {
    render(
      <Tooltip content="Checks run every 30 seconds">
        <button>anchor</button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip").textContent).toBe(
      "Checks run every 30 seconds",
    );
  });
});
