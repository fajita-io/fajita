import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const COOKIES_META: LegalDocMeta = {
  title: "Cookie Notice",
  version: 2,
  effectiveDate: "2026-07-28",
  lastUpdated: "2026-07-28",
};

export const cookiesIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Cookie Notice explains how Fajita uses cookies and similar technologies on fajita.io and related sites. It should be read with our Privacy Policy. Effective Date: ${COOKIES_META.effectiveDate}. Last updated: ${COOKIES_META.lastUpdated}.`,
  },
];

export const cookiesSections: LegalSection[] = [
  {
    id: "what",
    heading: "1. What are cookies and similar technologies",
    blocks: [
      {
        type: "p",
        text: "Cookies are small text files stored on your device when you visit a website. We also use similar browser storage where needed for the product to function. Cookies may be first-party (set by Fajita) or third-party (set by a provider whose service we use).",
      },
    ],
  },
  {
    id: "types",
    heading: "2. Categories of cookies we use",
    blocks: [
      {
        type: "p",
        text: "2.1 Necessary cookies. These cookies are required for core site and product functions. They include authentication and session cookies from our identity provider and security and load-balancing cookies. These cookies do not require consent in many jurisdictions because they are strictly necessary.",
      },
      {
        type: "p",
        text: "2.2 Analytics cookies. We use product analytics to understand site usage and improve the Service. Analytics is configured to avoid building advertising profiles and to minimize personal data collection.",
      },
      {
        type: "p",
        text: "2.3 Referral cookies. When you arrive through an affiliate link, we may set a first-party referral cookie to attribute a signup within the program attribution window. Referral cookies are described further in the Affiliate Privacy Notice.",
      },
    ],
  },
  {
    id: "table",
    heading: "3. Key cookies",
    blocks: [
      {
        type: "p",
        text: "The table below describes principal first-party cookies. Provider session cookies from our identity partner may also appear with names controlled by that provider.",
      },
      {
        type: "ul",
        items: [
          "fj_ref (Fajita, attribution window up to 30 days): stores an opaque referral session identifier for affiliate attribution when permitted",
          "Identity session cookies (identity provider, session or provider-defined duration): maintain signed-in state and security for authenticated areas",
        ],
      },
    ],
  },
  {
    id: "choices",
    heading: "4. Your choices",
    blocks: [
      {
        type: "ol",
        items: [
          "Block or delete cookies through your browser settings. Blocking necessary cookies may prevent sign-in or core product functions.",
          "Where your browser sends a recognized global opt-out signal and we are required to honor it for optional cookies, we will treat that signal according to applicable law and our product configuration then in effect.",
        ],
      },
    ],
  },
  {
    id: "browser",
    heading: "5. Browser controls",
    blocks: [
      {
        type: "p",
        text: "Most browsers allow you to refuse or delete cookies. Refer to your browser's help documentation for instructions. Because controls vary by browser and version, we do not guarantee that every control will affect every cookie.",
      },
    ],
  },
  {
    id: "contact",
    heading: "6. Contact",
    blocks: [
      {
        type: "p",
        text: "Questions about this Notice: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io with topic Privacy.",
      },
    ],
  },
  {
    id: "changes",
    heading: "7. Changes",
    blocks: [
      {
        type: "p",
        text: "We may update this Notice by publishing a revised version with a new Effective Date.",
      },
    ],
  },
];
