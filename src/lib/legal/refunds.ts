import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const REFUNDS_META: LegalDocMeta = {
  title: "Refund Policy",
  version: 2,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const refundsIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Refund Policy describes how Fajita handles refunds, cancellations, and billing disputes for paid Subscriptions. It is incorporated into the Terms of Service. Effective Date: ${REFUNDS_META.effectiveDate}. Last updated: ${REFUNDS_META.lastUpdated}.`,
  },
];

export const refundsSections: LegalSection[] = [
  {
    id: "general",
    heading: "1. General rule",
    blocks: [
      {
        type: "p",
        text: "Subscription fees are billed in advance for each billing period (monthly or annual, as selected at checkout). Except as required by applicable law or expressly stated in this Policy, fees for the current billing period are non-refundable, including when you cancel mid-period or do not use the Service during the period.",
      },
    ],
  },
  {
    id: "cancel",
    heading: "2. Cancellation",
    blocks: [
      {
        type: "ol",
        items: [
          "You may cancel a Subscription at any time through the billing portal or as described in the Documentation.",
          "Cancellation stops future renewals. You retain access to paid features through the end of the period already paid unless we state otherwise for a specific promotion.",
          "After the paid period ends, your account may convert to a free tier (if available), become read-only, or be closed according to product rules then in effect.",
          "Canceling does not automatically delete account data. Deletion is handled separately through account settings or a deletion request, subject to retention described in the Privacy Policy.",
        ],
      },
    ],
  },
  {
    id: "trials",
    heading: "3. Trials and promotions",
    blocks: [
      {
        type: "p",
        text: "If Fajita offers a free trial or promotional pricing, the specific terms (duration, conversion, eligibility, and refund treatment) are presented at signup or checkout. Unless expressly stated, charges that begin after a trial ends are non-refundable for the first paid period once billing starts.",
      },
    ],
  },
  {
    id: "errors",
    heading: "4. Billing errors and service credits",
    blocks: [
      {
        type: "ol",
        items: [
          "If you believe you were charged in error, contact us through the contact form with topic Support within thirty (30) days of the charge, including the invoice date, amount, and explanation.",
          "Fajita may, at its sole discretion, issue refunds or account credits for clear billing errors, duplicate charges, unauthorized charges confirmed after investigation, or prolonged Service unavailability that materially prevents use of core monitoring for a significant portion of a paid period.",
          "Service credits, if issued, apply to future invoices unless we agree otherwise or law requires a refund.",
          "Fajita's determination of billing error or credit eligibility is final except where applicable law provides otherwise.",
        ],
      },
    ],
  },
  {
    id: "downgrades",
    heading: "5. Plan changes and downgrades",
    blocks: [
      {
        type: "p",
        text: "Upgrades may take effect immediately with prorated or adjusted charges as shown at checkout or in the billing portal. Downgrades generally take effect at the next renewal unless the billing portal states otherwise. Downgrades do not entitle you to a refund for the current period.",
      },
    ],
  },
  {
    id: "disputes",
    heading: "6. Chargebacks and payment disputes",
    blocks: [
      {
        type: "ol",
        items: [
          "Contact Fajita before initiating a chargeback so we can investigate.",
          "Chargebacks and payment disputes are processed through our payment processor according to card network rules.",
          "Opening a dispute may result in immediate suspension of paid features or the account until the dispute is resolved.",
          "If a chargeback is resolved in Fajita's favor, you remain responsible for amounts owed and any chargeback fees where permitted by law.",
        ],
      },
    ],
  },
  {
    id: "tax",
    heading: "7. Taxes",
    blocks: [
      {
        type: "p",
        text: "Refunds, if issued, are typically processed to the original payment method and may exclude taxes, duties, or fees collected on behalf of governmental authorities, except where law requires otherwise.",
      },
    ],
  },
  {
    id: "mandatory",
    heading: "8. Mandatory consumer rights",
    blocks: [
      {
        type: "p",
        text: "Nothing in this Policy limits non-waivable rights you may have under applicable consumer protection laws, including statutory withdrawal or cooling-off periods where they apply to online subscriptions in your jurisdiction.",
      },
    ],
  },
  {
    id: "changes",
    heading: "9. Changes",
    blocks: [
      {
        type: "p",
        text: "Fajita may update this Policy by publishing a revised version with a new Effective Date. Changes apply prospectively unless required otherwise by law.",
      },
    ],
  },
];
