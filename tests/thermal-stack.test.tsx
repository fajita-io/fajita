/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  ThermalStack,
  ThermalStackStatic,
} from "@/components/brand/thermal-stack/thermal-stack";

afterEach(cleanup);

describe("thermal stack", () => {
  it("renders an accessible figure with state description", () => {
    const { container } = render(<ThermalStack state="degraded" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-label")).toContain("degraded");
    expect(container.querySelector("figcaption")?.textContent).toContain(
      "Degraded",
    );
  });

  it("static fallback renders without the animation flag", () => {
    const { container } = render(<ThermalStackStatic state="down" />);
    const figure = container.querySelector(".fj-thermal-stack");
    expect(figure?.getAttribute("data-animated")).toBeNull();
    expect(figure?.getAttribute("data-state")).toBe("down");
  });

  it("animated mode carries reduced-motion overrides", () => {
    const { container } = render(<ThermalStack state="operational" />);
    expect(container.querySelector("style")?.textContent).toContain(
      "prefers-reduced-motion",
    );
  });

  it("simplified mode reduces nodes and drops the alert rail", () => {
    const full = render(<ThermalStack state="down" />);
    const fullTexts = full.container.querySelectorAll("text").length;
    cleanup();
    const simple = render(<ThermalStack state="down" simplified />);
    const simpleTexts = simple.container.querySelectorAll("text").length;
    expect(simpleTexts).toBeLessThan(fullTexts);
  });

  it("shows the alert chip only on confirmed outage", () => {
    const down = render(<ThermalStack state="down" />);
    expect(down.container.textContent).toContain("alert");
    cleanup();
    const ok = render(<ThermalStack state="operational" />);
    expect(ok.container.textContent).not.toContain("alert");
  });
});
