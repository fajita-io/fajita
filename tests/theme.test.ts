/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import {
  THEME_STORAGE_KEY,
  resolveTheme,
  themeInitScript,
} from "@/lib/theme/theme-script";

describe("theme resolution", () => {
  it("explicit preferences win over system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("system preference follows OS", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("pre-paint init script", () => {
  it("references the storage key and sets data-theme", () => {
    expect(themeInitScript).toContain(THEME_STORAGE_KEY);
    expect(themeInitScript).toContain("dataset.theme");
    expect(themeInitScript).toContain("prefers-color-scheme: dark");
  });

  it("fails safe to light theme", () => {
    expect(themeInitScript).toContain('dataset.theme="light"');
  });

  it("applies the correct theme when executed", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    eval(themeInitScript);
    expect(document.documentElement.dataset.theme).toBe("dark");

    window.localStorage.removeItem(THEME_STORAGE_KEY);
    eval(themeInitScript);
    expect(["light", "dark"]).toContain(document.documentElement.dataset.theme);
  });
});
