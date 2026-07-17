import { callout, h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/**
 * Original contribution: the "Four Signals, One Channel, One Page" stack
 * for solo SaaS founders.
 */
export const minimumReliabilityStack = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-minimum-reliability-stack",
    contentType: "article",
    slug: "minimum-reliability-stack-solo-saas",
    title: "The Minimum Reliability Stack for a Solo SaaS Founder",
    description:
      "Four monitors, one alert channel, and one status page. The smallest reliability stack that still protects a solo SaaS before customers notice first.",
    articleType: "founder-operations",
    category: "founder-operations",
    topicCluster: "small-team-reliability",
    primaryQuery: "minimum monitoring stack solo saas founder",
    secondaryQueries: [
      "what to monitor before launch",
      "first monitors for saas",
      "solo founder uptime monitoring",
    ],
    searchIntent: "how-to",
    audience: "Solo SaaS founders and tiny founding teams",
    funnelStage: "activation",
    readingMinutes: 9,
    thesis:
      "A solo founder does not need a full observability suite. You need four external signals, one reliable alert path, and a status page you can update under pressure. This article defines that stack and the order to build it.",
    deepGuide: true,
    featured: true,
    originalContribution:
      "Four Signals, One Channel, One Page: a named minimum stack with an explicit build order and a no-agent constraint for solo founders.",
    relatedContent: [
      "monitor-api-without-alert-noise",
      "what-belongs-on-status-page",
      "heartbeat-monitoring-for-cron-jobs",
      "why-one-failed-check-is-not-downtime",
    ],
    relatedDocs: [
      {
        href: "/docs/getting-started/create-your-first-monitor",
        label: "Create your first monitor",
      },
      {
        href: "/docs/getting-started/connect-an-alert-channel",
        label: "Connect an alert channel",
      },
      {
        href: "/docs/getting-started/publish-a-status-page",
        label: "Publish a status page",
      },
    ],
    relatedGlossary: [
      "uptime-monitoring",
      "heartbeat-monitoring",
      "status-page",
      "alert-routing",
    ],
    relatedTools: ["uptime-calculator", "status-page-checklist"],
    relatedComparisons: ["uptime-monitoring-tools-solo-saas"],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "You do not need fifty dashboards before you ship. You need to know when the product is unreachable, when a critical API path fails, when a certificate is about to expire, and when a scheduled job stops checking in. Then you need one place alerts go, and one place customers can look when something is wrong.",
    ),
    p(
      "This guide assumes a solo founder or a two-person team, one production app, and no on-call rotation. It also assumes you will not install agents or build a log pipeline on day one. The stack below is the minimum that still protects reputation.",
    ),

    h2("The Four Signals, One Channel, One Page stack"),
    p(
      "Name the stack so you can refuse extras until these pieces exist:",
    ),
    ol([
      "Four external signals: website or app URL, primary API health path, SSL certificate, and one heartbeat for the job that hurts most when it fails silently.",
      "One alert channel you actually see (email is enough at first; Slack or Discord when the team grows).",
      "One public status page with a small set of components you can update without drafting a novel.",
    ]),
    p(
      "If a tool asks you to install host agents, adopt a full application-performance suite, or configure twenty integrations before the first useful alert, refuse it. That is not the minimum stack.",
    ),

    h2("Signal 1: The customer-facing URL"),
    p(
      "Monitor the URL customers type or click. Prefer HTTPS. Check on a short interval after launch (one or five minutes is common), and require a successful status code plus a simple body assertion if the homepage can return 200 while the app is broken.",
    ),
    p(
      "Do not treat this monitor as proof that every feature works. It answers a narrower question: can a stranger reach the front door?",
    ),

    h2("Signal 2: The primary API health path"),
    p(
      "Add a dedicated health endpoint that returns a clear success shape when dependencies you care about are reachable. Monitor that path separately from marketing pages. See [How to Design a Safe API Health Endpoint](/blog/safe-api-health-endpoint) and the [health endpoint](/glossary/health-endpoint) definition.",
    ),
    callout("tip", [
      p(
        "If your only monitor hits the marketing homepage, you can miss an API outage that breaks checkout while the brochure site stays up.",
      ),
    ]),

    h2("Signal 3: SSL certificate expiration"),
    p(
      "Certificate failures look like total outages to users. Alert early enough that you can renew during business hours. Thirty days is a common warning window for small teams; adjust if your renewal process is manual and slow. See [SSL certificate monitoring](/glossary/ssl-certificate-monitoring).",
    ),

    h2("Signal 4: One heartbeat for the silent job"),
    p(
      "Pick the scheduled task whose failure you would learn about last: backups, invoice generation, digest email, or a sync. Have the job ping a heartbeat URL when it finishes successfully. If the ping stops, you investigate. Details live in [Heartbeat Monitoring for Cron Jobs](/blog/heartbeat-monitoring-for-cron-jobs).",
    ),

    h2("One alert channel"),
    p(
      "Start with email to an address you check. Add Slack or Discord when more than one person needs the page. Configure quiet hours only after the first real overnight false alarm teaches you what noise feels like. Routing rules can wait until you have more than a handful of monitors."),
    p(
      "Product steps: [Connect an alert channel](/docs/getting-started/connect-an-alert-channel).",
    ),

    h2("One status page"),
    p(
      "Publish before the first public incident. Name components after customer-visible systems, not internal service names. Keep the component list short. When something breaks, update the page before you write a long postmortem. Use [What Should Go on a Public Status Page?](/blog/what-belongs-on-status-page) and the [status-page readiness checklist](/tools/status-page-checklist).",
    ),

    h2("Build order for the first week"),
    table(
      ["Day", "Action", "Done when"],
      [
        ["0", "Create website or app URL monitor and run a test before save", "First successful check recorded"],
        ["0", "Add API health monitor", "Health path returns expected status"],
        ["1", "Add SSL monitor", "Expiration date visible and warning window set"],
        ["1", "Wire email alerts", "Test notification received"],
        ["2", "Add one heartbeat for the critical job", "Missed ping creates a clear alert"],
        ["3", "Publish a status page with three components or fewer", "Public URL loads and components named"],
      ],
    ),

    h2("What to refuse until later"),
    ul([
      "Multiple regions before you have confirmed false-positive handling",
      "Webhook fan-out to five tools",
      "Public response-time charts you do not intend to explain",
      "Complex severity taxonomies for a one-person on-call",
      "Anything that requires agents or host instrumentation for basic uptime",
    ]),

    h2("How much is enough?"),
    p(
      "For a solo SaaS, enough means you learn about customer-visible failure from your monitors before Twitter, email support, or a refund request. Use the [uptime calculator](/tools/uptime-calculator) to translate a target percentage into minutes you can afford to lose, then decide whether your check interval and verification steps match that budget.",
    ),
    p(
      "When you outgrow this stack, add monitors for secondary APIs, more heartbeats, and richer routing. Do not skip the four signals to chase dashboards.",
    ),

    h2("Putting it into practice"),
    p(
      "Create the four monitors, confirm each test before activation, connect one alert path, and publish a status page you can update in under two minutes. That is the minimum reliability stack. Everything else is optional until those pieces are boringly reliable.",
    ),
  ],
});
