import { h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/** Original contribution: Blip Budget thinking for confirmation thresholds. */
export const whyOneFailedCheck = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-why-one-failed-check",
    contentType: "article",
    slug: "why-one-failed-check-is-not-downtime",
    title: "Why One Failed Check Should Not Mean Downtime",
    description:
      "One failed probe is a blip until confirmed. Learn Blip Budget thinking, verification, and when a single failure should still page you.",
    articleType: "troubleshooting",
    category: "monitoring",
    topicCluster: "uptime-monitoring",
    primaryQuery: "one failed check not downtime",
    secondaryQueries: [
      "uptime false positives",
      "confirm failure before alert",
      "monitoring flapping",
    ],
    searchIntent: "troubleshoot",
    audience: "Operators tired of false-positive alerts",
    funnelStage: "education",
    readingMinutes: 7,
    thesis:
      "A single failed check is evidence of a problem with that probe, not proof customers are down. Confirmation turns blips into incidents. This article explains when to wait and when to page immediately.",
    featured: false,
    originalContribution:
      "Blip Budget: how many consecutive failures your check interval and customer tolerance can absorb before confirmation must open an incident.",
    relatedContent: [
      "monitor-api-without-alert-noise",
      "how-to-calculate-uptime-correctly",
    ],
    relatedDocs: [
      { href: "/docs/incidents/verification", label: "Incident verification" },
      { href: "/docs/monitors/retries", label: "Retries" },
      { href: "/docs/monitors/monitor-states", label: "Monitor states" },
    ],
    relatedGlossary: [
      "retry",
      "incident-verification",
      "monitoring-interval",
      "downtime",
    ],
    relatedTools: ["uptime-calculator"],
    relatedComparisons: [],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "A single failed check is evidence that one probe did not get the response it expected. It is not automatically proof that customers are down. Networks drop packets. Deploys restart processes. DNS caches go weird for a moment. Confirmation exists so those blips do not become public incidents.",
    ),

    h2("What one failure can mean"),
    ul([
      "A real outage just started",
      "A transient network error between checker and target",
      "A brief deploy or restart",
      "A checker-side timeout that customers did not feel",
      "An assertion that is too strict for a rare but valid response",
    ]),
    p(
      "You cannot tell which one from a single sample. That is why [incident verification](/glossary/incident-verification) exists.",
    ),

    h2("Blip Budget"),
    p(
      "Your Blip Budget is how many consecutive failed checks you can afford before the uncertainty costs more than the noise. It depends on check interval and how fast customers feel pain.",
    ),
    table(
      ["Interval", "Confirm after", "Worst-case detect delay (approx)"],
      [
        ["1 minute", "2 to 3 failures", "2 to 3 minutes"],
        ["5 minutes", "2 failures", "10 minutes"],
        ["15 minutes", "2 failures", "30 minutes"],
      ],
    ),
    p(
      "Long intervals with high confirmation counts hide real outages. Short intervals with zero confirmation create alert fatigue. Pick both together.",
    ),

    h2("A sensible default sequence"),
    ol([
      "Probe fails.",
      "Retry once quickly if your monitor supports it.",
      "Enter a verifying state rather than paging immediately.",
      "Open an incident after consecutive confirmations.",
      "Require consecutive successes before auto-recovery.",
    ]),
    p(
      "Product references: [Incident verification](/docs/incidents/verification), [Monitor states](/docs/monitors/monitor-states).",
    ),

    h2("When one failure should still page"),
    ul([
      "You are validating a brand-new monitor and want to learn quickly (temporary)",
      "The path is so critical that even brief uncertainty is unacceptable and humans accept the noise",
      "You have independent confirmation from another system in the same minute",
    ]),
    p(
      "Those cases are exceptions. Document them so the rest of the system can stay calm.",
    ),

    h2("Flapping"),
    p(
      "If a monitor oscillates between success and failure, confirmation alone is not enough. Fix the assertion, the timeout, or the underlying instability. Muting forever hides a real reliability problem.",
    ),

    h2("Customer reports versus probes"),
    p(
      "Sometimes customers feel pain before monitors confirm. Believe them enough to investigate, even if the public component stays in verifying. Confirmation protects against false pages. It is not permission to gaslight a queue of support tickets.",
    ),

    h2("Tie it back to uptime math"),
    p(
      "How you treat unverified failures changes published uptime. Decide whether only confirmed downtime counts. Then keep that rule next to any percentage you show. See [How to Calculate Uptime Correctly](/blog/how-to-calculate-uptime-correctly).",
    ),
    p(
      "For API paths, combine this with the Confirm Ladder in [How to Monitor an API Without Creating Alert Noise](/blog/monitor-api-without-alert-noise).",
    ),
  ],
});
