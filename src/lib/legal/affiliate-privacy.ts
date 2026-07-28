/**
 * Affiliate Privacy Notice content (version 1, in force).
 * Operative text for /legal/affiliate-privacy. Keep aligned with
 * AFFILIATE_PRIVACY_VERSION in src/lib/affiliates/config.ts.
 */

import type { LegalBlock, LegalSection } from "./affiliate-agreement";

export const AFFILIATE_PRIVACY_META = {
  title: "Affiliate Privacy Notice",
  version: 2,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
} as const;

export const affiliatePrivacyIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Affiliate Privacy Notice (the "Notice") describes how Fajita ("Fajita," "we," "us," or "our") collects, uses, and shares personal information about individuals who apply to or participate in the Fajita Affiliate Program (the "Program"). It supplements Fajita's Privacy Policy and applies only to affiliate-program activities.`,
  },
  {
    type: "p",
    text: `Last updated: ${AFFILIATE_PRIVACY_META.lastUpdated}. Effective Date: ${AFFILIATE_PRIVACY_META.effectiveDate}.`,
  },
  {
    type: "p",
    text: "Contact for privacy inquiries: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901. You may also use the contact form on fajita.io.",
  },
];

export const affiliatePrivacySections: LegalSection[] = [
  {
    id: "scope",
    heading: "1. Scope",
    blocks: [
      {
        type: "p",
        text: "This Notice covers:",
      },
      {
        type: "ul",
        items: [
          "Affiliate applicants and approved affiliates",
          "Use of referral links and the first-party referral cookie on Fajita sites",
          "Commission, payout, and tax-readiness processing related to the Program",
        ],
      },
      {
        type: "p",
        text: "This Notice does not describe how Fajita processes data about Referred Customers for those customers' own accounts. Affiliates do not receive Referred Customer identity through the Program dashboards.",
      },
    ],
  },
  {
    id: "collect",
    heading: "2. Information we collect",
    blocks: [
      {
        type: "p",
        text: "2.1 Information you provide. Application details (email, country, website, promotion methods, audience description, experience, disclosure practices, and related answers); profile details (display name, contact email, website, channel links); terms acceptance records (program version, terms version, privacy version, timestamp, coarse request context); email preference selections; and communications with Fajita about your affiliate account.",
      },
      {
        type: "p",
        text: "2.2 Information from your account. If you already have a Fajita user account, we link your affiliate record to that account identifier. We do not ask you to create a second login system.",
      },
      {
        type: "p",
        text: "2.3 Information from referral activity. When someone uses your Referral Link, we may record an opaque session identifier in a first-party cookie, click and session metadata (destination path, coarse bot classification, referrer domain category, timestamps), and attribution to an organization after signup, without exposing that organization's identity to you. We do not use third-party advertising cookies or device fingerprinting for affiliate attribution.",
      },
      {
        type: "p",
        text: "2.4 Information from our payment provider. For payouts, our payment provider (for example Stripe Connect) may collect identity, bank, and tax information directly from you. Fajita stores payout account status, connected account references, and coarse tax readiness states. Fajita does not store full bank account numbers or full tax identification numbers.",
      },
      {
        type: "p",
        text: "2.5 Automatically collected technical data. Security and abuse controls may process short-lived technical signals (such as user-agent category for bot detection). We do not retain standing IP address logs for affiliate tracking as a core Program feature.",
      },
    ],
  },
  {
    id: "use",
    heading: "3. How we use information",
    blocks: [
      {
        type: "p",
        text: "We use affiliate-program information to:",
      },
      {
        type: "ul",
        items: [
          "Review applications and operate Program membership",
          "Attribute referrals and calculate Commissions",
          "Process payouts and maintain statements",
          "Detect and investigate fraud and policy violations",
          "Send Program-related email (account messages and optional categories you control in preferences)",
          "Maintain audit records and comply with law",
          "Improve Program integrity and support",
        ],
      },
      {
        type: "p",
        text: "We do not sell affiliate personal information. We do not use Referred Customer personal data to market to those customers on an Affiliate's behalf beyond operating the Program.",
      },
      {
        type: "p",
        text: "Legal bases (EEA, UK, and similar jurisdictions). Where required, we rely on performance of a contract, legitimate interests (such as fraud prevention and Program integrity), consent where applicable, and compliance with legal obligations.",
      },
    ],
  },
  {
    id: "sharing",
    heading: "4. Sharing",
    blocks: [
      {
        type: "p",
        text: "We may share information with:",
      },
      {
        type: "ul",
        items: [
          "Service providers that process data on our behalf (hosting, database, email delivery, payment processing, and product analytics that receives only non-identifying event names and coarse enums)",
          "Professional advisors and authorities when required by law or to protect rights and safety",
          "A successor in connection with a merger, acquisition, or asset sale, subject to appropriate confidentiality",
        ],
      },
      {
        type: "p",
        text: "Affiliates see only their own performance aggregates and earnings. They do not receive Referred Customer names, emails, or payment details.",
      },
    ],
  },
  {
    id: "retention",
    heading: "5. Retention",
    blocks: [
      {
        type: "p",
        text: "We retain application, membership, commission, ledger, payout, and audit records for as long as needed to operate the Program, resolve disputes, meet tax and legal obligations, and enforce this Notice and the Affiliate Program Agreement. When an account is closed, history may remain available to the Affiliate for legitimate access and to Fajita for compliance. Export of your own commission and statement data may be available through the Affiliate dashboard where implemented.",
      },
    ],
  },
  {
    id: "choices",
    heading: "6. Your choices and privacy rights",
    blocks: [
      {
        type: "ul",
        items: [
          "Update profile and contact email in the Affiliate settings (when your membership state allows)",
          "Manage optional email categories in preferences (account and security-adjacent messages still send)",
          "Request account closure through settings or by contacting Fajita",
          "Where applicable law provides access, correction, deletion, export, or objection rights, contact us using the address above. Authorized agents may submit requests where permitted by law.",
          "If you are a California resident, you may have additional rights under the CCPA as described in Fajita's Privacy Policy, including the right to know and delete, subject to exceptions.",
        ],
      },
    ],
  },
  {
    id: "cookies",
    heading: "7. Cookies and similar technologies",
    blocks: [
      {
        type: "p",
        text: "The Program uses a first-party referral cookie to remember an eligible referral session for the attribution window. The cookie is signed, HttpOnly where supported, and is not used as a cross-site advertising identifier. See the Cookie Notice for site-wide cookie practices.",
      },
    ],
  },
  {
    id: "security",
    heading: "8. Security",
    blocks: [
      {
        type: "p",
        text: "We apply administrative and technical controls appropriate to the sensitivity of Program data, including access controls that limit Affiliate-readable data to each Affiliate's own records. No method of transmission or storage is completely secure.",
      },
    ],
  },
  {
    id: "children",
    heading: "9. Children",
    blocks: [
      {
        type: "p",
        text: "The Program is not directed to individuals under 18. We do not knowingly enroll minors as Affiliates.",
      },
    ],
  },
  {
    id: "international",
    heading: "10. International transfers",
    blocks: [
      {
        type: "p",
        text: "Fajita is based in the United States. If you access the Program from another country, your information may be processed in the United States and other locations where our providers operate, subject to applicable safeguards.",
      },
    ],
  },
  {
    id: "changes",
    heading: "11. Changes",
    blocks: [
      {
        type: "p",
        text: "We may update this Notice. Material changes will be indicated by updating the version and Effective Date and, where required, requesting re-acceptance. The version accepted at enrollment is recorded with your terms acceptance.",
      },
    ],
  },
  {
    id: "contact",
    heading: "12. Contact",
    blocks: [
      {
        type: "p",
        text: "Privacy inquiries about the Program: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io with topic Privacy.",
      },
    ],
  },
  {
    id: "relationship",
    heading: "13. Relationship to the Affiliate Program Agreement",
    blocks: [
      {
        type: "p",
        text: "Participation in the Program is also governed by the Affiliate Program Agreement. If there is a conflict about commercial terms (commissions, payouts, promotion rules), the Agreement and Program Terms control. If there is a conflict about personal data practices described here, this Notice controls for privacy disclosures.",
      },
    ],
  },
];
