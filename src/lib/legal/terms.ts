import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const TERMS_META: LegalDocMeta = {
  title: "Terms of Service",
  version: 1,
  effectiveDate: "2026-07-17",
  lastUpdated: "2026-07-17",
};

export const termsIntro: LegalBlock[] = [
  {
    type: "p",
    text: `These Terms of Service (the "Terms") are a binding agreement between Fajita ("Fajita," "we," "us," or "our"), with a mailing address at 1001 S Main St, Ste 600, Kalispell, MT 59901, and the person or entity that creates an account or uses the Service ("Customer," "you," or "your").`,
  },
  {
    type: "p",
    text: `Effective Date: ${TERMS_META.effectiveDate}. By creating an account, accessing, or using the Service, you agree to these Terms. If you are entering into these Terms on behalf of an organization, you represent that you have authority to bind that organization.`,
  },
];

export const termsSections: LegalSection[] = [
  {
    id: "service",
    heading: "1. The Service",
    blocks: [
      {
        type: "p",
        text: 'Fajita provides uptime monitoring and related tools, including monitors for websites, APIs, certificates, and heartbeat endpoints; incident detection and alerting; status pages; subscriber notifications; reporting; and related account features (collectively, the "Service"). Features available to you depend on your plan, entitlements, and account status.',
      },
    ],
  },
  {
    id: "accounts",
    heading: "2. Accounts and organizations",
    blocks: [
      {
        type: "ol",
        items: [
          "You must provide accurate registration information and keep it current.",
          "You are responsible for activity under your account and for safeguarding credentials.",
          "You must be at least 18 years old to use the Service.",
          "Organizations may have multiple members with roles. Owners and administrators are responsible for managing access.",
        ],
      },
    ],
  },
  {
    id: "acceptable-use",
    heading: "3. Acceptable use",
    blocks: [
      {
        type: "p",
        text: "You shall use the Service only in accordance with these Terms and the Acceptable Use Policy. You shall not use the Service to probe, scan, or attack systems you are not authorized to monitor, to send unlawful communications, or to interfere with the Service.",
      },
    ],
  },
  {
    id: "customer-data",
    heading: "4. Customer data",
    blocks: [
      {
        type: "ol",
        items: [
          'You retain rights in configuration, monitor targets, incident content, status-page content, and other data you submit ("Customer Data").',
          "You grant Fajita a limited license to host, process, and transmit Customer Data solely to provide and improve the Service, prevent abuse, and comply with law.",
          "You represent that you have all rights and permissions needed to monitor the targets you configure and to process any personal data you submit.",
        ],
      },
    ],
  },
  {
    id: "billing",
    heading: "5. Plans, fees, and cancellation",
    blocks: [
      {
        type: "ol",
        items: [
          "Paid plans are billed through our payment processor. Fees are stated at checkout or on the pricing page and are charged in advance for each billing period unless otherwise stated.",
          "Unless required by law or stated in a Refund Policy, fees are non-refundable for the current billing period.",
          "You may cancel a subscription as described in the billing portal. Access continues through the end of the paid period unless otherwise stated.",
          "We may change prices prospectively with notice. Continued use after the effective date of a price change constitutes acceptance where permitted by law.",
          "Failed payments may result in grace periods, restricted access, or cancellation as described in product billing notices.",
        ],
      },
    ],
  },
  {
    id: "affiliates",
    heading: "6. Affiliate program",
    blocks: [
      {
        type: "p",
        text: "If you participate in the Affiliate Program, the Affiliate Program Agreement and Affiliate Privacy Notice also apply. In a conflict about affiliate commissions or promotion rules, that Agreement controls.",
      },
    ],
  },
  {
    id: "ip",
    heading: "7. Intellectual property",
    blocks: [
      {
        type: "p",
        text: "Fajita and its licensors own the Service, software, branding, and documentation. Except for the limited rights expressly granted, no rights are transferred. Feedback you provide may be used by Fajita without restriction or compensation.",
      },
    ],
  },
  {
    id: "third-parties",
    heading: "8. Third-party services",
    blocks: [
      {
        type: "p",
        text: "The Service may integrate with third-party services (for example identity, payments, email, messaging). Those services are governed by their own terms. Fajita is not responsible for third-party services it does not control.",
      },
    ],
  },
  {
    id: "disclaimer",
    heading: "9. Disclaimers",
    blocks: [
      {
        type: "p",
        text: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY LAW, FAJITA DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. FAJITA DOES NOT WARRANT THAT MONITORING WILL DETECT EVERY FAILURE OR THAT ALERTS WILL BE DELIVERED WITHOUT DELAY.',
      },
    ],
  },
  {
    id: "liability",
    heading: "10. Limitation of liability",
    blocks: [
      {
        type: "p",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FAJITA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL. FAJITA'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO FAJITA FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
      },
    ],
  },
  {
    id: "indemnity",
    heading: "11. Indemnity",
    blocks: [
      {
        type: "p",
        text: "You shall indemnify and hold harmless Fajita and its officers, directors, and employees from claims, damages, and expenses (including reasonable attorneys' fees) arising from Customer Data, your monitoring targets, your status-page content, or your breach of these Terms.",
      },
    ],
  },
  {
    id: "suspension",
    heading: "12. Suspension and termination",
    blocks: [
      {
        type: "ol",
        items: [
          "You may stop using the Service and request account closure as provided in the product.",
          "Fajita may suspend or terminate access for unpaid fees, Acceptable Use violations, legal risk, or to protect the Service, with notice where practicable.",
          "Upon termination, your right to use the Service ends. Sections that by nature should survive (including fees owed, IP, disclaimers, liability, indemnity, and general terms) survive.",
        ],
      },
    ],
  },
  {
    id: "changes",
    heading: "13. Changes",
    blocks: [
      {
        type: "p",
        text: "We may update these Terms. Material changes will be indicated by updating the Effective Date and, where required, providing notice. Continued use after the effective date constitutes acceptance where permitted by law.",
      },
    ],
  },
  {
    id: "general",
    heading: "14. General",
    blocks: [
      {
        type: "ol",
        items: [
          "Governing law. These Terms are governed by the laws of the State of Montana, without regard to conflict-of-law rules.",
          "Venue. Exclusive venue lies in the state or federal courts located in Montana, unless applicable law requires otherwise.",
          "Notices. Notices to Fajita may be sent to the mailing address above or through the contact form on fajita.io. Notices to you may be sent to the email on your account.",
          "Assignment. You may not assign these Terms without our prior written consent. Fajita may assign to a corporate affiliate or successor.",
          "Entire agreement. These Terms, together with the Privacy Policy, Acceptable Use Policy, Cookie Notice, and any plan-specific terms presented at checkout, constitute the entire agreement on the subject matter.",
          "Severability; waiver. If a provision is unenforceable, the remainder remains in effect. Failure to enforce a provision is not a waiver.",
        ],
      },
    ],
  },
];
