import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const DISCLOSURE_META: LegalDocMeta = {
  title: "Responsible Disclosure Policy",
  version: 1,
  effectiveDate: "2026-07-17",
  lastUpdated: "2026-07-17",
};

export const disclosureIntro: LegalBlock[] = [
  {
    type: "p",
    text: `Fajita welcomes good-faith reports of security vulnerabilities in our Service. Effective Date: ${DISCLOSURE_META.effectiveDate}.`,
  },
];

export const disclosureSections: LegalSection[] = [
  {
    id: "how",
    heading: "1. How to report",
    blocks: [
      {
        type: "p",
        text: "Use the contact form on fajita.io and select the Security report topic. Include steps to reproduce, impact, and any proof-of-concept details needed to understand the issue. Do not include customer data you do not own.",
      },
    ],
  },
  {
    id: "rules",
    heading: "2. Rules of engagement",
    blocks: [
      {
        type: "ul",
        items: [
          "Do not access or modify data that is not yours",
          "Do not degrade the Service or disrupt other customers",
          "Do not use social engineering against Fajita staff or customers",
          "Give us a reasonable time to investigate before public disclosure",
        ],
      },
    ],
  },
  {
    id: "response",
    heading: "3. What to expect",
    blocks: [
      {
        type: "p",
        text: "A person will acknowledge reports submitted through the security topic. We may ask for clarification. We do not offer a public bug bounty program at this time. We will not pursue legal action against researchers who comply with this Policy in good faith.",
      },
    ],
  },
];
