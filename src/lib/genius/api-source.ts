/** Values Genius accepts on the top-level `source` field. Anything else returns 400. */
const GENIUS_ACCEPTED_SOURCES = new Set([
  "programmatic",
  "custom_trigger",
  "inline_trigger",
  "floating_button",
]);

/** Map Fajita trigger sources to a Genius-safe API source. */
export function toGeniusApiSource(source: string): string {
  return GENIUS_ACCEPTED_SOURCES.has(source) ? source : "custom_trigger";
}
