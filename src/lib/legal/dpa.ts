import type { LegalBlock, LegalDocMeta, LegalSection } from "./types";

export const DPA_META: LegalDocMeta = {
  title: "Data Processing Addendum",
  version: 1,
  effectiveDate: "2026-07-20",
  lastUpdated: "2026-07-20",
};

export const dpaIntro: LegalBlock[] = [
  {
    type: "p",
    text: `This Data Processing Addendum ("DPA") forms part of the agreement between Fajita ("Processor," "Fajita," "we," "us," or "our"), with a mailing address at 1001 S Main St, Ste 600, Kalispell, MT 59901, and the customer entity that enters into or accepts the Fajita Terms of Service ("Controller," "Customer," or "you") for the processing of Personal Data in connection with the Fajita Service.`,
  },
  {
    type: "p",
    text: `Effective Date: ${DPA_META.effectiveDate}. Last updated: ${DPA_META.lastUpdated}. This DPA applies when and to the extent Customer acts as a controller (or equivalent) of Personal Data and Fajita processes that Personal Data on Customer's behalf through the Service. If you do not process Personal Data through the Service, this DPA may not apply to you.`,
  },
  {
    type: "p",
    text: "In the event of a conflict between this DPA and the Terms of Service regarding the processing of Personal Data, this DPA controls. All other terms of the Terms of Service remain in effect.",
  },
];

