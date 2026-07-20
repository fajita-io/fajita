/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { FajitaWordmark } from "@/components/brand/logo/fajita-wordmark";
import { FajitaPoweredBy } from "@/components/brand/powered-by/fajita-powered-by";
import wordmarkData from "@/components/brand/logo/wordmark-data.json";

afterEach(cleanup);

describe("logo components", () => {
  it("mark exposes an accessible name by default", () => {
    render(<FajitaMark />);
    expect(screen.getByRole("img", { name: "Fajita" })).toBeTruthy();
  });

  it("mark becomes decorative with an empty label", () => {
    const { container } = render(<FajitaMark label="" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("role")).toBeNull();
  });

  it("wordmark renders baked outline paths plus the ember dot", () => {
    const { container } = render(<FajitaWordmark />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(wordmarkData.paths.length);
    expect(container.querySelector("circle")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Fajita" })).toBeTruthy();
  });

  it("horizontal lockup marks the symbol decorative so only one name is exposed", () => {
    render(<FajitaLogo orientation="horizontal" />);
    expect(screen.getAllByRole("img", { name: "Fajita" })).toHaveLength(1);
  });

  it("mark switches to the small-size optical variant under 20px", () => {
    const { container } = render(<FajitaMark size={16} />);
    const path = container.querySelector("path");
    expect(path?.getAttribute("stroke-width")).toBe("6.5");
  });

  it("animation is opt-in", () => {
    const { container: still } = render(<FajitaMark />);
    expect(still.querySelector("style")).toBeNull();
    const { container: animated } = render(<FajitaMark animated />);
    expect(animated.querySelector("style")?.textContent).toContain(
      "prefers-reduced-motion",
    );
  });

  it("powered-by lockup links out and names Fajita", () => {
    render(<FajitaPoweredBy />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("https://fajita.io");
    expect(link.textContent).toContain("Powered by");
    expect(link.textContent).toContain("Fajita");
  });
});

describe("wordmark data integrity", () => {
  it("has sane geometry and the ember dot inside bounds", () => {
    expect(wordmarkData.width).toBeGreaterThan(100);
    expect(wordmarkData.height).toBeGreaterThan(50);
    expect(wordmarkData.paths.length).toBe(6); // F a ȷ i t a
    const { cx, cy, r } = wordmarkData.emberDot;
    expect(r).toBeGreaterThan(2);
    expect(cx).toBeGreaterThan(0);
    expect(cx).toBeLessThan(wordmarkData.width);
    expect(cy).toBeGreaterThan(0);
    expect(cy).toBeLessThan(wordmarkData.height);
  });
});
