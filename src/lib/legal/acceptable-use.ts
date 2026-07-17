import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const AUP_META: LegalDocMeta = {
  title: "Acceptable Use Policy",
  version: 1,
  effectiveDate: "2026-07-17",
  lastUpdated: "2026-07-17",
};

export const aupIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Acceptable Use Policy ("AUP") applies to use of the Fajita Service. Violation may result in suspension or termination. Effective Date: ${AUP_META.effectiveDate}.`,
  },
];

export const aupSections: LegalSection[] = [
  {
    id: "allowed",
    heading: "1. Permitted use",
    blocks: [
      {
        type: "p",
        text: "You may use the Service to monitor systems, endpoints, and jobs you own or are authorized to monitor, to communicate status to your users, and to receive alerts for those systems.",
      },
    ],
  },
  {
    id: "prohibited",
    heading: "2. Prohibited use",
    blocks: [
      {
        type: "ul",
        items: [
          "Monitoring targets you are not authorized to test or observe",
          "Using the Service to scan, attack, or disrupt third-party systems",
          "Configuring monitors against private networks, loopback, or link-local addresses in ways our probes refuse or that violate others' rights",
          "Sending spam, phishing, or unlawful content through alerts, status pages, or subscriber email",
          "Attempting to bypass plan limits, security controls, or authentication",
          "Reverse engineering the Service except where law permits",
          "Reselling the Service without written permission",
          "Using the Service for any illegal purpose",
        ],
      },
    ],
  },
  {
    id: "enforcement",
    heading: "3. Enforcement",
    blocks: [
      {
        type: "p",
        text: "Fajita may investigate suspected violations, remove content, suspend accounts, and report unlawful activity to authorities. Contact reports through the contact form with topic Security report where appropriate.",
      },
    ],
  },
];
