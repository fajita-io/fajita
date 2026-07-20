/**
 * FAQ content. Homepage uses homeFaq; pricing uses billingFaq.
 * Answers must stay consistent with src/lib/site/claims.ts and
 * pricingConfig.published in site-config and pricing.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const homeFaq: FaqItem[] = [
  {
    question: "What can Fajita monitor?",
    answer:
      "Websites, API endpoints, SSL certificates, and cron jobs or background work via heartbeat URLs. Each monitor is a real request from the outside, the same direction your customers arrive from.",
  },
  {
    question: "How does Fajita avoid false alarms?",
    answer:
      "A failed check triggers verification, not an alarm. Fajita re-checks before alerting anyone, so one dropped packet never pages the team. You hear about confirmed problems only.",
  },
  {
    question: "Does Fajita require an agent or code changes?",
    answer:
      "No agent, no SDK. Website, API, and SSL checks work from the outside with zero changes. Cron monitoring needs one line: a request to a private heartbeat URL at the end of your job.",
  },
  {
    question: "Can Fajita monitor authenticated APIs?",
    answer:
      "Yes. Add request headers, including authorization tokens. Credentials are encrypted at rest and never displayed back in full.",
  },
  {
    question: "Can I alert Slack or Discord?",
    answer:
      "Yes. Verified incidents route to email, Slack, Discord, and webhooks, and one clear recovery message follows when the service is healthy again.",
  },
  {
    question: "Can I create a public status page?",
    answer:
      "Yes. Every account can publish a status page with components, incident timelines, scheduled maintenance, subscriber updates, and uptime history. Custom domains are supported.",
  },
  {
    question: "What happens when a monitor fails?",
    answer:
      "Fajita verifies the failure, opens an incident, alerts your configured channels, and updates your status page. When checks pass again, the incident resolves and a recovery notice goes out.",
  },
  {
    question: "Is Fajita an observability platform?",
    answer:
      "No, and on purpose. Fajita does not collect logs, traces, or infrastructure metrics. It answers one question extremely well: is your software up, and who knows about it when it is not. If you need full observability, run it alongside Fajita.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. Monitoring history and account data can be exported. Your uptime record is yours.",
  },
  {
    question: "When can I use it?",
    answer:
      "Now. Create an account, add a monitor, and connect an alert channel. Pricing is published on the pricing page before anyone is asked to pay.",
  },
];

export const billingFaq: FaqItem[] = [
  {
    question: "What do the plans cost?",
    answer:
      "Starter is $9 per month, Pro is $19 per month, and Business is $39 per month. Annual billing is available on every plan at a lower monthly equivalent. Exact amounts are on this page and match what Stripe charges at checkout.",
  },
  {
    question: "Is there monthly and annual billing?",
    answer:
      "Yes, both. Annual is the better deal on every plan. You choose the interval at checkout and can change later through the billing portal.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrades take effect immediately. Downgrades take effect at the end of the billing period, and nothing is deleted without warning: if you are over the new plan's limits, you choose what to keep.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes, from the billing portal, without emailing anyone. Access runs to the end of the paid period. Your data remains exportable.",
  },
  {
    question: "What happens to my monitors if I cancel?",
    answer:
      "Checks stop at the end of the paid period. Your history stays exportable, and reactivating picks up where you left off.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "A written refund policy lives in the legal hub. The short version: if Fajita is not working for you early on, you will not have to argue about it.",
  },
];
