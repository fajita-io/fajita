import { describe, expect, it } from "vitest";

import {
  analyticsConsentGranted,
  consentAcceptAll,
  defaultConsentDenied,
  encodeConsent,
  referralConsentGranted,
} from "@/lib/consent/preferences";

describe("consent preferences", () => {
  it("denies analytics until accept-all", () => {
    expect(analyticsConsentGranted(null)).toBe(false);
    expect(analyticsConsentGranted(encodeConsent(defaultConsentDenied()))).toBe(
      false,
    );
    expect(analyticsConsentGranted(encodeConsent(consentAcceptAll()))).toBe(true);
  });

  it("allows referral attribution before a choice", () => {
    expect(referralConsentGranted(null)).toBe(true);
    expect(referralConsentGranted(encodeConsent(defaultConsentDenied()))).toBe(
      false,
    );
  });
});
