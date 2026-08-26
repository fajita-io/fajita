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
  {
    question: "Is Fajita open source?",
    answer:
      "Yes. The core Fajita monitoring platform is open source under AGPL-3.0. You can self-host it on your own infrastructure with the same verification engine, incidents, status pages, and integrations. Fajita Cloud is the managed option when you prefer not to operate workers and databases yourself.",
  },
];

export const billingFaq: FaqItem[] = [
  {
    question: "What do the plans cost?",
    answer:
      "Core is $12 per month with 100K checks included. Team is $49 per month with 500K checks. Scale is $99 per month with 2M checks. Annual billing saves two months on every plan. Exact amounts are on this page and match what Stripe charges at checkout.",
  },
  {
    question: "What counts as a check?",
    answer:
      "Every scheduled monitor run that completes counts as one check. Website, API, SSL, and heartbeat monitors all use the same meter. Your usage resets each billing period.",
  },
  {
    question: "What happens if I exceed my check allowance?",
    answer:
      "We show usage on your billing page before you hit the limit. When you reach your included checks, scheduled monitoring pauses until you upgrade or your billing period resets. There are no overage charges.",
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
  {
    question: "Is Fajita open source?",
    answer:
      "Yes. The core monitoring platform can be self-hosted under AGPL-3.0. Fajita Cloud pricing on this page is for the managed service: infrastructure, workers, upgrades, backups, and notifications operated by Fajita.",
  },
  {
    question: "Why pay for Fajita Cloud?",
    answer:
      "Because Fajita manages the infrastructure, monitoring workers, upgrades, backups, notifications, and day-to-day operations for you. You are paying for operational convenience, not for features withheld from self-hosted installs.",
  },
  {
    question: "Is the self-hosted version intentionally limited?",
    answer:
      "No. Self-hosted Fajita includes the same core monitoring, verification, incidents, status pages, and integrations. Billing enforcement is disabled locally. You operate the infrastructure instead.",
  },
  {
    question: "Can I migrate between self-hosted and Cloud?",
    answer:
      "You can run either model, but automated migration tooling does not exist yet. Export your data and re-create monitors when moving between self-hosted and Fajita Cloud.",
  },
];

export const ossFaq: FaqItem[] = [
  {
    question: "What is Fajita?",
    answer:
      "Fajita is uptime monitoring for websites, APIs, SSL certificates, and cron jobs. It verifies failures before escalating them to incidents and alerts.",
  },
  {
    question: "Is Fajita really open source?",
    answer:
      "Yes. The core monitoring platform is published under AGPL-3.0. You can inspect the source, self-host it, and contribute changes.",
  },
  {
    question: "What license does Fajita use?",
    answer:
      "AGPL-3.0. See the LICENSE file in the repository for the full text.",
  },
  {
    question: "Can I self-host it?",
    answer:
      "Yes. Docker Compose is the supported quick path. You provide PostgreSQL, Clerk for authentication, and optional SMTP or Resend for email.",
  },
  {
    question: "What does self-hosting require?",
    answer:
      "Docker, Docker Compose, Node.js 22+ for helper scripts, a Clerk application you control, and secrets for database access, cron authentication, and monitor encryption.",
  },
  {
    question: "Does self-hosted Fajita phone home?",
    answer:
      "No by default. Analytics and telemetry are off unless you explicitly opt in. Self-hosted installs do not report usage to Fajita.",
  },
  {
    question: "What is Fajita Cloud?",
    answer:
      "The managed service at fajita.io. Fajita operates infrastructure, workers, upgrades, backups, and notifications so you can start monitoring without running the stack yourself.",
  },
  {
    question: "Why would I pay for Cloud?",
    answer:
      "Operational convenience. Fajita Cloud removes worker scheduling, database operations, mail delivery setup, and upgrade maintenance from your plate.",
  },
  {
    question: "Can I contribute?",
    answer:
      "Yes. Read CONTRIBUTING.md in the repository. Bug reports, documentation fixes, and focused feature work are welcome through GitHub Issues and pull requests.",
  },
  {
    question: "Where do I report security issues?",
    answer:
      "Follow SECURITY.md in the repository for responsible disclosure. Do not open public GitHub issues for vulnerabilities.",
  },
];
