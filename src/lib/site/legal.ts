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
    summary: "Terms for customers who need a processor agreement.",
    status: "in-preparation",
  },
  {
    id: "sla",
    name: "Service Level Agreement",
    summary: "Availability commitments for paid plans.",
    status: "in-preparation",
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
    summary: "The third-party services that process data on our behalf.",
    status: "in-preparation",
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
