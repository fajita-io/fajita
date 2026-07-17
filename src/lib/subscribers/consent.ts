/**
 * Consent copy for status-page subscriptions. Pure and versioned. The exact
 * string a subscriber agrees to is pinned by CONSENT_TEXT_VERSION so consent
 * records are auditable. This is operational-communication consent, never
 * marketing consent, and the wording says so plainly.
 */

import { CONSENT_TEXT_VERSION } from "./constants";

export { CONSENT_TEXT_VERSION };

/** The consent statement shown beneath the subscribe form. */
export function consentStatement(statusPageName: string): string {
  return (
    `By subscribing, you agree to receive operational incident and maintenance email ` +
    `from ${statusPageName}. Confirmation is required. You can update your preferences ` +
    `or unsubscribe at any time. This is not marketing email.`
  );
}

/** One-line explanation used above the form and in email bodies. */
export function subscriptionExplanation(): string {
  return "Receive email when this page publishes an incident, an update, a resolution, or scheduled maintenance.";
}

/** Short label for the current policy/consent version, for records. */
export function currentConsentVersion(): string {
  return CONSENT_TEXT_VERSION;
}
