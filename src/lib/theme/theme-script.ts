export const THEME_STORAGE_KEY = "fajita-theme";

export type ThemePreference = "light" | "dark" | "system";

/**
 * Inline script injected in the document head before paint. Resolves the
 * stored preference (or system preference) and sets data-theme on <html>
 * so there is never a flash of the wrong theme.
 *
 * Kept dependency-free and stringified; do not reference imports inside.
 */
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): "light" | "dark" {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}
