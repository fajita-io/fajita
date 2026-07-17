import { describe, expect, it } from "vitest";

import {
  consentAcceptAll,
  decodeConsent,
  defaultConsentDenied,
  encodeConsent,
  referralConsentGranted,
} from "./preferences";

describe("consent preferences", () => {
  it("round-trips accept-all and necessary-only", () => {
    const all = consentAcceptAll();
    const none = defaultConsentDenied();
    expect(decodeConsent(encodeConsent(all))?.analytics).toBe(true);
    expect(decodeConsent(encodeConsent(none))?.referral).toBe(false);
  });

  it("allows referral before a decision and after accept; denies after refuse", () => {
    expect(referralConsentGranted(null)).toBe(true);
    expect(referralConsentGranted(encodeConsent(consentAcceptAll()))).toBe(true);
    expect(referralConsentGranted(encodeConsent(defaultConsentDenied()))).toBe(
      false,
    );
  });
});
