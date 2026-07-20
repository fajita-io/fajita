/**
 * Legal hub registry. Documents with status in-force must have a published
 * route and real effective content. Never publish template text as final.
 */

export type LegalDocStatus = "in-force" | "in-preparation";

export interface LegalDoc {
  id: string;
  name: string;
  summary: string;
  status: LegalDocStatus;
  /** Route published only when the document is in force. */
  href?: string;
  /** Omit from sitemap and set noindex on the route. Hub link still published. */
  noindex?: boolean;
  /** Omit from the site footer legal column. Default true when linked. */
  showInFooter?: boolean;
}

export const legalDocs: LegalDoc[] = [
  {
    id: "terms",
    name: "Terms of Service",
    summary: "The agreement that governs your Fajita account and use of the service.",
    status: "in-force",
    href: "/legal/terms",
  },
  {
    id: "privacy",
    name: "Privacy Policy",
    summary: "What we collect, why, how long we keep it, and how to get it removed.",
    status: "in-force",
    href: "/legal/privacy",
  },
  {
    id: "acceptable-use",
    name: "Acceptable Use Policy",
    summary: "What you may and may not monitor, and how we prevent abuse of the checker network.",
    status: "in-force",
    href: "/legal/acceptable-use",
  },
  {
    id: "dpa",
    name: "Data Processing Addendum",
    summary: "Processor terms for customers who process personal data through the Service.",
    status: "in-force",
    href: "/legal/dpa",
    noindex: true,
    showInFooter: false,
  },
  {
    id: "sla",
    name: "Service Level Agreement",
    summary: "99.9% monthly availability for paid plans, with service credits if we miss it.",
    status: "in-force",
    href: "/legal/sla",
  },
  {
    id: "cookies",
    name: "Cookie Notice",
    summary: "What the site stores in your browser and what it is for.",
    status: "in-force",
    href: "/legal/cookies",
  },
  {
    id: "refunds",
    name: "Refund Policy",
    summary: "How refunds and billing disputes are handled.",
    status: "in-force",
    href: "/legal/refunds",
  },
  {
    id: "disclosure",
    name: "Responsible Disclosure Policy",
    summary: "How to report a security vulnerability and what to expect from us.",
    status: "in-force",
    href: "/legal/disclosure",
  },
  {
    id: "subprocessors",
    name: "Subprocessor List",
    summary: "Third-party services that may process personal data on our behalf.",
    status: "in-force",
    href: "/legal/subprocessors",
    noindex: true,
    showInFooter: false,
  },
  {
    id: "affiliate-agreement",
    name: "Affiliate Program Agreement",
    summary:
      "Terms for approved affiliates: attribution, commissions, promotion rules, and payouts.",
    status: "in-force",
    href: "/legal/affiliate-agreement",
  },
  {
    id: "affiliate-privacy",
    name: "Affiliate Privacy Notice",
    summary:
      "How we collect and use personal information for affiliate applicants and partners.",
    status: "in-force",
    href: "/legal/affiliate-privacy",
  },
];
