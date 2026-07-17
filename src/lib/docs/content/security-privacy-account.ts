import { callout, h2, p, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-07-17";
const PRODUCT_VERSION = "2026.07";

const security = {
  category: "security" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-security",
  reviewers: ["engineering", "security"],
  productVersion: PRODUCT_VERSION,
};

const privacy = {
  category: "privacy" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-privacy",
  reviewers: ["privacy", "legal"],
  productVersion: PRODUCT_VERSION,
};

const account = {
  category: "account" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-platform",
  reviewers: ["engineering", "privacy"],
  productVersion: PRODUCT_VERSION,
};

export const securityPrivacyAccountPages: DocPage[] = [
  defineDoc({
    meta: {
      ...security,
      slug: "security/overview",
      title: "Security overview",
      description: "How Fajita protects your data: encryption, tenant isolation, access control, and disclosure.",
      model: "learn",
      pageType: "concept",
      order: 0,
      productArea: ["security"],
      keywords: ["security", "encryption", "isolation", "access control", "disclosure"],
      relatedPages: ["security/monitoring-destinations", "security/secret-handling", "security/responsible-disclosure"],
      searchBoost: 1,
    },
    body: [
      p("Security at Fajita is about reducing risk through clear, enforced boundaries, not absolute promises."),
      h2("What Fajita does"),
      ul([
        "Encrypts data in transit.",
        "Encrypts supported secrets at rest.",
        "Isolates each organization's data through server-side authorization and database row-level security.",
        "Enforces role-based access on the server.",
        "Restricts what monitors and webhooks can reach. See [Monitoring destinations](/docs/security/monitoring-destinations).",
        "Signs generic webhooks so you can verify authenticity.",
      ]),
      callout("security", [
        p("Fajita is designed to reduce the risk of cross-tenant access through server-side authorization and database row-level security. No system can promise it will never leak data."),
      ]),
      h2("What Fajita does not claim"),
      p("Fajita does not claim certifications it has not earned. Any compliance status is stated only when it is real and documented."),
      p("Report a vulnerability through [Responsible disclosure](/docs/security/responsible-disclosure)."),
    ],
  }),

  defineDoc({
    meta: {
      ...security,
      slug: "security/monitoring-destinations",
      title: "Monitoring destinations",
      description: "Why Fajita blocks private and reserved network destinations, and how to make an endpoint monitorable.",
      model: "learn",
      pageType: "concept",
      order: 1,
      productArea: ["security", "monitors"],
      keywords: ["destination", "private ip", "ssrf", "blocked", "metadata", "reserved", "ports"],
      relatedPages: ["troubleshooting/check-blocked"],
    },
    body: [
      p("Fajita only checks public destinations. This protects both your network and Fajita's infrastructure from being used to reach internal systems."),
      h2("Blocked destinations"),
      ul([
        "Private IP ranges and loopback addresses.",
        "Link-local and cloud metadata endpoints.",
        "Reserved networks.",
        "Unsupported protocols and restricted ports.",
        "Redirects that resolve to any of the above.",
      ]),
      h2("Make an endpoint monitorable"),
      ul([
        "Expose a public HTTPS health endpoint.",
        "Remove redirects that point to private destinations.",
        "Use an authentication header instead of a private network path.",
        "Return minimal health data and keep secrets out of query parameters.",
      ]),
      callout("security", [
        p("These restrictions cannot be bypassed. That is the point. See [Why was my check blocked?](/docs/troubleshooting/check-blocked)."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...security,
      slug: "security/secret-handling",
      title: "Secret handling",
      description: "Which secrets Fajita stores, how they are encrypted and masked, and where they must never appear.",
      model: "learn",
      pageType: "policy",
      order: 2,
      productArea: ["security"],
      keywords: ["secret", "encryption", "mask", "rotation", "token", "credentials"],
      relatedPages: ["monitors/authenticated-monitoring"],
    },
    body: [
      p("Fajita stores the secrets a monitor or channel needs, and protects them."),
      ul([
        "Supported secrets (monitor auth headers, webhook signing secrets, chat webhook URLs) are encrypted at rest.",
        "After saving, values are masked; you can replace but not read them.",
        "Rotating a secret replaces the stored value for the next operation.",
        "Removing a channel or monitor removes its secret.",
      ]),
      callout("security", [
        p("Do not place secrets inside monitor names, public component names, incident titles, or public status updates."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...security,
      slug: "security/webhook-security",
      title: "Webhook security",
      description: "How outbound webhook signing and destination restrictions keep deliveries safe.",
      model: "learn",
      pageType: "concept",
      order: 3,
      productArea: ["security", "webhooks"],
      keywords: ["webhook security", "signing", "verify", "destination", "https"],
      relatedPages: ["webhooks/signatures"],
    },
    body: [
      p("Outbound webhooks are protected on both ends of delivery."),
      ul([
        "Destinations must be public HTTPS endpoints; private targets are blocked.",
        "Each request can be signed with HMAC-SHA256 so you can verify it.",
        "The signed input includes a timestamp so you can reject replays.",
      ]),
      p("Verify signatures on your side: [Verify webhook signatures](/docs/webhooks/signatures)."),
    ],
  }),

  defineDoc({
    meta: {
      ...security,
      slug: "security/responsible-disclosure",
      title: "Responsible disclosure",
      description: "How to report a security issue to Fajita and what to expect.",
      model: "learn",
      pageType: "policy",
      order: 4,
      productArea: ["security"],
      keywords: ["disclosure", "vulnerability", "report", "security contact", "bug"],
      relatedPages: ["account/contact-support"],
    },
    body: [
      p("If you believe you have found a security issue, we want to hear from you."),
      h2("Scope"),
      ul([
        "The Fajita application, status pages, and public site.",
        "Do not test against other customers' data or perform destructive testing.",
      ]),
      h2("How to report"),
      p("Send a report through the security topic on [Contact support](/docs/account/contact-support). Include steps to reproduce and avoid sharing others' data."),
      callout("note", [
        p("Fajita does not currently advertise a paid bug bounty. Safe-harbor terms are subject to counsel review."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...privacy,
      slug: "privacy/data-collected",
      title: "Data Fajita collects",
      description: "The categories of data Fajita processes to run monitoring, alerts, and status pages.",
      model: "learn",
      pageType: "policy",
      order: 0,
      productArea: ["privacy"],
      keywords: ["privacy", "data", "collected", "retention", "personal data"],
      relatedPages: ["privacy/status-page-subscribers", "account/export", "account/deletion"],
    },
    body: [
      p("This page explains what data the product processes. For contractual terms, see the privacy policy linked from the site footer."),
      table(
        ["Category", "Examples"],
        [
          ["Account", "Your identity and organization membership"],
          ["Monitor configuration", "URLs, intervals, assertions, and encrypted secrets"],
          ["Check results", "Status, timing, and outcome of each check"],
          ["Incident data", "Timelines, notes, and public updates"],
          ["Alert destinations", "Channel configuration and delivery history"],
          ["Status-page content", "Components and public updates"],
          ["Subscriber data", "Confirmed subscriber addresses and preferences"],
          ["Billing data", "Subscription and invoice records held by the payment provider"],
        ],
      ),
      callout("note", [
        p("Documentation explains product behavior. The privacy policy defines the contractual terms. They are separate documents on purpose."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...privacy,
      slug: "privacy/status-page-subscribers",
      title: "Subscriber privacy",
      description: "Your responsibilities for subscriber consent and how Fajita handles subscriber data.",
      model: "learn",
      pageType: "policy",
      order: 1,
      productArea: ["privacy", "subscribers"],
      keywords: ["subscriber", "consent", "privacy", "unsubscribe", "delete"],
      relatedPages: ["subscribers/double-opt-in"],
    },
    body: [
      p("Subscribers trust you with their address to receive operational updates."),
      ul([
        "Only subscribe addresses with consent, confirmed through double opt-in.",
        "Subscribers can unsubscribe or request deletion at any time.",
        "Suppressed addresses (bounces, complaints) stop receiving mail.",
      ]),
      callout("warning", [
        p("Do not repurpose subscriber addresses for marketing without separate consent."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...account,
      slug: "account/export",
      title: "Export your data",
      description: "What a data export includes and excludes, and how it is delivered securely.",
      model: "operate",
      pageType: "task",
      order: 0,
      requiredPermission: "export:request",
      productArea: ["privacy"],
      keywords: ["export", "download", "data portability", "backup"],
      relatedPages: ["account/deletion"],
    },
    body: [
      h2("Outcome"),
      p("You receive an export of your organization's data."),
      h2("What is included"),
      ul([
        "Monitor configuration (without secret values), check history, and incidents.",
        "Alert channel configuration and delivery history.",
        "Status-page content and confirmed subscriber records.",
        "Billing records.",
      ]),
      h2("What is excluded"),
      callout("security", [
        p("Secret values may be omitted or represented as redacted configuration for security. An export is not a way to read back a stored secret."),
      ]),
      h2("Delivery"),
      p("An export takes time to generate, is delivered over a secure download, and expires after a period."),
    ],
  }),

  defineDoc({
    meta: {
      ...account,
      slug: "account/deletion",
      title: "Delete your account or organization",
      description: "How deletion works, what is removed, and which records are retained for legal reasons.",
      model: "operate",
      pageType: "policy",
      order: 1,
      requiredPermission: "org:delete",
      requiredRole: "owner",
      productArea: ["privacy"],
      keywords: ["delete", "close account", "remove organization", "retention", "irreversible"],
      relatedPages: ["account/export", "billing/payment-failures"],
    },
    body: [
      p("Deletion is permanent. Export first if you want a copy."),
      h2("What happens"),
      ul([
        "An active subscription must be canceled before an organization is deleted.",
        "Monitors, incidents, status pages, and subscriber data are removed.",
        "Public status pages and custom-domain routing are taken down.",
      ]),
      h2("Retention"),
      callout("note", [
        p("Some billing and financial records are retained where the law requires it. Deletion is not always immediate because some removal runs in the background."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...account,
      slug: "account/contact-support",
      title: "Contact support",
      description: "What to include when contacting support, and what to keep out of a support message.",
      model: "operate",
      pageType: "task",
      order: 2,
      productArea: ["account"],
      keywords: ["support", "contact", "help", "escalate", "security report", "billing"],
      relatedPages: ["security/responsible-disclosure"],
    },
    body: [
      h2("What to include"),
      ul([
        "A clear description of what you expected and what happened.",
        "The relevant monitor or incident reference.",
        "Steps to reproduce, where relevant.",
      ]),
      h2("What to leave out"),
      callout("security", [
        p("Never send API keys, passwords, full webhook URLs, or heartbeat tokens in a support message. Redact secrets before sharing diagnostics."),
      ]),
      h2("Where to reach us"),
      p("Use the contact form on the site. Choose the security topic for vulnerability reports and the billing topic for invoice questions."),
    ],
  }),
];
