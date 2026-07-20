import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const DISCLOSURE_META: LegalDocMeta = {
  title: "Responsible Disclosure Policy",
  version: 2,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const disclosureIntro: LegalBlock[] = [
  {
    type: "p",
    text: `Fajita welcomes good-faith security research and vulnerability reports concerning the Fajita Service. This Responsible Disclosure Policy ("Policy") describes how to report issues and what you can expect from us. Effective Date: ${DISCLOSURE_META.effectiveDate}. Last updated: ${DISCLOSURE_META.lastUpdated}.`,
  },
];

export const disclosureSections: LegalSection[] = [
  {
    id: "scope",
    heading: "1. Scope",
    blocks: [
      {
        type: "p",
        text: "This Policy applies to security vulnerabilities in Fajita-controlled systems that provide the Service, including fajita.io, the authenticated application, APIs operated by Fajita, and related infrastructure under Fajita's control.",
      },
      {
        type: "p",
        text: "Out of scope without prior written authorization:",
      },
      {
        type: "ul",
        items: [
          "Third-party services, customer-owned endpoints, or systems not operated by Fajita",
          "Social engineering or physical attacks against Fajita personnel or facilities",
          "Denial-of-service testing that degrades the Service for other customers",
          "Spam or abuse of contact forms unrelated to a good-faith security report",
          "Issues in customer-configured monitor targets, status-page content, or alert destinations",
          "Vulnerabilities requiring unlikely user interaction without meaningful impact",
          "Findings from automated scanning that generates excessive traffic",
        ],
      },
    ],
  },
  {
    id: "how",
    heading: "2. How to report",
    blocks: [
      {
        type: "ol",
        items: [
          "Submit reports through the contact form on fajita.io and select the Security report topic.",
          "Include a clear description, steps to reproduce, affected URLs or components, potential impact, and proof-of-concept details sufficient for us to validate the issue.",
          "Do not include customer data you do not own or unnecessary personal information.",
          "Encrypt sensitive attachments only if we provide an encryption method. Otherwise, describe issues without embedding secrets in public channels.",
        ],
      },
    ],
  },
  {
    id: "rules",
    heading: "3. Rules of engagement",
    blocks: [
      {
        type: "p",
        text: "When conducting research within scope, you shall:",
      },
      {
        type: "ul",
        items: [
          "Make a good-faith effort to avoid privacy violations, data destruction, and service degradation",
          "Not access, modify, or exfiltrate data that is not yours",
          "Not exploit a vulnerability beyond what is necessary to demonstrate impact",
          "Not degrade the Service or disrupt other customers",
          "Not use social engineering against Fajita staff or customers",
          "Give Fajita a reasonable time to investigate and remediate before public disclosure",
        ],
      },
    ],
  },
  {
    id: "safe-harbor",
    heading: "4. Safe harbor",
    blocks: [
      {
        type: "p",
        text: "If you comply with this Policy in good faith, Fajita will not initiate legal action against you solely for authorized security research activities that were conducted within scope and reported as described herein. Fajita cannot authorize research on systems it does not control. This safe harbor does not apply if you violate law, access data that is not yours, extort Fajita, or act in bad faith.",
      },
    ],
  },
  {
    id: "response",
    heading: "5. What to expect",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita will acknowledge reports submitted through the Security report topic within a reasonable time, typically within five (5) business days.",
          "We may ask for clarification or additional information.",
          "We may notify you when an issue is validated, declined, or remediated, but we do not guarantee public status updates for every report.",
          "Fajita does not operate a public bug bounty or vulnerability reward program at this time. Participation in research is voluntary.",
          "Fajita may recognize researchers at its discretion but is not obligated to provide compensation, credits, or public attribution.",
        ],
      },
    ],
  },
  {
    id: "legal",
    heading: "6. Legal matters",
    blocks: [
      {
        type: "p",
        text: "This Policy does not grant permission to test systems outside the scope described above. Unauthorized access remains prohibited by law. If you are unsure whether testing is permitted, contact Fajita before proceeding.",
      },
    ],
  },
  {
    id: "changes",
    heading: "7. Changes",
    blocks: [
      {
        type: "p",
        text: "Fajita may update this Policy by publishing a revised version with a new Effective Date.",
      },
    ],
  },
];
