import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const COOKIES_META: LegalDocMeta = {
  title: "Cookie Notice",
  version: 1,
  effectiveDate: "2026-07-17",
  lastUpdated: "2026-07-17",
};

export const cookiesIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Cookie Notice explains how Fajita uses cookies and similar technologies on fajita.io. It should be read with our Privacy Policy. Effective Date: ${COOKIES_META.effectiveDate}.`,
  },
];

export const cookiesSections: LegalSection[] = [
  {
    id: "what",
    heading: "1. What are cookies",
    blocks: [
      {
        type: "p",
        text: "Cookies are small text files stored on your device. We also use similar local storage where needed for the product to function.",
      },
    ],
  },
  {
    id: "types",
    heading: "2. Cookies we use",
    blocks: [
      {
        type: "ul",
        items: [
          "Necessary: authentication and session cookies from our identity provider; security and load-balancing cookies; the consent preference cookie that records your choice",
          "Analytics: product analytics that help us understand site usage without building advertising profiles (only when you accept analytics)",
          "Referral: a first-party signed referral cookie used for affiliate attribution when you arrive through an affiliate link (allowed until you choose necessary-only; not set after you refuse referral cookies)",
        ],
      },
    ],
  },
  {
    id: "choices",
    heading: "3. Your choices",
    blocks: [
      {
        type: "p",
        text: 'You can choose "Accept all" or "Necessary only" in our cookie banner. You can also clear cookies in your browser. Blocking necessary cookies may prevent sign-in or core product functions.',
      },
    ],
  },
  {
    id: "contact",
    heading: "4. Contact",
    blocks: [
      {
        type: "p",
        text: "Questions: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io.",
      },
    ],
  },
];
