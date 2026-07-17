import { callout, code, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/** Original contribution: Late vs Missed vs Silent Success framing. */
export const heartbeatMonitoring = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-heartbeat-monitoring",
    contentType: "article",
    slug: "heartbeat-monitoring-for-cron-jobs",
    title: "Heartbeat Monitoring for Cron Jobs and Scheduled Tasks",
    description:
      "Heartbeats catch jobs that never run. Learn grace periods, late versus missed pings, and how to secure heartbeat URLs without agents.",
    articleType: "definitive-guide",
    category: "cron-scheduled-jobs",
    topicCluster: "cron-heartbeat",
    primaryQuery: "heartbeat monitoring cron jobs",
    secondaryQueries: [
      "cron job monitoring",
      "dead man switch cron",
      "heartbeat grace period",
    ],
    searchIntent: "how-to",
    audience: "Founders and engineers running scheduled jobs",
    funnelStage: "education",
    readingMinutes: 9,
    thesis:
      "A cron expression tells you when a job should run. A heartbeat tells you whether it actually ran. This guide covers grace periods, late versus missed jobs, and URL security without installing an agent.",
    deepGuide: true,
    featured: true,
    originalContribution:
      "Late vs Missed vs Silent Success: a three-way framing for heartbeat outcomes, plus grace-period selection guidance for small teams.",
    relatedContent: [
      "minimum-reliability-stack-solo-saas",
      "monitor-api-without-alert-noise",
    ],
    relatedDocs: [
      { href: "/docs/monitors/heartbeat-monitoring", label: "Heartbeat monitoring" },
    ],
    relatedGlossary: [
      "heartbeat-monitoring",
      "grace-period",
      "missed-heartbeat",
      "late-heartbeat",
      "cron-job",
    ],
    relatedTools: ["cron-expression-explainer"],
    relatedComparisons: [],
    productCta: "create-heartbeat",
    author: "fajita-engineering",
  },
  body: [
    p(
      "A cron expression tells you when a job should run. A heartbeat tells you whether it actually ran. Heartbeat monitoring expects a periodic ping from the job. When the ping stops, you investigate. No agent required on the host beyond the HTTP request your job already knows how to make.",
    ),

    h2("How a heartbeat works"),
    ul([
      "You create a heartbeat monitor with an expected period and a grace period.",
      "Your job requests the heartbeat URL after a successful run.",
      "If a ping arrives late but within grace, you may record lateness without paging.",
      "If no ping arrives before grace ends, the monitor alerts on a missed run.",
    ]),
    p(
      "Use the [cron expression explainer](/tools/cron-expression-explainer) to confirm the schedule you think you deployed.",
    ),

    h2("Late vs Missed vs Silent Success"),
    table(
      ["Outcome", "Meaning", "Typical response"],
      [
        ["On-time ping", "Job finished inside the expected window", "None"],
        ["Late ping", "Job finished after the period but inside grace", "Investigate slow runs"],
        ["Missed ping", "No successful ping before grace ended", "Alert and check the job"],
        ["Silent success", "Job ran but never called the heartbeat", "Fix instrumentation; treat as miss until fixed"],
      ],
    ),
    p(
      "Silent success is the sneaky failure mode. The business outcome happened, but monitoring stayed blind. Put the ping in the success path only after the work commits, and alert when pings disappear.",
    ),

    h2("Choosing a grace period"),
    p(
      "Grace covers clock skew, queue delay, and occasional slow runs. Too short and you page for normal variance. Too long and customers feel the failure before you do.",
    ),
    ul([
      "For hourly jobs, start with 15 to 30 minutes of grace.",
      "For daily jobs, start with one to three hours.",
      "For tight every-minute jobs, grace may be a few minutes; expect more noise.",
    ]),
    callout("tip", [
      p(
        "Set grace from observed run duration, not from hope. If the job often takes 40 minutes, a 10-minute grace will lie to you.",
      ),
    ]),

    h2("Minimal job snippet"),
    code(
      "bash",
      `# After a successful backup\ncurl -fsS -X POST \"$HEARTBEAT_URL\"`,
      "Ping after success",
    ),
    p(
      "Ping only after success. A ping before the work finishes hides failures. Product setup: [Heartbeat monitoring](/docs/monitors/heartbeat-monitoring).",
    ),

    h2("Heartbeat URL security"),
    ul([
      "Treat the URL as a secret. Anyone with it can fake a healthy ping.",
      "Do not commit it to public repos.",
      "Rotate if it leaks.",
      "Prefer environment variables or a secret store.",
    ]),
    p(
      "Related terms: [heartbeat URL](/glossary/heartbeat-url), [grace period](/glossary/grace-period).",
    ),

    h2("Serverless and CI schedules"),
    p(
      "Cloud schedulers and CI cron wrappers fail in boring ways: permissions expire, a workflow file moves, a secret rotates. Heartbeats still help because the success path is under your control. Ping from the job after the work commits, not from the scheduler that merely attempted a start.",
    ),
    p(
      "If a platform can start a run but your code never finishes, the missing heartbeat is the signal. That is the failure mode backups die from.",
    ),

    h2("What heartbeats do not catch"),
    p(
      "A heartbeat does not prove the job did the right work. It proves the success path ran far enough to ping. Pair critical jobs with downstream checks when correctness matters as much as completion.",
    ),
    p(
      "Start with one heartbeat on the job whose silence would hurt most. Expand after that ping is boringly reliable.",
    ),
  ],
});
