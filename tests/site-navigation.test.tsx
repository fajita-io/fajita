/**
 * @vitest-environment jsdom
 *
 * Global navigation: link integrity, keyboard behavior, menu closing,
 * and presence of shipped public surfaces in nav and footer.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeaderContent } from "@/components/site/site-header-content";
import { cta } from "@/lib/site/site-config";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(cleanup);

describe("site header", () => {
  it("renders the primary nav landmarks and CTA", () => {
    render(<SiteHeaderContent pathname="/" />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Fajita home" })).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: cta.primary.label }).length,
    ).toBeGreaterThan(0);
  });

  it("features dropdown opens, lists all six feature pages, and closes on Escape", () => {
    render(<SiteHeaderContent pathname="/" />);
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

  it("links to primary nav surfaces", () => {
    const { container } = render(<SiteHeaderContent pathname="/" />);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("/pricing");
    expect(hrefs).toContain(cta.primary.href);
  });
});

describe("site footer", () => {
  it("renders product, company, and legal groups with shipped links", () => {
    const { container } = render(<SiteFooter />);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("/pricing");
    expect(hrefs).toContain("/legal");
    expect(hrefs).toContain("/security");
    expect(hrefs).toContain("/status");
    expect(hrefs).toContain("https://www.linkedin.com/company/fajita-io");
    for (const required of ["/blog", "/docs", "/glossary", "/tools"]) {
      expect(hrefs).toContain(required);
    }
  });

  it("renders the kinetic footer finale without the mailing address", () => {
    const { container } = render(<SiteFooter />);
    expect(container.textContent).toContain("The watch before the fire.");
    expect(container.textContent).not.toContain("Built by");
    expect(container.textContent).not.toContain("Accomplish");
    expect(container.textContent).not.toContain("Made in Montana");
    expect(container.textContent).not.toContain("Kalispell, MT 59901");
    expect(
      container.querySelector('a[href="https://accompli.sh"]'),
    ).toBeNull();
    expect(container.querySelector(".fj-footer-finale")).not.toBeNull();
    expect(container.querySelector(".fj-footer__mobile-close")).not.toBeNull();
  });
});
