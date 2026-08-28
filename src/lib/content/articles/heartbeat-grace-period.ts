import { h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const heartbeatGracePeriod = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-heartbeat-grace-period",
    contentType: "article",
    slug: "how-to-choose-a-heartbeat-grace-period",
    title: "How to Choose a Heartbeat Grace Period",
    description:
      "Grace period is the allowed lateness before a missed heartbeat becomes an incident. Size it for runtime variance, not best-case job duration.",
    articleType: "technical-tutorial",
    category: "cron-scheduled-jobs",
    topicCluster: "cron-heartbeat",
    primaryQuery: "heartbeat monitoring grace period",
    secondaryQueries: [
      "cron job grace period monitoring",
      "heartbeat late vs missed",
    ],
    searchIntent: "how-to",
    audience: "Teams monitoring scheduled jobs with heartbeat URLs",
    funnelStage: "education",
    readingMinutes: 8,
    thesis:
      "Grace period should cover normal runtime jitter plus the next scheduled slot. Too short pages on slow runs. Too long hides silent failures for hours.",
    originalContribution:
      "Grace period sizing table keyed to schedule frequency and p95 job runtime.",
    relatedContent: ["heartbeat-monitoring-for-cron-jobs"],
    relatedDocs: [
      { href: "/docs/monitors/heartbeat-monitoring", label: "Heartbeat monitoring" },
    ],
    relatedGlossary: ["heartbeat-monitoring", "grace-period", "cron-job"],
    relatedTools: ["cron-expression-explainer"],
    relatedComparisons: [],
    productCta: "create-heartbeat",
  },
  body: [
    p(
      "Heartbeat monitoring expects a ping when a job finishes. Grace period is how long the monitor waits after the expected time before declaring a miss. Picking that window is the difference between catching silent failures and paging because a backup took longer than usual.",
    ),

    h2("Start from schedule plus runtime"),
    p(
      "Note the cron schedule and the ninety-fifth percentile runtime from the last thirty days. Grace period should exceed typical runtime variance but stay shorter than the gap until the next run matters for your business.",
    ),
    table(
      ["Job pattern", "Starting grace period"],
      [
        ["Hourly sync under five minutes", "15 to 20 minutes"],
        ["Nightly batch up to two hours", "3 to 4 hours"],
        ["Weekly report", "6 to 12 hours after expected finish"],
      ],
    ),

    h2("Late versus missed"),
    ul([
      "Late: job still running, heartbeat may arrive after grace if you set it too tight",
      "Missed: job never started or crashed before calling the heartbeat URL",
      "Extend grace when jobs legitimately queue behind upstream data",
      "Shorten grace when missing two consecutive runs causes customer impact",
    ]),

    h2("Tune with production history"),
    ol([
      "Deploy heartbeat with a generous grace period first",
      "Review late alerts for false positives over two weeks",
      "Tighten only when you understand longest normal runtime",
      "Document owner and runbook link in the monitor name",
    ]),
    p(
      "If jobs are supposed to run daily but only matter during business hours, consider pausing monitors outside that window instead of stretching grace across entire weekends.",
    ),
    p(
      "Heartbeat URLs are secrets. Rotate them if leaked and never log the full URL in application logs. Security and reliability both depend on treating the ping endpoint like a credential.",
    ),
    p(
      "Name monitors after the job they protect, not the server they run on. When grace period alerts fire, the on-call engineer should instantly know which business process is at risk.",
    ),
  ],
});
