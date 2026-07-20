/** @vitest-environment jsdom */
/**
 * Interactive product journey: gated progression, reset, keyboard-reachable
 * controls, and the guarantee that the demo never performs network requests.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductJourney } from "@/components/site/home/product-journey";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("product journey demo", () => {
  it("starts at step one with all steps keyboard-reachable buttons", () => {
    render(<ProductJourney />);
    const nav = screen.getByRole("group", { name: "Journey steps" });
    const steps = nav.querySelectorAll("button");
    expect(steps.length).toBe(9);
    expect(steps[0].getAttribute("aria-current")).toBe("step");
  });

  it("makes no network requests while interacting", () => {
    render(<ProductJourney />);
    const nav = screen.getByRole("group", { name: "Journey steps" });
    fireEvent.click(nav.querySelectorAll("button")[1]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("walks the full journey through every gate, then resets", () => {
    render(<ProductJourney />);
    const nav = screen.getByRole("group", { name: "Journey steps" });
    const current = () =>
      Array.from(nav.querySelectorAll("button")).findIndex(
        (b) => b.getAttribute("aria-current") === "step",
      );
    const clickIfPresent = (name: RegExp) => {
      const button = screen
        .queryAllByRole("button")
        .find((b) => name.test(b.textContent ?? ""));
      if (button) fireEvent.click(button);
    };
    const advance = () =>
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    /* Gated steps stay gated: Continue on the test step is disabled
       until the test check runs. */
    advance(); // -> frequency
    advance(); // -> test
    expect(current()).toBe(2);
    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect((continueButton as HTMLButtonElement).disabled).toBe(true);

    clickIfPresent(/Run a test check/);
    advance(); // -> alert channel
    advance(); // -> status page
    clickIfPresent(/Publish the status page/);
    advance(); // -> failure
    clickIfPresent(/Simulate a failure/);
    advance(); // -> alert
    advance(); // -> recovery
    clickIfPresent(/Deploy the fix/);
    advance(); // -> history
    expect(current()).toBe(8);

    fireEvent.click(screen.getByRole("button", { name: "Run it again" }));
    expect(current()).toBe(0);
  });
});
