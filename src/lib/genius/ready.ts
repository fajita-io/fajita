const GENIUS_READY_EVENT = "genius:ready";

export function notifyGeniusReady(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GENIUS_READY_EVENT));
}

export function subscribeGeniusReady(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(GENIUS_READY_EVENT, listener);
  return () => window.removeEventListener(GENIUS_READY_EVENT, listener);
}

export function isGeniusReady(): boolean {
  return typeof window !== "undefined" && Boolean(window.Genius);
}
