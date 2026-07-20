/** Publishable Genius project key. Safe for the browser. */
export const GENIUS_PROJECT_KEY =
  process.env.NEXT_PUBLIC_GENIUS_PROJECT_KEY ??
  "gen_pk_live_Du8Hvh1v1m-yRL3anApAvZp9BLU33tWQ";

export const GENIUS_WIDGET_SRC = "https://genius.ly/widget.js";

export function geniusEnabled(): boolean {
  return Boolean(GENIUS_PROJECT_KEY?.trim());
}
