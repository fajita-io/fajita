import { Fraunces, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";

/**
 * Fajita type system. Three roles, all Google Fonts under the SIL Open Font
 * License (legal for web embedding and self-hosting via next/font).
 *
 * - Display: Fraunces. Warm, sharp editorial serif with optical sizing.
 *   Carries brand personality in heroes and section openers.
 * - Interface/reading: Instrument Sans. Legible grotesque with enough
 *   warmth to sit next to Fraunces without fighting it.
 * - Technical accent: Spline Sans Mono. Endpoints, timestamps, response
 *   times, code. Used sparingly and deliberately.
 */

export const displayFont = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

export const interfaceFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: true,
  preload: false,
});

export const monoFont = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: true,
  preload: false,
});

export const fontVariables = `${displayFont.variable} ${interfaceFont.variable} ${monoFont.variable}`;
