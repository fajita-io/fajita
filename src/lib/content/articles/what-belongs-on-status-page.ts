import { h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/** Original contribution: the Customer-Visible Component Rule. */
export const whatBelongsOnStatusPage = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-what-belongs-on-status-page",
    contentType: "article",
    slug: "what-belongs-on-status-page",
    title: "What Should Go on a Public Status Page?",
    description:
      "Use the Customer-Visible Component Rule. Show what customers feel, hide internal plumbing, and keep maintenance honest.",
    articleType: "definitive-guide",
    category: "status-pages",
    topicCluster: "status-pages",
    primaryQuery: "what should go on a status page",
    secondaryQueries: [
      "status page components",
      "public status page checklist",
      "status page best practices small team",
    ],
    searchIntent: "learn",
    audience: "Founders and support leads",
    funnelStage: "education",
    readingMinutes: 8,
    thesis:
      "A status page earns trust when it shows customer-visible systems, current state, active incidents, maintenance, and a way to get updates. Internal service names and vanity metrics usually do not belong.",
    featured: true,
    originalContribution:
      "Customer-Visible Component Rule: if a customer cannot name the impact in their own words, it is not a public component.",
    relatedContent: [
      "write-useful-incident-update",
      "minimum-reliability-stack-solo-saas",
    ],
    relatedDocs: [
      { href: "/docs/status-pages/create", label: "Create a status page" },
      { href: "/docs/status-pages/components", label: "Components" },
      { href: "/docs/maintenance/create", label: "Maintenance" },
    ],
    relatedGlossary: [
      "status-page",
      "status-page-component",
      "scheduled-maintenance",
      "status-page-subscriber",
    ],
    relatedTools: ["status-page-checklist"],
    relatedComparisons: ["status-page-tools-small-teams"],
    productCta: "publish-status-page",
  },
  body: [
    p(
      "A public status page should answer three questions quickly: is anything wrong, what is affected, and when will you speak again. Everything else is optional. This guide defines what belongs, what does not, and a simple rule for naming components.",
    ),

    h2("The Customer-Visible Component Rule"),
    p(
      "If a customer cannot name the impact in their own words, it is not a public component. \"Checkout,\" \"API,\" \"Dashboard,\" and \"Status notifications\" pass the test. \"redis-prod-3\" and \"worker-pool-b\" fail it.",
    ),

    h2("What belongs on the page"),
    ol([
      "Current overall state in plain language",
      "A short list of customer-visible components",
      "Active incidents with timestamps and updates",
      "Scheduled maintenance with start and end windows",
      "Recent history so visitors can see patterns",
      "A subscribe path with verified email preferences when you offer one",
    ]),

    h2("What usually does not belong"),
    ul([
      "Internal hostnames and ticket ids",
      "Raw response-time charts you will not explain during an outage",
      "Marketing claims or pricing CTAs above the fold",
      "Fake uptime precision that your check interval cannot support",
      "Every microservice in the company",
    ]),

    h2("Naming components"),
    table(
      ["Weak name", "Stronger name", "Why"],
      [
        ["Backend", "API", "Customers call it the API"],
        ["Frontend", "Web app", "Matches how users navigate"],
        ["Jobs", "Report generation", "Names the outcome"],
        ["Email", "Notification delivery", "Scope is clearer"],
      ],
    ),

    h2("Maintenance without surprise"),
    p(
      "Publish maintenance before it starts. State customer impact honestly. If a window slips, update the page. Silence during a planned window looks like an unplanned outage. See [scheduled maintenance](/glossary/scheduled-maintenance) and [Create maintenance](/docs/maintenance/create).",
    ),

    h2("Subscribers"),
    p(
      "If you offer email updates, use double opt-in and preference controls. Do not surprise people with marketing. Product details: [Double opt-in](/docs/subscribers/double-opt-in).",
    ),

    h2("Readiness check"),
    p(
      "Before you call the page ready, walk the [status-page readiness checklist](/tools/status-page-checklist). Ownership, components, monitor mapping, incident process, and a test publish matter more than theme polish.",
    ),

    h2("History and honesty"),
    p(
      "Show enough history that a customer can see whether today’s incident is rare. Do not invent decimal places your monitors cannot support. If you exclude maintenance from uptime math, say so near the number. Related: [How to Calculate Uptime Correctly](/blog/how-to-calculate-uptime-correctly).",
    ),

    h2("Keep it current"),
    p(
      "A stale green page during a known outage is worse than no page. Assign who updates it, practice one drill, and link incident writing guidance from [How to Write a Useful Incident Update](/blog/write-useful-incident-update).",
    ),
    p(
      "If nobody owns the page, it will rot. Ownership is a component of the product experience, even if customers never see the owner’s name.",
    ),
  ],
});