export const dpaSections: LegalSection[] = [
  {
    id: "definitions",
    heading: "1. Definitions",
    blocks: [
      {
        type: "p",
        text: "Capitalized terms not defined here have the meanings given in the Terms of Service or applicable Data Protection Laws.",
      },
      {
        type: "ol",
        items: [
          '"Data Protection Laws" means all applicable laws relating to privacy, data protection, and security of Personal Data, including where applicable the GDPR, UK GDPR, and U.S. state comprehensive privacy laws.',
          '"GDPR" means Regulation (EU) 2016/679 and national implementing legislation.',
          '"Personal Data" means information relating to an identified or identifiable natural person that Customer submits to or causes to be processed through the Service, including status-page subscriber email addresses, alert recipient information, and other personal information in Customer Data.',
          '"Processing," "Processor," "Controller," "Data Subject," and "Supervisory Authority" have the meanings given in applicable Data Protection Laws.',
          '"Security Incident" means a breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to Personal Data processed by Fajita on behalf of Customer.',
          '"Subprocessor" means a third party engaged by Fajita to process Personal Data on behalf of Customer.',
          '"Standard Contractual Clauses" or "SCCs" means the standard contractual clauses approved by the European Commission or UK authorities for international transfers, as applicable.',
        ],
      },
    ],
  },
  {
    id: "scope",
    heading: "2. Scope and roles",
    blocks: [
      {
        type: "ol",
        items: [
          "Customer is the Controller with respect to Personal Data it submits or causes to be processed through the Service, except where Fajita acts as an independent controller as described in the Privacy Policy (for example, account billing with Fajita directly, product analytics on fajita.io, or affiliate program data).",
          "Fajita is the Processor with respect to Personal Data that Fajita processes on Customer's behalf through the Service.",
          "The subject matter, duration, nature, and purpose of Processing are described in Annex A. Categories of Data Subjects and types of Personal Data are described in Annex B.",
          "Customer shall provide documented instructions for Processing through its use and configuration of the Service. Additional instructions outside the Service interface must be reasonable, lawful, and in writing.",
        ],
      },
    ],
  },
  {
    id: "instructions",
    heading: "3. Customer instructions and responsibilities",
    blocks: [
      {
        type: "ol",
        items: [
          "Customer represents that it has established a lawful basis under Data Protection Laws for Processing and for instructing Fajita to process Personal Data through the Service.",
          "Customer is responsible for the accuracy, quality, and legality of Personal Data and the means by which Customer acquired Personal Data, including obtaining required notices and consents from Data Subjects.",
          "Customer shall not instruct Fajita to process Personal Data in violation of Data Protection Laws or the Terms of Service.",
          "Customer shall configure retention, deletion, and access controls available in the Service and shall notify Fajita if Customer requires assistance beyond available product functionality.",
        ],
      },
    ],
  },
  {
    id: "processor-obligations",
    heading: "4. Processor obligations",
    blocks: [
      {
        type: "p",
        text: "Fajita shall:",
      },
      {
        type: "ul",
        items: [
          "Process Personal Data only on documented instructions from Customer, unless required by law, in which case Fajita shall inform Customer of that legal requirement before Processing unless prohibited by law",
          "Ensure that persons authorized to process Personal Data are bound by confidentiality obligations",
          "Implement appropriate technical and organizational measures designed to protect Personal Data, as described in Section 7 and Annex C",
          "Engage Subprocessors only in accordance with Section 5",
          "Assist Customer with Data Subject requests and compliance obligations to the extent described in Section 6",
          "Notify Customer of Security Incidents as described in Section 8",
          "Delete or return Personal Data as described in Section 9, subject to legal retention requirements",
          "Make available information reasonably necessary to demonstrate compliance and allow audits as described in Section 10",
        ],
      },
    ],
  },
  {
    id: "subprocessors",
    heading: "5. Subprocessors",
    blocks: [
      {
        type: "ol",
        items: [
          "Customer authorizes Fajita to engage Subprocessors to process Personal Data, provided Fajita imposes data protection obligations on each Subprocessor that are no less protective than those in this DPA.",
          "The current Subprocessor list is published at /legal/subprocessors and may be updated from time to time. Fajita will provide notice of new Subprocessors by updating that list and, where required by Data Protection Laws, by providing Customer an opportunity to object on reasonable grounds relating to data protection.",
          "If Customer objects on reasonable grounds within thirty (30) days of notice and the parties cannot resolve the objection, Customer may terminate the affected Service as its sole remedy, without prejudice to fees owed for services already rendered.",
          "Fajita remains responsible for Subprocessor performance of data protection obligations to the extent required by Data Protection Laws.",
        ],
      },
    ],
  },
  {
    id: "assistance",
    heading: "6. Data Subject requests and regulatory assistance",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita shall, taking into account the nature of Processing, provide reasonable assistance to Customer in responding to Data Subject requests to exercise rights under Data Protection Laws, where Customer cannot fulfill the request through the Service.",
          "Fajita shall provide reasonable assistance with Customer's data protection impact assessments and prior consultations with Supervisory Authorities where required, to the extent Fajita's Processing is implicated and Customer cannot obtain the information independently.",
          "Customer shall reimburse Fajita for reasonable costs of assistance that exceeds standard product functionality, unless the assistance is required due to Fajita's breach of this DPA.",
        ],
      },
    ],
  },
  {
    id: "security",
    heading: "7. Security",
    blocks: [
      {
        type: "p",
        text: "Fajita shall implement and maintain technical and organizational measures appropriate to the risk, including measures described in Annex C. Customer is responsible for safeguarding its account credentials, API keys, and webhook secrets, and for configuring the Service securely.",
      },
    ],
  },
  {
    id: "incidents",
    heading: "8. Security Incidents",
    blocks: [
      {
        type: "ol",
        items: [
          "Fajita shall notify Customer without undue delay after becoming aware of a Security Incident affecting Customer Personal Data.",
          "Notification shall include, to the extent known, a description of the nature of the Security Incident, categories and approximate number of Data Subjects and records concerned, likely consequences, and measures taken or proposed.",
          "Fajita shall take reasonable steps to investigate, mitigate, and remediate the Security Incident.",
          "Customer is responsible for notifying Supervisory Authorities and Data Subjects where required by Data Protection Laws, unless otherwise agreed in writing.",
        ],
      },
    ],
  },
  {
    id: "deletion",
    heading: "9. Return and deletion",
    blocks: [
      {
        type: "ol",
        items: [
          "Upon termination or expiration of the Service, Customer may export Customer Data through available product features for a reasonable period, where implemented.",
          "Following termination, Fajita shall delete Customer Personal Data within a reasonable period, except where retention is required by law or permitted by the Privacy Policy and Terms of Service for backup, dispute resolution, or security purposes, in which case Fajita shall isolate and protect retained Personal Data.",
          "Customer acknowledges that deleted data may persist in encrypted backups for a limited time before being overwritten in the ordinary course.",
        ],
      },
    ],
  },
  {
    id: "audit",
    heading: "10. Audits and information",
    blocks: [
      {
        type: "ol",
        items: [
          "Upon reasonable written request no more than once per twelve (12) months, Fajita shall make available information reasonably necessary to demonstrate compliance with this DPA, which may include summaries of security controls, certifications, or audit reports where available under confidentiality.",
          "If required by Data Protection Laws and not satisfied by the information provided, Customer may conduct or appoint an independent auditor to assess Fajita's Processing, subject to reasonable notice, confidentiality, scope limitations, and scheduling so as not to disrupt Fajita's operations.",
          "Customer shall bear its own audit costs and reimburse Fajita for reasonable internal costs of supporting an onsite audit, unless the audit reveals material non-compliance by Fajita.",
        ],
      },
    ],
  },
  {
    id: "transfers",
    heading: "11. International transfers",
    blocks: [
      {
        type: "p",
        text: "Customer authorizes Fajita to transfer Personal Data to the United States and other countries where Fajita or its Subprocessors operate. Where required by Data Protection Laws, Fajita shall implement appropriate safeguards, which may include SCCs or equivalent mechanisms. Customer may request additional transfer documentation by contacting Fajita at the address above.",
      },
    ],
  },
  {
    id: "liability",
    heading: "12. Liability",
    blocks: [
      {
        type: "p",
        text: "Each party's liability under this DPA is subject to the limitations and exclusions in the Terms of Service, except that nothing in the Terms limits either party's liability to Data Subjects or Supervisory Authorities to the extent such limitation is prohibited by Data Protection Laws.",
      },
    ],
  },
  {
    id: "term",
    heading: "13. Term",
    blocks: [
      {
        type: "p",
        text: "This DPA remains in effect for the duration of Fajita's Processing of Personal Data on behalf of Customer and survives termination until Personal Data is deleted or returned in accordance with Section 9, except for provisions that by nature should survive.",
      },
    ],
  },
  {
    id: "general",
    heading: "14. General",
    blocks: [
      {
        type: "ol",
        items: [
          "Amendments. Fajita may update this DPA to reflect changes in Data Protection Laws or Processing activities by publishing a revised version with a new Effective Date. Material changes will be notified where required by law.",
          "Governing law. This DPA is governed by the laws specified in the Terms of Service, without prejudice to mandatory Data Protection Laws.",
          "Order of precedence. If SCCs or other approved transfer mechanisms are executed between the parties, they supplement this DPA for applicable transfers.",
          "Contact. Privacy and DPA inquiries: Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901, or the contact form on fajita.io with topic Privacy.",
        ],
      },
    ],
  },
  {
    id: "annex-a",
    heading: "Annex A. Processing details",
    blocks: [
      {
        type: "ul",
        items: [
          "Subject matter: provision of the Fajita uptime monitoring Service",
          "Duration: term of the Customer subscription or account plus retention periods in Section 9",
          "Nature and purpose: hosting, storing, transmitting, displaying, and otherwise processing Personal Data submitted by Customer to operate monitors, incidents, alerts, status pages, and related features",
          "Processing operations: collection, storage, retrieval, use, disclosure to Subprocessors, transmission to alert destinations configured by Customer, deletion, and backup",
        ],
      },
    ],
  },
  {
    id: "annex-b",
    heading: "Annex B. Data Subjects and categories",
    blocks: [
      {
        type: "p",
        text: "Data Subjects may include Customer personnel, Customer end users, status-page subscribers, and alert recipients designated by Customer.",
      },
      {
        type: "p",
        text: "Categories of Personal Data may include names, email addresses, authentication identifiers linked to Customer accounts, status-page subscription preferences, alert routing destinations, incident-related content containing personal information, and technical logs associated with configured endpoints.",
      },
    ],
  },
  {
    id: "annex-c",
    heading: "Annex C. Security measures (summary)",
    blocks: [
      {
        type: "ul",
        items: [
          "Access controls limiting production access to authorized personnel",
          "Encryption of certain secrets and sensitive configuration data at rest",
          "Use of reputable infrastructure and database providers with industry-standard physical and network security",
          "Monitoring and logging for security and abuse detection, with limited retention",
          "Vulnerability reporting process described in the Responsible Disclosure Policy",
          "Incident response procedures designed to investigate and remediate Security Incidents",
        ],
      },
      {
        type: "p",
        text: "This summary is descriptive and does not obligate Fajita to maintain any specific vendor certification unless expressly agreed in writing.",
      },
    ],
  },
];
