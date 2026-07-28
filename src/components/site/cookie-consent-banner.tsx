"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { BrandButton } from "@/components/design-system/primitives";
import {
  CONSENT_COOKIE_NAME,
  consentAcceptAll,
  consentCookieOptions,
  decodeConsent,
  defaultConsentDenied,
  encodeConsent,
} from "@/lib/consent/preferences";
import { dispatchConsentUpdated } from "@/lib/consent/events";

function readConsentRaw(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeConsent(raw: string) {
  const opts = consentCookieOptions();
  const parts = [
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(raw)}`,
    `Path=${opts.path}`,
    `Max-Age=${opts.maxAge}`,
    `SameSite=${opts.sameSite}`,
  ];
  if (opts.secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

/**
 * Minimal cookie consent banner. Necessary cookies always run. Analytics and
 * referral attribution wait for an explicit choice.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = decodeConsent(readConsentRaw());
    setVisible(!existing);
  }, []);

  if (!visible) return null;

  const decide = (acceptAll: boolean) => {
    const prefs = acceptAll ? consentAcceptAll() : defaultConsentDenied();
    writeConsent(encodeConsent(prefs));
    dispatchConsentUpdated(prefs);
    setVisible(false);
  };

  return (
    <div
      className="fj-cookie-consent"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div>
        <p className="fj-heading-3 fj-cookie-consent__title">Cookies on this site</p>
        <p className="fj-body-sm fj-cookie-consent__body">
          We use necessary cookies to run the product. With your OK, we also use
          analytics and a referral cookie when you arrive through an affiliate
          link.{" "}
          <Link href="/legal/cookies">Cookie Notice</Link>
        </p>
      </div>
      <div className="fj-cookie-consent__actions">
        <BrandButton type="button" onClick={() => decide(true)}>
          Accept all
        </BrandButton>
        <BrandButton type="button" variant="secondary" onClick={() => decide(false)}>
          Necessary only
        </BrandButton>
      </div>
    </div>
  );
}
