/**
 * Global navigation: link integrity, keyboard behavior, menu closing,
 * and the rule that unbuilt areas (blog, docs, glossary, tools) never
 * appear in nav or footer.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

afterEach(cleanup);

describe("site header", () => {
  it("renders the primary nav landmarks and CTA", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Fajita home" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "Get early access" }).length).toBeGreaterThan(0);
  });

  it("features dropdown opens, lists all six feature pages, and closes on Escape", () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: /features/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = document.getElementById(trigger.getAttribute("aria-controls")!);
    expect(menu).toBeTruthy();
    for (const name of [
      "Uptime monitoring",
      "API monitoring",
      "SSL monitoring",
      "Cron monitoring",
      "Status pages",
      "Incident communication",
    ]) {
      expect(menu!.textContent).toContain(name);
    }

    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("mobile menu button toggles the panel with an accessible name", () => {
    render(<SiteHeader />);
    const button = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Close menu" })).toBeTruthy();
    const panel = document.getElementById("fj-mobile-panel");
    expect(panel?.hasAttribute("hidden")).toBe(false);
  });

  it("does not link to unbuilt areas", () => {
    const { container } = render(<SiteHeader />);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    for (const forbidden of ["/blog", "/docs", "/glossary", "/tools", "/affiliates"]) {
      expect(hrefs).not.toContain(forbidden);
    }
  });
});

describe("site footer", () => {
  it("renders product, company, and legal groups without unbuilt links", () => {
    const { container } = render(<SiteFooter />);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("/pricing");
    expect(hrefs).toContain("/legal");
    expect(hrefs).toContain("/status");
    for (const forbidden of ["/blog", "/docs", "/glossary", "/tools", "/affiliates"]) {
      expect(hrefs).not.toContain(forbidden);
    }
  });

  it("shows the real company address, not a placeholder", () => {
    const { container } = render(<SiteFooter />);
    expect(container.textContent).toContain("Kalispell, MT 59901");
  });
});
