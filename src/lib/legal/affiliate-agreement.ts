/**
 * Affiliate Program Agreement content (version 1, in force).
 * Operative text for /legal/affiliate-agreement. Keep aligned with
 * AFFILIATE_TERMS_VERSION in src/lib/affiliates/config.ts.
 */

export const AFFILIATE_AGREEMENT_META = {
  title: "Affiliate Program Agreement",
  version: 2,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
} as const;

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export const affiliateAgreementIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Affiliate Program Agreement (the "Agreement") is entered into by and between Fajita ("Fajita," "we," "us," or "our"), with a mailing address at 1001 S Main St, Ste 600, Kalispell, MT 59901, and the individual or entity approved to participate in the Fajita Affiliate Program (the "Affiliate," "you," or "your").`,
  },
  {
    type: "p",
    text: `Effective Date: ${AFFILIATE_AGREEMENT_META.effectiveDate}. By submitting an application, accepting this Agreement electronically, or continuing to participate in the Program after approval, you agree to be bound by this Agreement, the Program Terms then in effect, and the Affiliate Privacy Notice.`,
  },
];

export const affiliateAgreementSections: LegalSection[] = [
  {
    id: "definitions",
    heading: "1. Definitions",
    blocks: [
      {
        type: "ol",
        items: [
          `"Affiliate Program" or "Program" means Fajita's referral program under which an approved Affiliate may promote Fajita and earn Commissions on Qualifying Subscriptions.`,
          `"Commission" means the amount calculated under the Program Terms for a Qualifying Subscription, expressed in United States dollars, in integer cents.`,
          `"Program Terms" means the commercial terms published by Fajita for the then-current program version, including commission rate, attribution window, recurring eligibility period, holding period, payout threshold, eligible plans, and exclusions. Program Terms are versioned and may change prospectively as set forth in this Agreement. Version 1 Program Terms as of the Effective Date are summarized in Schedule A.`,
          `"Qualifying Subscription" means a paid subscription to an eligible Fajita plan by a referred customer, confirmed through Fajita's payment processor, that meets the eligibility rules in the Program Terms and is not excluded (including by refund, dispute, fraud, self-referral, trial-only, or internal-organization rules).`,
          `"Referral Link" means a Fajita-issued tracking link or code assigned to the Affiliate.`,
          `"Referred Customer" means a person or organization attributed to the Affiliate under Fajita's attribution model within the attribution window.`,
        ],
      },
    ],
  },
  {
    id: "enrollment",
    heading: "2. Enrollment",
    blocks: [
      {
        type: "ol",
        items: [
          "Participation requires an application, acceptance of this Agreement and the Affiliate Privacy Notice, and written or electronic approval by Fajita. Approval is discretionary. Fajita may reject, waitlist, request additional information, or block an applicant.",
          "The Affiliate represents that application information is accurate and complete, and that the Affiliate will update material changes promptly.",
          "One Affiliate account per person or legal entity, unless Fajita expressly approves otherwise in writing.",
          "Electronic acceptance (including checking an acceptance box and submitting an application) constitutes a signature for purposes of this Agreement.",
        ],
      },
    ],
  },
  {
    id: "attribution",
    heading: "3. Referral tracking and attribution",
    blocks: [
      {
        type: "ol",
        items: [
          "Attribution uses a first-party referral cookie and server-side records. Fajita's last-eligible-touch model within the attribution window determines which Affiliate, if any, is credited. Attribution is not guaranteed for every visit or signup.",
          "Self-referral is prohibited. The Affiliate may not earn Commissions on subscriptions for accounts the Affiliate owns, controls, or materially benefits from, or for organizations in which the Affiliate is a member, unless Fajita expressly approves otherwise in writing.",
          "Fajita may invalidate sessions, clicks, or attributions that appear to result from bots, cookie stuffing, automated traffic, fraud, or policy violations.",
        ],
      },
    ],
  },
  {
    id: "commissions",
    heading: "4. Commissions",
    blocks: [
      {
        type: "ol",
        items: [
          "Commissions accrue only on Qualifying Subscriptions under the Program Terms in effect for the applicable program version at the time of calculation. Historical Commissions are not recalculated when Program Terms change, except as required by law or as Fajita determines necessary to correct error or fraud.",
          "Commissions are held for the holding period stated in the Program Terms before they become payable, subject to refunds, disputes, fraud review, and account status.",
          "Refunds, chargebacks, and lost disputes reduce or reverse related Commissions, including after payout where Fajita is entitled to recover amounts already paid (by offset against future Commissions or by invoice).",
          "Fajita may exclude tax, credits, discounts, trials before paid conversion, test-mode subscriptions, and other categories listed in the Program Terms.",
          "Fajita does not guarantee any level of income, traffic, or conversion.",
        ],
      },
    ],
  },
  {
    id: "payouts",
    heading: "5. Payouts and tax",
    blocks: [
      {
        type: "ol",
        items: [
          "Payouts are made when the Affiliate's payable balance meets the minimum threshold, payout setup is complete, tax information requirements (if any) are satisfied, and the Affiliate's account is not held, suspended, or terminated.",
          "Payouts are processed through Fajita's payment provider (including Stripe Connect where configured) or by manual settlement when the provider is unavailable. Bank and tax details provided to the payment provider are not stored by Fajita as full account numbers or tax identification numbers.",
          "The Affiliate is solely responsible for taxes arising from Commissions. Fajita may withhold amounts required by law and may require tax documentation before paying.",
          "Fajita may offset amounts owed by the Affiliate (including reversed Commissions after payout) against future Commissions. Where a negative balance remains after offsets, Fajita may invoice the Affiliate for the unpaid amount.",
        ],
      },
    ],
  },
  {
    id: "promotion",
    heading: "6. Promotion rules",
    blocks: [
      {
        type: "ol",
        items: [
          "The Affiliate shall clearly disclose the affiliate relationship in all promotional materials, consistent with applicable advertising and endorsement laws (including FTC endorsement guidelines where applicable).",
          "Prohibited promotion includes, without limitation: (a) bidding on Fajita trademarks or confusingly similar terms in paid search without written approval; (b) cookie stuffing, forced clicks, or malware; (c) spam or unsolicited bulk messaging; (d) impersonation of Fajita or its employees; (e) misrepresenting Fajita's features, pricing, or uptime; (f) promoting on sites primarily dedicated to adult content, hate, illegal activity, or deceptive practices; and (g) using coupons or discount codes not expressly authorized by Fajita.",
          "The Affiliate may use brand assets only as provided in the Affiliate dashboard or creative library, and only while the Affiliate remains in good standing. Fajita retains all intellectual property rights in its marks and materials.",
        ],
      },
    ],
  },
  {
    id: "account-status",
    heading: "7. Account status and termination",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita may pause, suspend, terminate, or close an Affiliate account for policy violations, fraud, inactivity, failure to provide required tax or payout information, or for convenience with reasonable notice where required by law.",
          "You may stop participating at any time by closing your affiliate account or notifying Fajita in writing. Closure stops new referral tracking but does not affect obligations that accrued before closure.",
          "Upon termination or closure, unpaid Commissions that are legitimately earned, cleared through the holding period, and not subject to reversal may still be paid subject to threshold, tax documentation, and fraud review. Fajita may withhold or reverse Commissions related to suspected violations.",
          "Upon termination, you shall cease use of Referral Links, Fajita brand assets, and promotional materials referencing the Program, except for factual statements about past participation where required by law.",
        ],
      },
    ],
  },
  {
    id: "confidentiality",
    heading: "8. Confidentiality and data",
    blocks: [
      {
        type: "ol",
        items: [
          "The Affiliate shall not disclose non-public information about Fajita, referred customers, or Commission details except as needed to perform under this Agreement or as required by law.",
          "The Affiliate does not receive customer identity, payment details, or other personal data of Referred Customers beyond aggregated performance metrics Fajita chooses to display.",
          "Processing of the Affiliate's own personal data is described in the Affiliate Privacy Notice.",
        ],
      },
    ],
  },
  {
    id: "publicity",
    heading: "9. Publicity and brand use",
    blocks: [
      {
        type: "ol",
        items: [
          "The Affiliate shall not represent itself as Fajita, as an employee or agent of Fajita, or as having authority to bind Fajita.",
          "Use of Fajita names, logos, and brand assets is limited to materials provided in the Affiliate dashboard or creative library and only while the Affiliate remains in good standing.",
          "Fajita may reference the Affiliate's business name and public channels in Program communications with the Affiliate's consent where required by law.",
        ],
      },
    ],
  },
  {
    id: "compliance",
    heading: "10. Compliance and audit",
    blocks: [
      {
        type: "ol",
        items: [
          "The Affiliate shall comply with applicable advertising, endorsement, privacy, and anti-spam laws in every jurisdiction where the Affiliate promotes Fajita.",
          "The Affiliate shall maintain records of promotional placements and disclosures sufficient to demonstrate compliance upon reasonable request.",
          "Fajita may request information or remove promotional materials that violate this Agreement, applicable law, or Fajita brand guidelines.",
          "The Affiliate shall comply with applicable export, sanctions, and trade laws and represents that it is not located in or organized under the laws of a comprehensively sanctioned jurisdiction.",
        ],
      },
    ],
  },
  {
    id: "contractor",
    heading: "11. Independent contractor",
    blocks: [
      {
        type: "p",
        text: "The Affiliate is an independent contractor. Nothing in this Agreement creates a partnership, joint venture, employment, or agency relationship. The Affiliate may not bind Fajita or represent authority to do so.",
      },
    ],
  },
  {
    id: "warranties",
    heading: "12. Warranties and disclaimers",
    blocks: [
      {
        type: "ol",
        items: [
          "Each party represents that it has authority to enter into this Agreement.",
          'EXCEPT AS EXPRESSLY STATED, THE AFFILIATE PROGRAM IS PROVIDED "AS IS." TO THE MAXIMUM EXTENT PERMITTED BY LAW, FAJITA DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
        ],
      },
    ],
  },
  {
    id: "liability",
    heading: "13. Limitation of liability",
    blocks: [
      {
        type: "p",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FAJITA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, OR DATA, ARISING OUT OF OR RELATED TO THIS AGREEMENT. FAJITA'S AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL COMMISSIONS PAID TO THE AFFILIATE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
      },
    ],
  },
  {
    id: "indemnity",
    heading: "14. Indemnity",
    blocks: [
      {
        type: "p",
        text: "The Affiliate shall indemnify and hold harmless Fajita and its officers, directors, and employees from claims, damages, and expenses (including reasonable attorneys' fees) arising from the Affiliate's promotional activities, content, or breach of this Agreement.",
      },
    ],
  },
  {
    id: "term",
    heading: "15. Term and changes",
    blocks: [
      {
        type: "ol",
        items: [
          "This Agreement begins on approval and continues until terminated by either party as permitted herein.",
          "Fajita may update Program Terms prospectively by publishing a new version. Material changes to this Agreement may require re-acceptance. Continued participation after notice of a change constitutes acceptance where permitted by law.",
        ],
      },
    ],
  },
  {
    id: "general",
    heading: "16. General",
    blocks: [
      {
        type: "ol",
        items: [
          "Governing law. This Agreement is governed by the laws of the State of Montana, without regard to conflict-of-law rules.",
          "Venue. Exclusive venue for disputes lies in the state or federal courts located in Montana, unless applicable law requires otherwise.",
          "Notices. Notices to Fajita shall be sent to the mailing address above or to an email address Fajita designates for affiliate legal notices. Notices to the Affiliate may be sent to the contact email on the Affiliate's profile.",
          "Assignment. The Affiliate may not assign this Agreement without Fajita's prior written consent. Fajita may assign this Agreement to a corporate affiliate or successor.",
          "Severability; entire agreement; waiver. If any provision is unenforceable, the remainder remains in effect. This Agreement, together with the Program Terms and Affiliate Privacy Notice accepted at enrollment, constitutes the entire agreement on the subject matter. Failure to enforce a provision is not a waiver.",
          "Force majeure. Neither party is liable for delay or failure caused by events beyond reasonable control.",
          "Electronic records. Electronic acceptance, click-wrap acknowledgment, and electronic notices satisfy any writing requirement to the extent permitted by law.",
          "Survival. Sections 4.3, 5, 8, 12, 13, 14, and 16 survive termination or closure to the extent needed to wind down Commissions, recover amounts owed, and enforce this Agreement.",
        ],
      },
    ],
  },
  {
    id: "schedule-a",
    heading: "Schedule A. Program Terms (Version 1)",
    blocks: [
      {
        type: "p",
        text: "The following commercial terms apply to program version 1 as of the Effective Date. Later program versions, when published by Fajita, apply prospectively to new Commissions as set forth in Section 4.1. Current Program Terms are also summarized on the public affiliate program page.",
      },
      {
        type: "ul",
        items: [
          "Commission: 20% (2,000 basis points) of eligible subscription revenue, recurring",
          "Attribution window: 30 days; last eligible touch",
          "Recurring eligibility: up to 12 months per referred account",
          "Commission holding period: 30 days before approval for payout",
          "Minimum payout threshold: USD $50.00",
          "Payout frequency: monthly",
          "Currency: USD",
          "Eligible plans: Starter, Pro, Business",
          "Exclusions: tax; refunded, credited, or disputed revenue; trials before paid conversion; test-mode subscriptions; internal organizations; unauthorized coupons",
        ],
      },
    ],
  },
];
