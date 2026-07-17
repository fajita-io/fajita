/**
 * First-party cookie consent preferences.
 *
 * Necessary cookies (session/auth) do not require a choice. Analytics and
 * referral attribution are optional. The consent cookie itself is necessary
 * (records the choice).
 */

export const CONSENT_COOKIE_NAME = "fj_consent";
export const CONSENT_COOKIE_VERSION = "1";
/** One year. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentPreferences = {
  version: typeof CONSENT_COOKIE_VERSION;
  /** Product analytics (DataFast). */
  analytics: boolean;
  /** Affiliate referral cookie (fj_ref). */
  referral: boolean;
  decidedAt: string;
};

export function defaultConsentDenied(): ConsentPreferences {
  return {
    version: CONSENT_COOKIE_VERSION,
    analytics: false,
    referral: false,
    decidedAt: new Date().toISOString(),
  };
}

export function consentAcceptAll(): ConsentPreferences {
  return {
    version: CONSENT_COOKIE_VERSION,
    analytics: true,
    referral: true,
    decidedAt: new Date().toISOString(),
  };
}

export function encodeConsent(prefs: ConsentPreferences): string {
  return [
    prefs.version,
    prefs.analytics ? "1" : "0",
    prefs.referral ? "1" : "0",
    prefs.decidedAt,
  ].join(".");
}

export function decodeConsent(raw: string | undefined | null): ConsentPreferences | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 4) return null;
  const [version, analytics, referral, ...rest] = parts;
  if (version !== CONSENT_COOKIE_VERSION) return null;
  const decidedAt = rest.join(".");
  if (!decidedAt) return null;
  return {
    version: CONSENT_COOKIE_VERSION,
    analytics: analytics === "1",
    referral: referral === "1",
    decidedAt,
  };
}

export function consentCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CONSENT_MAX_AGE_SECONDS,
  };
}

/**
 * Whether the referral attribution cookie may be set.
 * Allowed when the visitor accepted referral cookies, or has not decided yet
 * (first-party functional attribution). Denied only after an explicit
 * "necessary only" choice.
 */
export function referralConsentGranted(raw: string | undefined | null): boolean {
  const prefs = decodeConsent(raw);
  if (!prefs) return true;
  return prefs.referral === true;
}
