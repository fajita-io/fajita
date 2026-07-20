/** Publishable Genius project key. Safe for the browser. */
export const GENIUS_PROJECT_KEY =
  process.env.NEXT_PUBLIC_GENIUS_PROJECT_KEY ??
  "gen_pk_live_Du8Hvh1v1m-yRL3anApAvZp9BLU33tWQ";

export const GENIUS_WIDGET_SRC = "https://genius.ly/widget.js";

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
  return Boolean(GENIUS_PROJECT_KEY?.trim());
}
