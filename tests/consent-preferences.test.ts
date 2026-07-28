import { describe, expect, it } from "vitest";

import {
  analyticsConsentGranted,
  consentAcceptAll,
  defaultConsentDenied,
  encodeConsent,
  referralConsentGranted,
} from "@/lib/consent/preferences";

describe("consent preferences", () => {
  it("defaults analytics and referral to granted without a cookie", () => {
    expect(analyticsConsentGranted(null)).toBe(true);
    expect(referralConsentGranted(null)).toBe(true);
  });

  it("honors legacy necessary-only cookies", () => {
    expect(analyticsConsentGranted(encodeConsent(defaultConsentDenied()))).toBe(
      false,
    );
    expect(referralConsentGranted(encodeConsent(defaultConsentDenied()))).toBe(
      false,
    );
    expect(analyticsConsentGranted(encodeConsent(consentAcceptAll()))).toBe(true);
    expect(referralConsentGranted(encodeConsent(consentAcceptAll()))).toBe(true);
  });
});
