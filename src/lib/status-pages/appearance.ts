/**
 * Appearance tokens for status pages. Customers pick from a constrained set of
 * safe options (theme, accent color, density, radius, header style). No
 * arbitrary CSS, fonts, HTML, or JavaScript ever reaches the renderer.
 *
 * Accent color is validated for contrast so branding can never make status or
 * link text unreadable. Client-safe.
 */

import { STATUS_PAGE_THEMES, type StatusPageTheme } from "./constants";

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

export const RADII = ["sharp", "soft", "round"] as const;
export type Radius = (typeof RADII)[number];

export const HEADER_STYLES = ["minimal", "bordered"] as const;
export type HeaderStyle = (typeof HEADER_STYLES)[number];

export interface Appearance {
  accentColor: string;
  density: Density;
  radius: Radius;
  headerStyle: HeaderStyle;
}

export const DEFAULT_APPEARANCE: Appearance = {
  accentColor: "#c2410c",
  density: "comfortable",
  radius: "soft",
  headerStyle: "bordered",
};

/** Theme base backgrounds used for contrast validation and rendering. */
export const THEME_BACKGROUND: Record<StatusPageTheme, { bg: string; isDark: boolean }> = {
  signal: { bg: "#ffffff", isDark: false },
  ember: { bg: "#fbf7f2", isDark: false },
  paper: { bg: "#fdfdfc", isDark: false },
  midnight: { bg: "#0b0d12", isDark: true },
};

export function parseHexColor(value: string): { r: number; g: number; b: number } | null {
  const hex = value.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: string, b: string): number | null {
  const ca = parseHexColor(a);
  const cb = parseHexColor(b);
  if (!ca || !cb) return null;
  const la = relativeLuminance(ca);
  const lb = relativeLuminance(cb);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export type AppearanceValidation =
  | { ok: true; appearance: Appearance }
  | { ok: false; reason: string; field: string };

/**
 * Validate an appearance payload. The accent color must reach at least 3:1
 * against the theme background (used for large text, buttons, and links with
 * an underline), otherwise publication is blocked with a clear reason.
 */
export function validateAppearance(
  input: Partial<Appearance>,
  theme: StatusPageTheme,
): AppearanceValidation {
  const accentColor = (input.accentColor ?? DEFAULT_APPEARANCE.accentColor).trim();
  if (!parseHexColor(accentColor)) {
    return { ok: false, reason: "Enter a valid hex color like #c2410c.", field: "accentColor" };
  }
  const density = DENSITIES.includes(input.density as Density)
    ? (input.density as Density)
    : DEFAULT_APPEARANCE.density;
  const radius = RADII.includes(input.radius as Radius)
    ? (input.radius as Radius)
    : DEFAULT_APPEARANCE.radius;
  const headerStyle = HEADER_STYLES.includes(input.headerStyle as HeaderStyle)
    ? (input.headerStyle as HeaderStyle)
    : DEFAULT_APPEARANCE.headerStyle;

  const bg = THEME_BACKGROUND[theme]?.bg ?? "#ffffff";
  const ratio = contrastRatio(accentColor, bg);
  if (ratio !== null && ratio < 3) {
    return {
      ok: false,
      reason:
        "This accent color is too low-contrast for the selected theme. Choose a darker or more saturated color so buttons and links stay readable.",
      field: "accentColor",
    };
  }

  return { ok: true, appearance: { accentColor, density, radius, headerStyle } };
}

export function coerceTheme(value: unknown): StatusPageTheme {
  return STATUS_PAGE_THEMES.includes(value as StatusPageTheme)
    ? (value as StatusPageTheme)
    : "signal";
}

export function coerceAppearance(value: unknown): Appearance {
  const raw = (value ?? {}) as Partial<Appearance>;
  return {
    accentColor: parseHexColor(raw.accentColor ?? "") ? (raw.accentColor as string) : DEFAULT_APPEARANCE.accentColor,
    density: DENSITIES.includes(raw.density as Density) ? (raw.density as Density) : DEFAULT_APPEARANCE.density,
    radius: RADII.includes(raw.radius as Radius) ? (raw.radius as Radius) : DEFAULT_APPEARANCE.radius,
    headerStyle: HEADER_STYLES.includes(raw.headerStyle as HeaderStyle)
      ? (raw.headerStyle as HeaderStyle)
      : DEFAULT_APPEARANCE.headerStyle,
  };
}
