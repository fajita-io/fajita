import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const SLA_META: LegalDocMeta = {
  title: "Service Level Agreement",
  version: 1,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const slaIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Service Level Agreement (the "SLA") describes availability commitments for the Fajita Service and the service credits available when Fajita fails to meet those commitments. It is incorporated into the Terms of Service. Capitalized terms not defined here have the meanings in the Terms.`,
  },
  {
    type: "p",
    text: `Effective Date: ${SLA_META.effectiveDate}. Last updated: ${SLA_META.lastUpdated}.`,
  },
];

export const slaSections: LegalSection[] = [
  {
    id: "definitions",
    heading: "1. Definitions",
    blocks: [
      {
        type: "ol",
        items: [
          '"Covered Components" means the Fajita web application, authenticated dashboard, management API used to configure monitors and incidents, scheduled execution of monitoring checks according to your plan, and alert dispatch initiated by Fajita to destinations you configure.',
          '"Downtime" means a period of at least five (5) consecutive minutes during which a Covered Component is materially unavailable to substantially all paying Customers, excluding Excluded Downtime.',
          '"Eligible Subscription" means an active paid Subscription in good standing (fees current, no suspension for cause) on Starter, Pro, or Business.',
          '"Monthly Service Fee" means the subscription fees actually paid by you to Fajita for the calendar month in which Downtime occurred, excluding taxes, pass-through charges, and one-time fees.',
          '"Monthly Uptime Percentage" means total minutes in the calendar month minus minutes of Downtime, divided by total minutes in the calendar month, expressed as a percentage.',
          '"Service" has the meaning in the Terms of Service.',
        ],
      },
    ],
  },
  {
    id: "scope",
    heading: "2. Scope",
    blocks: [
      {
        type: "p",
        text: "This SLA applies only to Covered Components operated by Fajita. It does not measure, warrant, or provide credits for the availability of websites, APIs, certificates, cron jobs, or other targets you monitor; the performance of email providers, chat platforms, or other third parties that receive alerts; DNS or TLS configuration on custom status domains you control; or subscriber delivery beyond Fajita's dispatch attempt.",
      },
      {
        type: "p",
        text: "Monitoring accuracy, alert timing, and incident verification depend on network conditions, target behavior, and configuration you supply. Those factors are outside this SLA unless Fajita's Covered Components themselves are unavailable.",
      },
    ],
  },
  {
    id: "commitment",
    heading: "3. Availability commitment",
    blocks: [
      {
        type: "p",
        text: "Fajita will use commercially reasonable efforts to maintain a Monthly Uptime Percentage of at least 99.9% for Covered Components for each calendar month, measured in Coordinated Universal Time (UTC).",
      },
    ],
  },
  {
    id: "measurement",
    heading: "4. Measurement",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita measures availability using internal monitoring systems and records published on the Fajita service status page at fajita.io/status (or a successor URL Fajita designates).",
          "A minute counts toward Downtime only if the relevant Covered Component fails synthetic checks from multiple monitoring regions or Fajita otherwise confirms a platform-wide impairment affecting substantially all Eligible Subscriptions.",
          "Partial degradation that does not prevent core monitoring, dashboard access, or alert dispatch for substantially all paying Customers does not count as Downtime unless it persists for the full five-minute threshold.",
          "If Fajita's records and your reasonable evidence materially disagree, the parties will review in good faith. Fajita's good-faith records control absent manifest error.",
        ],
      },
    ],
  },
  {
    id: "exclusions",
    heading: "5. Excluded Downtime",
    blocks: [
      {
        type: "p",
        text: "Downtime does not include unavailability caused by or related to:",
      },
      {
        type: "ul",
        items: [
          "scheduled maintenance announced at least twenty-four (24) hours in advance on the service status page or by email to account owners;",
          "emergency maintenance to address security, abuse, or imminent platform harm;",
          "force majeure events described in the Terms;",
          "suspension or termination of your account for non-payment, Acceptable Use violations, or legal requirements;",
          "your equipment, software, network, or third-party services outside Fajita's control;",
          "beta, preview, or experimental features labeled as such;",
          "requests blocked by rate limits applied in accordance with the Documentation after fair notice; or",
          "attacks or traffic patterns directed primarily at your Organization rather than Fajita's shared platform, where Fajita isolates impact to your account.",
        ],
      },
    ],
  },
  {
    id: "credits",
    heading: "6. Service credits",
    blocks: [
      {
        type: "p",
        text: "If Fajita fails to meet the availability commitment in Section 3 for a calendar month, you may request a service credit according to the table below. Credits apply to future Subscription fees only and are not refundable for cash except where law requires.",
      },
      {
        type: "ul",
        items: [
          "Monthly Uptime Percentage at or above 99.9%: no credit.",
          "At or above 99.0% and below 99.9%: credit equal to ten percent (10%) of the Monthly Service Fee.",
          "At or above 95.0% and below 99.0%: credit equal to twenty-five percent (25%) of the Monthly Service Fee.",
          "Below 95.0%: credit equal to fifty percent (50%) of the Monthly Service Fee.",
        ],
      },
      {
        type: "p",
        text: "The maximum service credit for any calendar month is one hundred percent (100%) of the Monthly Service Fee for that month. Credits may not be transferred, resold, or combined across Organizations unless Fajita agrees in writing.",
      },
    ],
  },
  {
    id: "requests",
    heading: "7. Credit requests",
    blocks: [
      {
        type: "ol",
        items: [
          "Submit a request through the contact form at fajita.io with topic Support within thirty (30) days after the end of the month in which the Downtime occurred.",
          "Include your Organization name, account email, affected month (UTC), and a brief description of the impact.",
          "Fajita will respond within fifteen (15) business days with approval, denial, or a request for additional information.",
          "Approved credits appear on a future invoice within one (1) billing cycle unless Fajita and you agree otherwise.",
          "Failure to request a credit within the thirty-day window waives the credit for that month unless applicable law provides otherwise.",
        ],
      },
    ],
  },
  {
    id: "remedy",
    heading: "8. Sole remedy",
    blocks: [
      {
        type: "p",
        text: "Service credits under this SLA are your sole and exclusive remedy for failure to meet the availability commitment in Section 3, except where applicable law prohibits such limitation. Nothing in this SLA expands Fajita's aggregate liability beyond the limits in the Terms for claims outside availability failures.",
      },
    ],
  },
  {
    id: "eligibility",
    heading: "9. Eligibility and precedence",
    blocks: [
      {
        type: "ol",
        items: [
          "Only Customers with an Eligible Subscription during the month of Downtime may request credits.",
          "Free trials, courtesy access, and accounts in suspension or past-due status are not eligible.",
          "If you have a signed enterprise agreement with different availability terms, that agreement controls for the covered services it describes.",
          "If this SLA conflicts with the Terms on availability credits, this SLA controls for Eligible Subscriptions. Otherwise, the order of precedence in the Terms applies.",
        ],
      },
    ],
  },
  {
    id: "changes",
    heading: "10. Changes",
    blocks: [
      {
        type: "p",
        text: "Fajita may update this SLA by publishing a revised version with a new Effective Date. Material reductions to availability commitments or credit percentages apply starting the next calendar month after notice where required by law. Continued use of a paid Subscription after the effective date constitutes acceptance where permitted by law.",
      },
    ],
  },
  {
    id: "contact",
    heading: "11. Contact",
    blocks: [
      {
        type: "p",
        text: "Questions about this SLA or credit requests: use the contact form at fajita.io with topic Support, or write to Fajita at 1001 S Main St, Ste 600, Kalispell, MT 59901.",
      },
    ],
  },
];
