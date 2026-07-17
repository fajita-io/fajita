/**
 * FAQ content. Homepage uses homeFaq; pricing uses billingFaq.
 * Answers must stay consistent with src/lib/site/claims.ts. When a
 * capability is early-access scope (not live today), the answer says
 * "will": accuracy over swagger.
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
      "Fajita is in private build. Join early access and you will be invited as accounts open, with pricing published before anyone is asked to pay.",
  },
];

export const billingFaq: FaqItem[] = [
  {
    question: "When will pricing be published?",
    answer:
      "When accounts open. Early access members see pricing first, before anyone is asked to pay. There are no numbers on this page today because we will not publish a price we have not committed to.",
  },
  {
    question: "Is there monthly and annual billing?",
    answer:
      "Yes, both. Annual pricing will be the better deal, and the exact difference publishes with the plans.",
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
    question: "Will there be a refund policy?",
    answer:
      "Yes, published in the legal hub before accounts open. The short version we are committing to now: if Fajita is not working for you early on, you will not have to argue about it.",
  },
];
