import type { ConsentPreferences } from "./preferences";

/** Dispatched when the visitor updates cookie preferences in the banner. */
export const CONSENT_UPDATED_EVENT = "fajita:consent-updated";

export type ConsentUpdatedDetail = ConsentPreferences;

export function dispatchConsentUpdated(prefs: ConsentPreferences) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ConsentUpdatedDetail>(CONSENT_UPDATED_EVENT, {
      detail: prefs,
    }),
  );
}
