import { h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const nameStatusPageComponents = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-name-status-components",
    contentType: "article",
    slug: "how-to-name-status-page-components",
    title: "How to Name Status-Page Components",
    description:
      "Name status page components the way customers think about your product. Clear groupings reduce support tickets during incidents.",
    articleType: "technical-tutorial",
    category: "status-pages",
    topicCluster: "status-pages",
    primaryQuery: "how to name status page components",
    secondaryQueries: [
      "status page component names",
      "status page structure",
    ],
    searchIntent: "how-to",
    audience: "Teams publishing their first customer-facing status page",
    funnelStage: "education",
    readingMinutes: 7,
    thesis:
      "Component names should match customer workflows, not your microservice map. Three to seven components stay readable on mobile and during stress.",
    originalContribution:
      "Customer-language naming table mapping internal services to status page labels.",
    relatedContent: ["what-belongs-on-status-page"],
    relatedDocs: [{ href: "/docs/status-pages/create", label: "Create a status page" }],
    relatedGlossary: ["status-page-component", "status-page"],
    relatedTools: ["status-page-checklist"],
    relatedComparisons: [],
    productCta: "publish-status-page",
  },
  body: [
    p(
      "Status page components tell customers which slice of your product is impaired. Names that mirror internal codenames force customers to translate during an outage. Names that mirror how people describe your product let them self-serve in seconds.",
    ),

    h2("Use customer language"),
    p(
      "Prefer labels customers already use in support tickets: Login, Dashboard, Billing, API, notifications. Avoid names like `svc-payments-worker` unless your audience is exclusively developers integrating with that service.",
    ),
    table(
      ["Internal name", "Customer-facing name"],
      [
        ["auth-gateway", "Login and signup"],
        ["report-export-queue", "CSV exports"],
        ["stripe-webhook-ingest", "Billing and subscriptions"],
      ],
    ),

    h2("Keep the list short"),
    ul([
      "Three to seven components cover most SaaS products",
      "Split only when failures can be isolated in practice",
      "Merge components that always fail together",
      "Add a catch-all only if it genuinely helps, not as a junk drawer",
    ]),

    h2("Order by customer impact"),
    ol([
      "List revenue or login paths first",
      "Group secondary features below",
      "Put internal or admin-only systems on a separate internal page if needed",
    ]),

    h2("Review names after real incidents"),
    p(
      "If support still asks which component is down, your names are too vague or too granular. Update labels when you rename product areas. A status page that matches marketing language ages better than one copied from an architecture diagram.",
    ),
    p(
      "Run a fifteen minute review with someone from support after your first public incident. Ask which component names confused customers. Rename before the next outage rather than defending jargon because engineering prefers it.",
    ),

    h2("Examples that work on small SaaS products"),
    ul([
      "Login and signup instead of auth-service",
      "Billing and invoices instead of payments-worker",
      "File uploads instead of object-storage-gateway",
      "Email delivery instead of notification-queue",
    ]),
    p(
      "Each label should answer which customer workflow is affected. If a friend who uses your product would not recognize the name, pick a simpler one.",
    ),
  ],
});
