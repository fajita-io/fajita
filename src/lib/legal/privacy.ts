import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const PRIVACY_META: LegalDocMeta = {
  title: "Privacy Policy",
  version: 2,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const privacyIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Privacy Policy ("Policy") describes how Fajita ("Fajita," "we," "us," or "our") collects, uses, discloses, and otherwise processes personal information in connection with fajita.io, the Fajita Service, and related communications.`,
  },
  {
    type: "p",
    text: `Effective Date: ${PRIVACY_META.effectiveDate}. Last updated: ${PRIVACY_META.lastUpdated}. Contact for privacy inquiries: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io with topic Privacy.`,
  },
  {
    type: "p",
    text: "This Policy is designed to be read alongside our Cookie Notice. It does not constitute legal advice.",
  },
];

export const privacySections: LegalSection[] = [
  {
    id: "scope",
    heading: "1. Scope and roles",
    blocks: [
      {
        type: "p",
        text: "This Policy applies to:",
      },
      {
        type: "ul",
        items: [
          "Visitors to our marketing and content sites",
          "Account holders and organization members",
          "Status-page subscribers where you use that feature",
          "Early-access, contact-form, and support request submitters",
          "Affiliate applicants and participants (supplemented by the Affiliate Privacy Notice)",
        ],
      },
      {
        type: "p",
        text: 'For most account and Service data, Fajita acts as a "controller" (or equivalent under applicable law) determining how personal information is processed. Where you use the Service to monitor systems, publish status pages, or send alerts to your users, you may also act as a controller with respect to personal information you submit about your users or subscribers. In those cases, you are responsible for providing appropriate notices and obtaining required consents.',
      },
    ],
  },
  {
    id: "collect",
    heading: "2. Information we collect",
    blocks: [
      {
        type: "p",
        text: "We collect the categories of information below, depending on how you interact with us.",
      },
      {
        type: "p",
        text: "2.1 Account and identity information. Name, email address, authentication identifiers, organization membership, role assignments, and profile settings.",
      },
      {
        type: "p",
        text: "2.2 Billing and transaction information. Plan selection, subscription status, invoices, payment history, and billing contact details. Payment card and bank account details are collected and processed by our payment processor; Fajita does not store full payment card numbers.",
      },
      {
        type: "p",
        text: "2.3 Service configuration and operational data. Monitor definitions, check schedules, alert channel destinations (such as email addresses, Slack or Discord webhook URLs, and generic HTTPS webhook endpoints), routing rules, incident records, maintenance windows, status-page content, and related metadata you configure.",
      },
      {
        type: "p",
        text: "2.4 Status-page subscriber information. If you enable subscriber notifications, we process email addresses and related subscription preferences you collect from your users, along with delivery and unsubscribe records.",
      },
      {
        type: "p",
        text: "2.5 Communications. Support messages, contact-form submissions, security reports, and other correspondence with Fajita.",
      },
      {
        type: "p",
        text: "2.6 Product analytics. Event data about how the site and product are used, such as page views and feature interactions, collected through our analytics tools when you consent to analytics cookies or where otherwise permitted. We configure analytics to avoid collecting secrets, payment details, or unnecessary personal data.",
      },
      {
        type: "p",
        text: "2.7 Technical and security logs. IP addresses, user-agent strings, timestamps, request metadata, authentication events, and similar technical data retained for limited periods for security, abuse prevention, troubleshooting, and reliability.",
      },
      {
        type: "p",
        text: "2.8 Referral and affiliate data. Where applicable, referral session identifiers, coarse attribution metadata, and affiliate-program records as described in the Affiliate Privacy Notice.",
      },
    ],
  },
  {
    id: "sources",
    heading: "3. Sources of information",
    blocks: [
      {
        type: "ul",
        items: [
          "Directly from you when you register, configure the Service, contact us, or participate in programs",
          "Automatically when you use the Service or visit our sites",
          "From our service providers (such as payment confirmation and identity authentication)",
          "From your organization administrators if you are an organization member",
        ],
      },
    ],
  },
  {
    id: "use",
    heading: "4. How we use information",
    blocks: [
      {
        type: "p",
        text: "We use personal information to:",
      },
      {
        type: "ul",
        items: [
          "Provide, operate, maintain, and improve the Service",
          "Authenticate users and manage organizations, roles, and entitlements",
          "Run monitoring checks, detect incidents, deliver alerts, and operate status pages",
          "Process payments, manage subscriptions, and prevent fraud",
          "Send transactional and operational messages (account, security, billing, configured alerts, and status-page subscriber mail)",
          "Respond to inquiries, provide support, and investigate security reports",
          "Analyze product usage and performance where permitted",
          "Enforce our terms, prevent abuse, and protect rights, safety, and security",
          "Comply with legal obligations and respond to lawful requests",
          "Operate affiliate and referral programs where applicable",
        ],
      },
      {
        type: "p",
        text: "We do not sell personal information as that term is commonly defined under U.S. state privacy laws. We do not use status-page subscriber addresses for Fajita marketing unless those individuals separately sign up for Fajita communications.",
      },
      {
        type: "p",
        text: "Legal bases (EEA, UK, and similar jurisdictions). Where required, we rely on one or more of the following: performance of a contract; legitimate interests (such as security, product improvement, and fraud prevention, balanced against your rights); consent (such as for optional cookies or certain marketing); and compliance with legal obligations.",
      },
    ],
  },
  {
    id: "sharing",
    heading: "5. How we share information",
    blocks: [
      {
        type: "p",
        text: "We may disclose personal information to:",
      },
      {
        type: "ul",
        items: [
          "Service providers that process data on our behalf under contractual confidentiality and security obligations (including hosting, database, identity, payments, email delivery, messaging integrations, and analytics). A current list of subprocessors is published at /legal/subprocessors",
          "Professional advisors (such as lawyers and accountants) under confidentiality duties",
          "Authorities, regulators, or others when required by law, legal process, or to protect rights, safety, and security",
          "A successor in connection with a merger, acquisition, financing, or sale of assets, subject to appropriate protections",
          "Other parties with your direction or consent",
        ],
      },
      {
        type: "p",
        text: "Public status pages publish the content you choose to make public. Alert channels you configure deliver information to destinations you designate.",
      },
    ],
  },
  {
    id: "choices",
    heading: "6. Your choices and privacy rights",
    blocks: [
      {
        type: "p",
        text: "Depending on where you live and applicable law, you may have some or all of the following rights:",
      },
      {
        type: "ul",
        items: [
          "Access to personal information we hold about you",
          "Correction of inaccurate information",
          "Deletion of personal information, subject to legal exceptions",
          "Export or portability of certain information",
          "Restriction or objection to certain processing",
          "Withdrawal of consent where processing is consent-based (without affecting prior lawful processing)",
          "Opt out of certain targeted advertising, sale, or sharing as defined by applicable U.S. state law",
        ],
      },
      {
        type: "p",
        text: "You may update profile and organization settings in the product, manage email preferences where offered (security and essential billing messages may still send), and unsubscribe from status-page subscriber email using the link in those messages. To exercise rights, contact us using the address above. We may verify your request. Authorized agents may submit requests where permitted by law with proof of authorization.",
      },
      {
        type: "p",
        text: "If we deny a request, you may have the right to appeal where required by law by replying to our response with the word Appeal and a description of your concern.",
      },
    ],
  },
  {
    id: "california",
    heading: "7. California notices",
    blocks: [
      {
        type: "p",
        text: 'If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act (collectively, "CCPA"), may provide additional rights, including the right to know, delete, correct, and opt out of certain sharing for cross-context behavioral advertising.',
      },
      {
        type: "p",
        text: "Categories collected in the preceding twelve (12) months may include identifiers, commercial information, internet or network activity, and professional or service-related information, as described in Section 2. We disclose categories to service providers for business purposes as described in Section 5. We do not sell personal information. We do not share personal information for cross-context behavioral advertising as defined by the CCPA.",
      },
      {
        type: "p",
        text: "California Shine the Light. California residents may request information about disclosure of personal information to third parties for their direct marketing purposes once per year, as provided by California Civil Code Section 1798.83. Submit requests using the contact information above.",
      },
    ],
  },
  {
    id: "retention",
    heading: "8. Retention",
    blocks: [
      {
        type: "p",
        text: "We retain personal information for as long as needed to provide the Service, fulfill the purposes described in this Policy, meet legal and tax obligations, resolve disputes, and enforce agreements. Retention periods vary by data type and plan. Monitor history, incident records, and operational logs may be retained for shorter or longer periods depending on configuration, plan, and operational needs.",
      },
      {
        type: "p",
        text: "When an account is deleted or closed, we delete or anonymize personal information within a reasonable period, except where retention is required by law, needed to resolve disputes, or necessary for legitimate backup and security purposes subject to scheduled deletion.",
      },
    ],
  },
  {
    id: "security",
    heading: "9. Security",
    blocks: [
      {
        type: "p",
        text: "We maintain administrative, technical, and organizational measures designed to protect personal information appropriate to its sensitivity, including access controls, encryption of certain secrets at rest, and monitoring for abuse. No method of transmission or storage is completely secure. You are responsible for safeguarding your credentials and webhook secrets.",
      },
    ],
  },
  {
    id: "international",
    heading: "10. International transfers",
    blocks: [
      {
        type: "p",
        text: "Fajita is based in the United States. Personal information may be processed in the United States and other countries where we and our service providers operate. Where required by applicable law, we implement appropriate safeguards for cross-border transfers, such as standard contractual clauses or equivalent mechanisms.",
      },
    ],
  },
  {
    id: "cookies",
    heading: "11. Cookies and similar technologies",
    blocks: [
      {
        type: "p",
        text: "We use cookies and similar technologies as described in the Cookie Notice. You may accept or limit optional cookies through our consent banner where presented.",
      },
    ],
  },
  {
    id: "children",
    heading: "12. Children",
    blocks: [
      {
        type: "p",
        text: "The Service is not directed to children under 18. We do not knowingly collect personal information from children. If you believe a child has provided personal information to us, contact us and we will take appropriate steps to delete it.",
      },
    ],
  },
  {
    id: "changes",
    heading: "13. Changes",
    blocks: [
      {
        type: "p",
        text: "We may update this Policy from time to time. Material changes will be indicated by updating the Effective Date and, where required by law, by providing additional notice. Continued use after the effective date constitutes acceptance where permitted by law.",
      },
    ],
  },
  {
    id: "contact",
    heading: "14. Contact and complaints",
    blocks: [
      {
        type: "p",
        text: "Privacy inquiries: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io with topic Privacy.",
      },
      {
        type: "p",
        text: "If you are in the EEA, UK, or another jurisdiction with a supervisory authority, you may lodge a complaint with your local authority. We encourage you to contact us first so we can address your concern.",
      },
    ],
  },
];
