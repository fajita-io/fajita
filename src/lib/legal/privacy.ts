import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const PRIVACY_META: LegalDocMeta = {
  title: "Privacy Policy",
  version: 1,
  effectiveDate: "2026-07-17",
  lastUpdated: "2026-07-17",
};

export const privacyIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Privacy Policy describes how Fajita ("Fajita," "we," "us," or "our") collects, uses, and shares personal information in connection with fajita.io and the Fajita Service. Contact: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io.`,
  },
  {
    type: "p",
    text: `Effective Date: ${PRIVACY_META.effectiveDate}. Last updated: ${PRIVACY_META.lastUpdated}.`,
  },
];

export const privacySections: LegalSection[] = [
  {
    id: "scope",
    heading: "1. Scope",
    blocks: [
      {
        type: "p",
        text: "This Policy covers visitors to our marketing site, account holders, organization members, status-page subscribers (where you use that feature), early-access and contact-form submitters, and affiliate applicants (supplemented by the Affiliate Privacy Notice).",
      },
    ],
  },
  {
    id: "collect",
    heading: "2. Information we collect",
    blocks: [
      {
        type: "ul",
        items: [
          "Account and profile information (name, email, authentication identifiers from our identity provider)",
          "Organization and billing information (plan, subscription status, invoices; payment details are handled by our payment processor)",
          "Monitor configuration and check results you create or that the Service generates",
          "Alert channel destinations you configure (such as email addresses or webhook URLs)",
          "Status-page content and subscriber email addresses you collect with consent",
          "Support and contact messages",
          "Product analytics events that do not include secrets or unnecessary personal data",
          "Technical logs needed for security and reliability (retained for limited operational periods)",
        ],
      },
    ],
  },
  {
    id: "use",
    heading: "3. How we use information",
    blocks: [
      {
        type: "ul",
        items: [
          "Provide, secure, and improve the Service",
          "Send transactional and operational messages (account, security, billing, alerts you configure, status-page subscriber mail)",
          "Process payments and prevent fraud",
          "Comply with law and enforce our terms",
          "Respond to contact and support requests",
        ],
      },
      {
        type: "p",
        text: "We do not sell personal information. We do not use status-page subscriber addresses for marketing.",
      },
    ],
  },
  {
    id: "sharing",
    heading: "4. Sharing",
    blocks: [
      {
        type: "p",
        text: "We share personal information with service providers that process data on our behalf (hosting, database, identity, payments, email delivery, analytics), with advisors or authorities when required by law or to protect rights and safety, and with a successor in a corporate transaction subject to appropriate protections. Public status pages publish the content you choose to make public.",
      },
    ],
  },
  {
    id: "retention",
    heading: "5. Retention",
    blocks: [
      {
        type: "p",
        text: "We retain information for as long as needed to provide the Service, meet legal and tax obligations, resolve disputes, and enforce agreements. Retention for monitor history and logs may vary by plan. When an account is deleted, we delete or anonymize personal data except where retention is required by law.",
      },
    ],
  },
  {
    id: "choices",
    heading: "6. Your choices",
    blocks: [
      {
        type: "ul",
        items: [
          "Update profile and organization settings in the product",
          "Manage email preferences where offered (security and essential billing messages still send)",
          "Unsubscribe from status-page subscriber email using the link in those messages",
          "Request access, correction, deletion, or export where applicable law provides those rights by contacting us",
        ],
      },
    ],
  },
  {
    id: "cookies",
    heading: "7. Cookies",
    blocks: [
      {
        type: "p",
        text: "See the Cookie Notice for details. You can accept or limit optional cookies through our consent banner.",
      },
    ],
  },
  {
    id: "security",
    heading: "8. Security",
    blocks: [
      {
        type: "p",
        text: "We apply administrative and technical controls appropriate to the sensitivity of the data, including access controls and encryption of certain secrets at rest. No method of transmission or storage is completely secure.",
      },
    ],
  },
  {
    id: "children",
    heading: "9. Children",
    blocks: [
      {
        type: "p",
        text: "The Service is not directed to children under 18. We do not knowingly collect personal information from children.",
      },
    ],
  },
  {
    id: "international",
    heading: "10. International transfers",
    blocks: [
      {
        type: "p",
        text: "Fajita is based in the United States. Information may be processed in the United States and other locations where our providers operate.",
      },
    ],
  },
  {
    id: "changes",
    heading: "11. Changes",
    blocks: [
      {
        type: "p",
        text: "We may update this Policy. Material changes will be indicated by updating the date above. Continued use after the effective date constitutes acceptance where permitted by law.",
      },
    ],
  },
];
