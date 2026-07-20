import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const SUBPROCESSORS_META: LegalDocMeta = {
  title: "Subprocessor List",
  version: 1,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const subprocessorsIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Subprocessor List identifies third parties ("Subprocessors") that Fajita ("Fajita," "we," "us," or "our") engages to process personal data on our behalf in connection with the Fajita Service. It supplements the Privacy Policy and, where applicable, the Data Processing Addendum.`,
  },
  {
    type: "p",
    text: `Effective Date: ${SUBPROCESSORS_META.effectiveDate}. Last updated: ${SUBPROCESSORS_META.lastUpdated}.`,
  },
  {
    type: "p",
    text: "Fajita may update this list by publishing a revised version with a new Effective Date. Where required by the DPA or applicable law, Fajita will provide notice of new Subprocessors.",
  },
];

export const subprocessorsSections: LegalSection[] = [
  {
    id: "scope",
    heading: "1. Scope",
    blocks: [
      {
        type: "p",
        text: "This list covers Subprocessors that may process personal data stored in or transmitted through the Service infrastructure. It does not list third parties you choose to integrate with directly (such as your own Slack workspace or webhook endpoints) except where Fajita routes data through a shared integration on your instruction.",
      },
    ],
  },
  {
    id: "list",
    heading: "2. Current Subprocessors",
    blocks: [
      {
        type: "p",
        text: "As of the Effective Date, the Subprocessors below may process personal data on Fajita's behalf.",
      },
      {
        type: "ol",
        items: [
          "Clerk, Inc. (United States). Purpose: user authentication, session management, and organization identity. Data processed: account identifiers, email addresses, authentication metadata.",
          "Stripe, Inc. (United States). Purpose: subscription billing, invoicing, payment processing, and affiliate payout settlement where Stripe Connect is used. Data processed: billing contact information, subscription and transaction metadata; payment card details are collected directly by Stripe.",
          "Supabase, Inc. (United States). Purpose: managed database and related data storage for Service data. Data processed: Customer Data and account records stored in the Service.",
          "Vercel Inc. (United States). Purpose: application hosting, edge delivery, and related infrastructure logs. Data processed: request metadata, application content in transit, and operational logs.",
          "Resend, Inc. (United States). Purpose: transactional and operational email delivery, including alerts configured by customers and status-page subscriber messages. Data processed: recipient email addresses, message content, and delivery events.",
          "DataFast (operated by DataFast Analytics). Purpose: product analytics for fajita.io when visitors consent to analytics cookies. Data processed: coarse usage events and page metadata configured to minimize personal data.",
          "Functional Software, Inc. d/b/a Sentry (United States). Purpose: error monitoring and application diagnostics when enabled in the deployment environment. Data processed: error events, stack traces, and related technical metadata; configured to avoid unnecessary personal data.",
          "Anthropic, PBC (United States). Purpose: powering the Ask Fajita support chat feature when enabled. Data processed: chat messages and coarse session metadata submitted through that feature.",
        ],
      },
    ],
  },
  {
    id: "changes",
    heading: "3. Changes",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita may add or replace Subprocessors as the Service evolves.",
          "Updates will be reflected on this page with a revised Effective Date.",
          "Customers with a DPA may have additional notice and objection rights as described in the DPA.",
        ],
      },
    ],
  },
  {
    id: "contact",
    heading: "4. Contact",
    blocks: [
      {
        type: "p",
        text: "Questions about Subprocessors: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io with topic Privacy.",
      },
    ],
  },
];
