import { h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const howOftenCheckWebsite = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-how-often-check-website",
    contentType: "article",
    slug: "how-often-should-you-check-a-website",
    title: "How Often Should You Check a Website?",
    description:
      "Pick a website check interval that matches customer pain, not anxiety. Balance detect speed, false positives, and check budget.",
    articleType: "technical-tutorial",
    category: "monitoring",
    topicCluster: "uptime-monitoring",
    primaryQuery: "how often should you check a website",
    secondaryQueries: [
      "website monitoring interval",
      "monitoring check frequency",
      "uptime check every minute",
    ],
    searchIntent: "how-to",
    audience: "Founders choosing their first monitor interval",
    funnelStage: "education",
    readingMinutes: 8,
    thesis:
      "The right interval is the slowest schedule that still catches outages before customers complain. One minute is not always better. Match interval to how fast failure hurts and how much confirmation you use.",
    originalContribution:
      "Interval selection framework: customer pain speed, confirmation multiplier, and check budget in one decision.",
    relatedContent: [
      "why-one-failed-check-is-not-downtime",
      "how-to-calculate-uptime-correctly",
    ],
    relatedDocs: [
      { href: "/docs/monitors/website-monitoring", label: "Website monitoring" },
      { href: "/docs/monitors/retries", label: "Retries" },
    ],
    relatedGlossary: ["monitoring-interval", "retry", "uptime-monitoring"],
    relatedTools: ["uptime-calculator"],
    relatedComparisons: [],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "Check interval is a product decision disguised as a monitoring setting. Faster checks detect outages sooner. They also multiply false positives, burn check budget, and tempt you to page on noise. The goal is not the shortest interval. The goal is the slowest interval that still protects customers.",
    ),

    h2("Start from customer pain speed"),
    p(
      "Ask how long a total outage can run before someone emails support or posts on social. If the answer is five minutes, a fifteen minute interval is too slow unless you confirm failures quickly. If the answer is thirty minutes, aggressive one minute checks may be wasted spend.",
    ),
    ul([
      "Marketing site for a small SaaS: five minute interval is often enough",
      "Login or checkout path: one to two minutes with confirmation",
      "Internal admin tools: five to fifteen minutes unless revenue depends on them",
      "Status page itself: one to five minutes so the page reflects reality",
    ]),

    h2("Factor in confirmation"),
    p(
      "Fajita verifies failures before opening incidents. That means your effective detect delay is interval times confirmation count, not interval alone. A five minute monitor that confirms after two failures can still catch many outages within ten minutes while ignoring single blips.",
    ),
    table(
      ["Interval", "Confirm after 2 failures", "Approx worst-case detect"],
      [
        ["1 minute", "2 checks", "2 minutes"],
        ["5 minutes", "2 checks", "10 minutes"],
        ["15 minutes", "2 checks", "30 minutes"],
      ],
    ),

    h2("Watch check budget"),
    p(
      "Every completed check counts toward your monthly allowance. Ten monitors at one minute intervals consume roughly 430,000 checks per month before retries. The same ten monitors at five minute intervals consume roughly 86,000. Interval choice directly affects plan fit.",
    ),

    h2("Recommended defaults"),
    ol([
      "Public marketing site: five minutes, confirm before alert",
      "Authentication or billing API: one to two minutes with JSON assertions",
      "Background cron work: heartbeat URL with grace period instead of polling the job",
      "Staging environments: fifteen minutes or paused unless you actively test",
    ]),
    p(
      "Revisit intervals after your first real incident. If customers noticed before monitors, tighten the schedule or add a second probe from another angle. If you only alert on confirmed failures and still get noise, slow down before you mute channels.",
    ),
  ],
});
