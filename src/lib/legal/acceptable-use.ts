import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const AUP_META: LegalDocMeta = {
  title: "Acceptable Use Policy",
  version: 2,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const aupIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Acceptable Use Policy ("AUP") governs use of the Fajita Service and is incorporated into the Terms of Service. Violation may result in suspension, termination, or legal action. Effective Date: ${AUP_META.effectiveDate}. Last updated: ${AUP_META.lastUpdated}.`,
  },
];

export const aupSections: LegalSection[] = [
  {
    id: "purpose",
    heading: "1. Purpose and scope",
    blocks: [
      {
        type: "p",
        text: "This AUP protects Fajita, its customers, and third parties from abuse of monitoring infrastructure, alert channels, status pages, and related features. It applies to all users, organizations, and automated systems accessing the Service.",
      },
    ],
  },
  {
    id: "allowed",
    heading: "2. Permitted use",
    blocks: [
      {
        type: "p",
        text: "You may use the Service to monitor systems, endpoints, certificates, and scheduled jobs that you own or are expressly authorized to monitor; to receive operational alerts for those systems; and to communicate service status to your users through status pages and subscriber notifications, in each case in compliance with law and this AUP.",
      },
    ],
  },
  {
    id: "prohibited",
    heading: "3. Prohibited use",
    blocks: [
      {
        type: "p",
        text: "You shall not, and shall not permit others to:",
      },
      {
        type: "ul",
        items: [
          "Monitor, probe, scan, or test targets you are not authorized to observe",
          "Use the Service to attack, disrupt, degrade, or impair third-party systems, networks, or services, including denial-of-service activity",
          "Configure monitors against addresses, networks, or hosts prohibited by the Service (including private, loopback, link-local, or other restricted destinations where the Service blocks or refuses such checks)",
          "Send spam, phishing, bulk unsolicited messages, or unlawful content through alerts, webhooks, status pages, or subscriber email",
          "Collect or use status-page subscriber information without required consent or in violation of unsubscribe requests",
          "Misrepresent incidents, uptime, or service status in a way that is fraudulent or likely to mislead the public",
          "Attempt to bypass plan limits, authentication, security controls, rate limits, or probe restrictions",
          "Use the Service to distribute malware, exploit kits, or illegal content",
          "Reverse engineer the Service except where applicable law permits",
          "Resell, sublicense, or provide the Service to third parties as a managed offering without Fajita's prior written consent",
          "Use the Service for any illegal purpose or in violation of export, sanctions, or trade laws",
          "Engage in affiliate fraud, cookie stuffing, automated referral manipulation, or other deceptive attribution practices",
          "Interfere with other customers' use of the Service or with Fajita's infrastructure",
        ],
      },
    ],
  },
  {
    id: "monitors",
    heading: "4. Monitoring and probe conduct",
    blocks: [
      {
        type: "ol",
        items: [
          "You are solely responsible for ensuring that each monitor target permits the checks you configure, including HTTP requests, TLS validation, and heartbeat pings.",
          "You shall configure reasonable check intervals and thresholds. Excessive or abusive check patterns that harm targets or Fajita infrastructure may be throttled or blocked.",
          "You shall not use the Service as a general-purpose internet scanner or vulnerability assessment tool against third-party systems.",
          "If a target owner requests that monitoring cease, you shall promptly disable or remove the relevant monitors unless you have a lawful basis to continue.",
        ],
      },
    ],
  },
  {
    id: "alerts",
    heading: "5. Alerts, webhooks, and integrations",
    blocks: [
      {
        type: "ol",
        items: [
          "Alert destinations must be under your control or authorized to receive operational notifications from you.",
          "You shall protect webhook URLs, signing secrets, and integration tokens. Compromised destinations must be rotated promptly.",
          "You shall not use alert channels to exfiltrate third-party data unlawfully or to relay unrelated traffic.",
          "Fajita may rate-limit or suspend alert delivery that appears abusive, misconfigured, or harmful to recipients or providers.",
        ],
      },
    ],
  },
  {
    id: "status-pages",
    heading: "6. Status pages and subscribers",
    blocks: [
      {
        type: "ol",
        items: [
          "Status-page content must be accurate to the best of your knowledge and updated in good faith during incidents.",
          "You shall provide a lawful basis and any required notice before collecting subscriber email addresses.",
          "Subscriber lists must not be purchased, scraped, or imported from unrelated sources without valid consent.",
          "You shall honor unsubscribe requests and applicable anti-spam laws for subscriber communications sent through the Service.",
        ],
      },
    ],
  },
  {
    id: "resources",
    heading: "7. Resource limits and fair use",
    blocks: [
      {
        type: "p",
        text: "Use of the Service is subject to plan entitlements and fair-use limits that may not be numerically published. Fajita may throttle, queue, or restrict activity that materially exceeds normal operational patterns, threatens platform stability, or appears intended to evade plan limits.",
      },
    ],
  },
  {
    id: "enforcement",
    heading: "8. Enforcement",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita may investigate suspected violations, request information, remove or disable content, throttle monitors or alerts, suspend accounts, terminate access, and preserve evidence as permitted by law.",
          "Fajita may report unlawful activity to law enforcement or affected parties where appropriate.",
          "Enforcement actions may be taken with or without prior notice where permitted by law, including for urgent security or abuse situations.",
          "Repeated or egregious violations may result in permanent termination without refund.",
        ],
      },
    ],
  },
  {
    id: "reporting",
    heading: "9. Reporting abuse",
    blocks: [
      {
        type: "p",
        text: "To report abuse of the Service, unauthorized monitoring, or status-page misuse, use the contact form on fajita.io with topic Security report or Abuse report, including relevant URLs, monitor details, and timestamps. Fajita will review good-faith reports and respond as appropriate.",
      },
    ],
  },
  {
    id: "changes",
    heading: "10. Changes",
    blocks: [
      {
        type: "p",
        text: "Fajita may update this AUP by publishing a revised version with a new Effective Date. Continued use after the effective date constitutes acceptance where permitted by law.",
      },
    ],
  },
];
