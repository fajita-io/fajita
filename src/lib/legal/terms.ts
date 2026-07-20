import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const TERMS_META: LegalDocMeta = {
  title: "Terms of Service",
  version: 2,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const termsIntro: LegalBlock[] = [
  {
    type: "p",
    text: `These Terms of Service (the "Terms") are a binding agreement between Fajita ("Fajita," "we," "us," or "our"), with a mailing address at 1001 S Main St, Ste 600, Kalispell, MT 59901, and the person or entity that creates an account or uses the Service ("Customer," "you," or "your").`,
  },
  {
    type: "p",
    text: `Effective Date: ${TERMS_META.effectiveDate}. Last updated: ${TERMS_META.lastUpdated}. By creating an account, accessing, or using the Service, you agree to these Terms. If you are entering into these Terms on behalf of an organization, you represent and warrant that you have authority to bind that organization, and "you" refers to that organization.`,
  },
  {
    type: "p",
    text: "These Terms are written to be read. They are not legal advice. If you do not agree, do not use the Service.",
  },
];

export const termsSections: LegalSection[] = [
  {
    id: "definitions",
    heading: "1. Definitions",
    blocks: [
      {
        type: "p",
        text: "Capitalized terms have the meanings below or as defined elsewhere in these Terms.",
      },
      {
        type: "ol",
        items: [
          '"Affiliate Program" means Fajita\'s referral program described in the Affiliate Program Agreement.',
          '"Customer Data" means configuration, monitor targets, incident content, status-page content, subscriber lists, alert destinations, and other data you submit to or generate through the Service, excluding aggregated or de-identified data that cannot reasonably be linked to you.',
          '"Documentation" means the product help, API reference, and other usage materials Fajita makes available for the Service.',
          '"Order" means an online checkout, plan selection, or other ordering flow through which you subscribe to a paid plan.',
          '"Organization" means a workspace or team account within the Service.',
          '"Service" means Fajita\'s uptime monitoring platform and related websites, applications, APIs, status pages, and support services, as described in Section 2.',
          '"Subscription" means a recurring or term-based paid plan for the Service.',
          '"Third-Party Services" means products or services provided by parties other than Fajita that integrate with or are accessed through the Service.',
        ],
      },
    ],
  },
  {
    id: "service",
    heading: "2. The Service",
    blocks: [
      {
        type: "p",
        text: "Fajita provides uptime monitoring and related tools, including monitors for websites, APIs, TLS certificates, and heartbeat endpoints; incident detection and verification; alerting through channels you configure (such as email, Slack, Discord, and signed webhooks); public and private status pages; subscriber notifications; reporting; organization and role management; billing; and related account features. Features available to you depend on your plan, entitlements, account status, and the Documentation then in effect.",
      },
      {
        type: "p",
        text: "Fajita may modify, suspend, or discontinue any part of the Service at any time, including features, limits, and supported integrations, with or without notice where permitted by law. Fajita will use commercially reasonable efforts to avoid material degradation of core monitoring for paying Customers except for maintenance, security, legal compliance, or abuse response.",
      },
    ],
  },
  {
    id: "eligibility",
    heading: "3. Eligibility, accounts, and organizations",
    blocks: [
      {
        type: "ol",
        items: [
          "You must be at least 18 years old and able to form a binding contract to use the Service.",
          "You shall provide accurate registration information and keep it current.",
          "You are responsible for all activity under your account and for safeguarding credentials, API keys, and webhook secrets. Notify Fajita promptly if you suspect unauthorized access.",
          "Organizations may have multiple members with roles. Owners and administrators are responsible for managing access, permissions, billing authorization, and compliance by their members.",
          "You may not share accounts among individuals except through Organization roles provided by the Service. You may not create accounts using false identity information or on behalf of another person without authorization.",
          "Fajita may refuse registration, close accounts, or limit access where permitted by law, including for prior violations, fraud risk, or legal requirements.",
        ],
      },
    ],
  },
  {
    id: "license",
    heading: "4. License and restrictions",
    blocks: [
      {
        type: "p",
        text: "Subject to these Terms and your plan entitlements, Fajita grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes or personal use, in accordance with the Documentation and the Acceptable Use Policy.",
      },
      {
        type: "p",
        text: "Except as expressly permitted, you shall not (and shall not permit any third party to):",
      },
      {
        type: "ul",
        items: [
          "copy, modify, or create derivative works of the Service or Documentation, except as allowed by applicable law;",
          "reverse engineer, decompile, or disassemble the Service except to the extent such restriction is prohibited by law;",
          "access the Service to build a competing product or service, or to benchmark or publish performance information without Fajita's prior written consent;",
          "remove proprietary notices;",
          "use the Service in violation of law, third-party rights, or the Acceptable Use Policy;",
          "circumvent plan limits, security controls, authentication, or rate limits;",
          "resell, sublicense, or make the Service available to third parties except through status pages and alerts expressly intended for your end users; or",
          "use the Service in any manner that could damage, disable, overburden, or impair Fajita or other customers.",
        ],
      },
    ],
  },
  {
    id: "acceptable-use",
    heading: "5. Acceptable use",
    blocks: [
      {
        type: "p",
        text: "You shall use the Service only in accordance with these Terms and the Acceptable Use Policy, which is incorporated by reference. You shall not use the Service to probe, scan, or attack systems you are not authorized to monitor, to send unlawful communications, to distribute malware, or to interfere with the Service or other customers.",
      },
    ],
  },
  {
    id: "customer-data",
    heading: "6. Customer Data and privacy",
    blocks: [
      {
        type: "ol",
        items: [
          "You retain all rights in Customer Data. Fajita does not claim ownership of Customer Data.",
          "You grant Fajita a worldwide, non-exclusive license to host, process, transmit, display, and otherwise use Customer Data solely to provide, secure, maintain, and improve the Service; prevent abuse; comply with law; and as otherwise described in the Privacy Policy.",
          "You represent and warrant that you have all rights, permissions, and lawful bases needed to submit Customer Data, configure monitoring targets, collect status-page subscriber information, and process any personal data contained in Customer Data.",
          "You are solely responsible for the accuracy, legality, and appropriateness of Customer Data, including status-page content, incident updates, and subscriber communications sent through the Service.",
          "Where Fajita processes personal data on your behalf as a processor, the Data Processing Addendum at /legal/dpa applies when and to the extent described there.",
          "Upon termination, Fajita may delete Customer Data after any applicable retention or export period described in the Privacy Policy, Documentation, or product settings.",
        ],
      },
    ],
  },
  {
    id: "status-pages",
    heading: "7. Status pages, alerts, and communications",
    blocks: [
      {
        type: "ol",
        items: [
          "You are responsible for the content you publish on status pages, including incident titles, updates, and subscriber messaging. Public status pages may be indexed by search engines and viewed by anyone with the URL.",
          "If you collect status-page subscriber email addresses, you represent that you have obtained any consent required by law and that you will honor unsubscribe requests for subscriber messages sent through the Service.",
          "Alert channels you configure (including email recipients, Slack, Discord, and webhook endpoints) must belong to you or parties who have authorized you to send operational notifications to those destinations.",
          "Fajita does not guarantee delivery, timeliness, or completeness of alerts or status-page notifications. Delivery may be affected by third-party providers, network conditions, misconfiguration, rate limits, or provider policies.",
          "You shall not use alert or status-page features to send marketing spam, phishing, or unlawful content.",
        ],
      },
    ],
  },
  {
    id: "billing",
    heading: "8. Plans, fees, taxes, and billing",
    blocks: [
      {
        type: "ol",
        items: [
          "Paid Subscriptions are billed through Fajita's payment processor. Fees are stated at checkout, on the pricing page, or in an Order and are charged in advance for each billing period unless otherwise stated.",
          "Unless required by law or expressly stated in the Refund Policy, fees are non-refundable for the current billing period.",
          "You authorize Fajita and its payment processor to charge your payment method for recurring Subscription fees until you cancel. You are responsible for keeping payment information current.",
          "You may cancel a Subscription as described in the billing portal or Documentation. Cancellation stops future renewals. Access continues through the end of the paid period unless otherwise stated for a specific promotion.",
          "Fajita may change prices, plans, or entitlements prospectively by notice through the Service, email, or the pricing page. Continued use or renewal after the effective date of a change constitutes acceptance where permitted by law.",
          "Taxes, duties, and governmental charges may be added where required. You are responsible for all applicable taxes except taxes based on Fajita's net income.",
          "If payment fails, Fajita may retry charges, apply grace periods, restrict access, downgrade features, or cancel the Subscription as described in product billing notices.",
          "Free tiers, trials, and promotional access may be modified or discontinued at any time. Trial conversions and promotional terms, if any, are stated at signup or checkout.",
        ],
      },
    ],
  },
  {
    id: "affiliates",
    heading: "9. Affiliate program",
    blocks: [
      {
        type: "p",
        text: "If you participate in the Affiliate Program, the Affiliate Program Agreement and Affiliate Privacy Notice also apply. In a conflict about affiliate commissions, attribution, or promotion rules, that Agreement controls.",
      },
    ],
  },
  {
    id: "preview",
    heading: "10. Preview and experimental features",
    blocks: [
      {
        type: "p",
        text: 'Fajita may offer preview or experimental features ("Preview Features"). Preview Features may be incomplete, change without notice, or be withdrawn at any time. Preview Features are provided "AS IS," may not be covered by support commitments, and may be subject to additional terms presented at enrollment.',
      },
    ],
  },
  {
    id: "ip",
    heading: "11. Intellectual property",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita and its licensors own the Service, software, Documentation, branding, and all related intellectual property. Except for the limited license in Section 4, no rights are transferred.",
          "You may not use Fajita's name, logos, or trademarks except as permitted in the Documentation or with prior written consent.",
          "If you provide suggestions, ideas, or feedback about the Service, you grant Fajita a perpetual, irrevocable, worldwide, royalty-free license to use that feedback without restriction or compensation.",
        ],
      },
    ],
  },
  {
    id: "third-parties",
    heading: "12. Third-party services",
    blocks: [
      {
        type: "p",
        text: "The Service may integrate with Third-Party Services (such as identity, payments, email, messaging, and analytics providers). Third-Party Services are governed by their own terms and privacy policies. Fajita is not responsible for Third-Party Services it does not control. Your use of Third-Party Services is at your own risk.",
      },
    ],
  },
  {
    id: "confidentiality",
    heading: "13. Confidentiality",
    blocks: [
      {
        type: "p",
        text: 'Each party may receive non-public information from the other ("Confidential Information"). The receiving party shall use Confidential Information only to perform under these Terms and shall protect it using reasonable care. Confidential Information does not include information that is public, independently developed, or lawfully received from a third party without restriction. Fajita may disclose Customer Data and account information as necessary to provide the Service, comply with law, or enforce these Terms.',
      },
    ],
  },
  {
    id: "disclaimer",
    heading: "14. Disclaimers",
    blocks: [
      {
        type: "p",
        text: 'THE SERVICE AND DOCUMENTATION ARE PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FAJITA DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
      },
      {
        type: "p",
        text: "WITHOUT LIMITING THE FOREGOING, FAJITA DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE; THAT MONITORING WILL DETECT EVERY FAILURE, OUTAGE, OR DEGRADATION; THAT ALERTS OR STATUS-PAGE NOTIFICATIONS WILL BE DELIVERED WITHOUT DELAY; OR THAT CHECK RESULTS WILL BE ACCURATE IN ALL CIRCUMSTANCES. MONITORING DEPENDS ON NETWORK CONDITIONS, TARGET AVAILABILITY, CONFIGURATION, AND THIRD-PARTY SYSTEMS OUTSIDE FAJITA'S CONTROL.",
      },
    ],
  },
  {
    id: "liability",
    heading: "15. Limitation of liability",
    blocks: [
      {
        type: "p",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FAJITA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, BUSINESS INTERRUPTION, OR PROCUREMENT OF SUBSTITUTE SERVICES, EVEN IF FAJITA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
      },
      {
        type: "p",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FAJITA'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THE SERVICE OR THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO FAJITA FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS (USD $100.00).",
      },
      {
        type: "p",
        text: "Some jurisdictions do not allow certain limitations. In those jurisdictions, Fajita's liability is limited to the maximum extent permitted by law.",
      },
    ],
  },
  {
    id: "indemnity",
    heading: "16. Indemnification",
    blocks: [
      {
        type: "p",
        text: "You shall defend, indemnify, and hold harmless Fajita and its officers, directors, employees, contractors, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) Customer Data; (b) your monitoring targets, alert destinations, or status-page content; (c) your violation of these Terms, the Acceptable Use Policy, or applicable law; (d) your infringement or misappropriation of third-party rights; or (e) disputes between you and your users, subscribers, or end customers. Fajita may assume exclusive defense and control of any matter subject to indemnification, and you shall cooperate with Fajita's defense.",
      },
    ],
  },
  {
    id: "suspension",
    heading: "17. Suspension and termination",
    blocks: [
      {
        type: "ol",
        items: [
          "You may stop using the Service and request account closure as provided in the product or by contacting Fajita.",
          "Fajita may suspend or terminate access immediately, with or without notice where permitted by law, for unpaid fees, Acceptable Use violations, legal risk, security incidents, fraudulent activity, or to protect the Service, Fajita, or other customers.",
          "Upon termination, your right to use the Service ends. Amounts owed before termination remain due. Sections that by their nature should survive (including Customer Data licenses to the extent needed for retention obligations, fees owed, intellectual property, confidentiality, disclaimers, limitation of liability, indemnification, dispute resolution, and general terms) survive termination.",
        ],
      },
    ],
  },
  {
    id: "export",
    heading: "18. Export and sanctions compliance",
    blocks: [
      {
        type: "p",
        text: "You shall comply with all applicable export control, sanctions, and trade laws. You represent that you are not located in, organized under the laws of, or ordinarily resident in a country or region subject to comprehensive U.S. sanctions, and that you are not listed on any U.S. government restricted-party list. You shall not use the Service for any prohibited end use.",
      },
    ],
  },
  {
    id: "disputes",
    heading: "19. Dispute resolution",
    blocks: [
      {
        type: "ol",
        items: [
          "Informal resolution. Before filing a claim, the parties shall attempt to resolve disputes informally by contacting the other party through the contact methods in Section 21. If the dispute is not resolved within thirty (30) days, either party may proceed as set forth below.",
          "Binding arbitration. Except for qualifying small-claims matters and requests for injunctive relief to stop unauthorized use or intellectual property misuse, any dispute arising out of or relating to these Terms or the Service shall be resolved by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The seat of arbitration shall be Kalispell, Montana, unless the parties agree otherwise. The arbitrator may award relief available in court on an individual basis only.",
          "Class action waiver. TO THE MAXIMUM EXTENT PERMITTED BY LAW, DISPUTES SHALL BE BROUGHT ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, OR REPRESENTATIVE PROCEEDING.",
          "Opt-out. You may opt out of arbitration within thirty (30) days of first accepting these Terms by sending written notice to Fajita's mailing address with your name, account email, and a clear statement that you opt out of arbitration. If you opt out, Section 19.2 does not apply, and Section 21.2 governs venue.",
          "Mandatory rights. Nothing in this Section limits non-waivable consumer rights under applicable law.",
        ],
      },
    ],
  },
  {
    id: "changes",
    heading: "20. Changes",
    blocks: [
      {
        type: "p",
        text: "Fajita may update these Terms from time to time. Material changes will be indicated by updating the Effective Date and, where required by law, by providing notice through the Service, email, or other reasonable means. Continued use after the effective date constitutes acceptance where permitted by law. If you do not agree to a change, you must stop using the Service and cancel any Subscription.",
      },
    ],
  },
  {
    id: "general",
    heading: "21. General",
    blocks: [
      {
        type: "ol",
        items: [
          "Governing law. These Terms are governed by the laws of the State of Montana, without regard to conflict-of-law rules, except where mandatory consumer protection laws of your jurisdiction apply.",
          "Venue. Except as set forth in Section 19, exclusive venue for any action not subject to arbitration lies in the state or federal courts located in Flathead County, Montana, and each party consents to personal jurisdiction there, unless applicable law requires otherwise.",
          "Notices. Notices to Fajita shall be sent to the mailing address above or through the contact form on fajita.io with topic Legal. Notices to you may be sent to the email on your account or through in-product messages. Notices are effective when sent.",
          "Electronic communications. You consent to receive communications electronically, including agreements, notices, and billing messages.",
          "Assignment. You may not assign or transfer these Terms without Fajita's prior written consent. Fajita may assign these Terms to an affiliate or successor in connection with a merger, acquisition, or sale of assets.",
          "Force majeure. Fajita is not liable for delay or failure caused by events beyond its reasonable control, including internet failures, provider outages, labor disputes, acts of government, natural disasters, or security incidents not caused by Fajita's gross negligence.",
          "Order of precedence. If there is a conflict among these Terms, an Order, the Documentation, and plan-specific terms presented at checkout, the following order applies unless stated otherwise: (1) an executed enterprise agreement, if any; (2) plan-specific terms presented at checkout; (3) these Terms; (4) the Documentation.",
          "Entire agreement. These Terms, together with the Privacy Policy, Acceptable Use Policy, Cookie Notice, Refund Policy, and any plan-specific terms presented at checkout, constitute the entire agreement regarding the Service and supersede prior or contemporaneous understandings on that subject.",
          "Severability. If any provision is held unenforceable, the remainder remains in effect, and the unenforceable provision shall be modified to the minimum extent necessary to make it enforceable.",
          "Waiver. Failure to enforce a provision is not a waiver of that or any other provision.",
          "No third-party beneficiaries. These Terms do not create rights for any third party except as expressly stated.",
          "Headings. Headings are for convenience only and do not affect interpretation.",
        ],
      },
    ],
  },
];
