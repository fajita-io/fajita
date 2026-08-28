import { h2, p, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";

/** Launch announcement: Fajita core published under AGPL-3.0. */
export const fajitaIsNowOpenSource = defineArticle({
  meta: {
    id: "article-fajita-open-source-launch",
    contentType: "article",
    slug: "fajita-is-now-open-source",
    title: "Fajita is now open source",
    description:
      "The Fajita uptime monitoring core is now open source under AGPL-3.0. Self-host the verification engine or use Fajita Cloud for managed operation.",
    articleType: "product-update",
    category: "founder-operations",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita open source",
    secondaryQueries: [
      "fajita self host",
      "agpl uptime monitoring",
      "open source status page",
    ],
    searchIntent: "learn",
    audience: "Developers evaluating self-hosted or open-source monitoring",
    funnelStage: "awareness",
    readingMinutes: 4,
    thesis:
      "Fajita published its core under AGPL-3.0 so operators can inspect verification logic, self-host the same engine, or keep using Fajita Cloud for managed infrastructure.",
    featured: true,
    originalContribution:
      "Clear boundary between self-hosted AGPL core and Fajita Cloud managed service without treating OSS as a demo tier.",
    relatedContent: [
      "why-one-failed-check-is-not-downtime",
      "minimum-reliability-stack-solo-saas",
    ],
    relatedDocs: [
      { href: "/docs/self-hosting/quickstart", label: "Self-hosting quickstart" },
      { href: "/docs/open-source/architecture", label: "Open-source architecture" },
      { href: "/docs/open-source/license", label: "License" },
    ],
    relatedGlossary: ["incident-verification", "uptime-monitoring"],
    relatedTools: [],
    relatedComparisons: ["uptime-kuma", "openstatus"],
    productCta: "compare-plans",
    status: "published",
    author: "fajita-editorial",
    owner: "product",
    reviewers: ["product", "engineering", "editorial"],
    publishedAt: "2026-08-26",
    updatedAt: "2026-08-26",
    lastReviewedAt: "2026-08-26",
    nextReviewDue: "2027-02-26",
    contentVersion: "1",
    productVersion: "0.1.0",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    securityReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    indexable: true,
    canonical: true,
    llmInclude: true,
    requiresProductReview: true,
    requiresSecurityReview: false,
    requiresLegalReview: false,
  },
  body: [
    p(
      "We built Fajita as a hosted uptime monitor for small software teams. Today we are publishing the core under AGPL-3.0.",
    ),
    p(
      "You can inspect how Fajita verifies failures, self-host the same engine we run in production, or keep using [Fajita Cloud](/signup) when you would rather not operate workers and databases yourself.",
    ),

    h2("Why we open-sourced it"),
    p(
      "Monitoring software tells you when something is wrong. You should be able to see how it decides that.",
    ),
    p(
      "Fajita already focused on clear incident behavior and verification before alerts. Open source is the honest extension of that: same product story, inspectable code.",
    ),

    h2("What is included"),
    ul([
      "Website, API, SSL, and heartbeat monitoring",
      "Failure verification before incidents and alerts",
      "Incidents, maintenance, and public status pages",
      "Slack, Discord, webhooks, and email (SMTP or Resend)",
      "Docker Compose self-hosting path",
    ]),

    h2("Self-host or Cloud"),
    p(
      "Self-hosted Fajita is not a demo tier. Cloud is not obsolete. Cloud sells operational convenience: managed workers, upgrades, backups, and notifications.",
    ),
    p(
      "Run it yourself: [Self-hosting guide](/self-host). Source: [GitHub](https://github.com/fajita-io/fajita). Managed option: [Fajita Cloud](/signup).",
    ),

    h2("Verification still matters"),
    p(
      "Most uptime tools alert on the first failed ping. Fajita re-checks before escalating. Open source does not change that behavior. It makes it reviewable.",
    ),
    p(
      "That matters when you are choosing what wakes someone up at 2 a.m. You can read the verification path in the repository, run it locally, and decide whether the thresholds match your tolerance for blips versus real outages.",
    ),

    h2("How to get started"),
    p(
      "Clone the repository, copy `.env.example`, and bring up Docker Compose. You will need your own Clerk application for authentication. The [self-hosting quickstart](/docs/self-hosting/quickstart) walks through the full path from empty machine to first monitor.",
    ),
    p(
      "If you prefer not to run PostgreSQL, workers, and upgrades yourself, [Fajita Cloud](/signup) is the managed option. Same verification engine. We operate the infrastructure.",
    ),

    h2("Contributing"),
    p(
      "Found a bug or have an idea? Open an issue on GitHub. Want to contribute code? Start with a good first issue. We review external PRs for correctness, security, and maintainability. Open source does not mean design-by-committee.",
    ),
    p(
      "If you want to follow development, star the repository. If you want it running without operating it, start with Cloud.",
    ),
  ],
});
