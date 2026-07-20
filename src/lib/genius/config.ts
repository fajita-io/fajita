/** Publishable Genius project key. Safe for the browser. */
export const GENIUS_PROJECT_KEY =
  process.env.NEXT_PUBLIC_GENIUS_PROJECT_KEY?.trim() ?? "";

export const GENIUS_WIDGET_SRC = "https://genius.ly/widget.js";

/** Matches Genius publishable key format (client-side only). */
export function isValidGeniusProjectKeyFormat(key: string): boolean {
  return (
    key.length >= 20 &&
    key.length <= 120 &&
    (key.startsWith("gen_pk_live_") || key.startsWith("gen_pk_test_"))
  );
}

/** Fajita-facing copy for triggers we control in the app shell. */
export const GENIUS_FEEDBACK_LABEL = "Share feedback";

/**
 * Match these in the Genius project dashboard (Feedback collection → Widget
 * appearance) so the modal uses Fajita heat tones instead of default Genius purple.
 */
export const GENIUS_DASHBOARD_BRAND = {
  signalName: "Product signal",
  headline: "What would make this impossible to leave?",
  subhead: "Tell us while the thought is still fresh.",
  poweredBy: false,
} as const;

export function geniusEnabled(): boolean {
  return isValidGeniusProjectKeyFormat(GENIUS_PROJECT_KEY);
}
