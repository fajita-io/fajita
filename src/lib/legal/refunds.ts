import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const REFUNDS_META: LegalDocMeta = {
  title: "Refund Policy",
  version: 1,
  effectiveDate: "2026-07-17",
  lastUpdated: "2026-07-17",
};

export const refundsIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Refund Policy describes how Fajita handles refunds for paid subscriptions. Effective Date: ${REFUNDS_META.effectiveDate}.`,
  },
];

export const refundsSections: LegalSection[] = [
  {
    id: "general",
    heading: "1. General rule",
    blocks: [
      {
        type: "p",
        text: "Subscription fees are charged in advance for each billing period. Except as required by law or expressly stated here, fees for the current billing period are non-refundable.",
      },
    ],
  },
  {
    id: "cancel",
    heading: "2. Cancellation",
    blocks: [
      {
        type: "p",
        text: "You may cancel at any time from the billing portal. Cancellation stops future renewals. You retain access through the end of the period already paid, unless we state otherwise for a specific promotion.",
      },
    ],
  },
  {
    id: "errors",
    heading: "3. Billing errors and discretion",
    blocks: [
      {
        type: "p",
        text: "If you believe you were charged in error, contact us through the contact form with topic Support. We may issue refunds or credits at our discretion for clear billing errors, duplicate charges, or service failures that make the Service unusable for a material portion of the period.",
      },
    ],
  },
  {
    id: "disputes",
    heading: "4. Payment disputes",
    blocks: [
      {
        type: "p",
        text: "Chargebacks and payment disputes are handled through our payment processor. Opening a dispute may result in suspension of the account until resolved.",
      },
    ],
  },
];
