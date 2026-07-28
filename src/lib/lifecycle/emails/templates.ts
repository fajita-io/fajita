import {
  appLink,
  detailTable,
  fmtTime,
  heading,
  lifecycleShell,
  listItems,
  metricRow,
  paragraph,
  primaryButton,
  secondaryLink,
  sectionHeading,
  textFooter,
  warningPanel,
  type RenderedLifecycleEmail,
} from "./shell";
import { lifecycleMessage, type LifecycleMessageKey } from "../messages";

/**
 * Versioned lifecycle email templates.
 *
 * Every template renders from the intent's stored payload: safe, bounded
 * values only (names, counts, timestamps, step keys). No secrets, no full
 * URLs, no subscriber data, no internal notes. Payload readers are defensive
 * because payloads outlive template code.
 *
 * Template versions never rewrite history: a template change bumps the
 * version in the message registry and adds a renderer here; old attempts keep
 * their recorded version.
 */

type Payload = Record<string, unknown>;

function str(p: Payload, key: string, fallback = ""): string {
  const v = p[key];
  return typeof v === "string" ? v : fallback;
}

function num(p: Payload, key: string, fallback = 0): number {
  const v = p[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(p: Payload, key: string): boolean {
  return p[key] === true;
}

function strings(p: Payload, key: string): string[] {
  const v = p[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

type Renderer = (payload: Payload) => RenderedLifecycleEmail;

function intervalLabel(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "on its configured interval";
  if (seconds % 3600 === 0) {
    const h = seconds / 3600;
    return h === 1 ? "every hour" : `every ${h} hours`;
  }
  if (seconds % 60 === 0) {
    const m = seconds / 60;
    return m === 1 ? "every minute" : `every ${m} minutes`;
  }
  return `every ${seconds} seconds`;
}

/* ------------------------------------------------------------------ */
/* Setup class                                                         */
/* ------------------------------------------------------------------ */

const renderWelcome: Renderer = (_p) => {
  const subject = "Your Fajita account is ready";
  const previewText =
    "Start with one website, API, certificate, or scheduled job.";
  const body = [
    heading("Your software should not have to shout to be noticed."),
    paragraph(
      "Fajita watches your websites, APIs, SSL certificates, and scheduled jobs. When something starts cooking, your team hears about it before your customers do.",
    ),
    paragraph(
      "Start with one monitor. Fajita tests the setup before monitoring begins, and the first result usually lands within five minutes.",
    ),
    primaryButton("Create your first monitor", appLink("/app/monitors/new")),
    paragraph("Most teams finish this in under three minutes.", true),
  ].join("");
  const text = [
    subject,
    "",
    "Fajita watches your websites, APIs, SSL certificates, and scheduled jobs. When something starts cooking, your team hears about it before your customers do.",
    "",
    "Start with one monitor. Fajita tests the setup before monitoring begins.",
    "",
    `Create your first monitor: ${appLink("/app/monitors/new")}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderSetupReminder: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const finalStage = num(p, "stage", 1) >= 2;
  const subject = "Your first monitor is still waiting";
  const previewText = "One monitor is all it takes to start.";
  const body = [
    heading("One monitor is all it takes."),
    paragraph(
      `Nothing in ${org} is being watched yet. Pick the one thing you would least like to break: a homepage, an API endpoint, a certificate, or a nightly job.`,
    ),
    paragraph(
      "Fajita tests the setup before monitoring begins. Setup takes about three minutes.",
    ),
    primaryButton("Create your first monitor", appLink("/app/monitors/new")),
    finalStage
      ? paragraph(
          "This is the last reminder about setup. Everything stays ready whenever you are.",
          true,
        )
      : "",
  ].join("");
  const text = [
    subject,
    "",
    `Nothing in ${org} is being watched yet. Pick the one thing you would least like to break.`,
    "",
    `Create your first monitor: ${appLink("/app/monitors/new")}`,
    finalStage
      ? "\nThis is the last reminder about setup. Everything stays ready whenever you are."
      : "",
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderDraftReminder: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const name = str(p, "monitor_name", "your monitor");
  const type = str(p, "monitor_type", "website");
  const monitorId = str(p, "monitor_id");
  const href = monitorId ? `/app/monitors/${monitorId}` : "/app/monitors";
  const subject = `Finish setting up your ${type} monitor`;
  const previewText = `${name} is saved as a draft. Test it and activate it when you are ready.`;
  const body = [
    heading("Your draft is saved. Nothing is lost."),
    paragraph(
      `The ${type} monitor "${name}" is waiting exactly where you left it. Run the test, review the result, and activate it when you are ready.`,
    ),
    primaryButton("Resume setup", appLink(href)),
  ].join("");
  const text = [
    subject,
    "",
    `The ${type} monitor "${name}" is saved as a draft. Run the test and activate it when you are ready.`,
    "",
    `Resume setup: ${appLink(href)}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderFirstMonitorLive: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const name = str(p, "monitor_name", "Your monitor");
  const monitorId = str(p, "monitor_id");
  const failed = bool(p, "first_check_failed");
  const firstCheckAt = str(p, "first_check_at");
  const interval = intervalLabel(
    typeof p.check_interval_seconds === "number"
      ? p.check_interval_seconds
      : null,
  );
  const href = monitorId ? `/app/monitors/${monitorId}` : "/app/monitors";
  const subject = "Your first Fajita monitor is live";
  const previewText = failed
    ? "The first scheduled check ran and recorded a failure. The evidence is ready to review."
    : "The first scheduled check passed. Monitoring continues on schedule.";

  const rows = [
    { label: "Monitor", value: name },
    { label: "Checks", value: interval },
    ...(firstCheckAt
      ? [{ label: "First result", value: fmtTime(firstCheckAt) }]
      : []),
    {
      label: "Result",
      value: failed ? "Failed. Evidence recorded." : "Passed",
    },
  ];

  const body = [
    heading(failed ? "The first scheduled check failed" : "First check complete"),
    failed
      ? paragraph(
          "Fajita reached out on schedule and recorded a failure. That is the system doing its job: review the evidence before changing the monitor.",
        )
      : paragraph(
          "Fajita reached the endpoint and every required check passed. Monitoring continues on schedule, and the history builds from here.",
        ),
    detailTable(rows),
    primaryButton("View monitor", appLink(href)),
    failed
      ? ""
      : paragraph(
          "Next: connect an alert channel so a confirmed incident reaches your team, not just this inbox.",
          true,
        ),
  ].join("");
  const text = [
    subject,
    "",
    failed
      ? "The first scheduled check recorded a failure. Review the evidence before changing the monitor."
      : "Fajita reached the endpoint and every required check passed.",
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
    "",
    `View monitor: ${appLink(href)}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderFirstFailureEducation: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const name = str(p, "monitor_name", "your monitor");
  const monitorId = str(p, "monitor_id");
  const href = monitorId ? `/app/monitors/${monitorId}` : "/app/monitors";
  const subject = "Fajita recorded a failed check";
  const previewText =
    "One failed check is evidence, not an outage. Here is what happens next.";
  const body = [
    heading("One failed check is not an outage."),
    paragraph(
      `The first scheduled check for "${name}" failed, so Fajita started its verification process. An incident opens only after consecutive failures confirm the problem is real.`,
    ),
    paragraph(
      "The failing result is stored with its evidence: status, timing, and what was expected. Review it before changing the monitor configuration.",
    ),
    primaryButton("Review the evidence", appLink(href)),
    warningPanel(
      "No alert channel is connected yet",
      "If this had been a confirmed incident, no one would have been paged. Connect an alert channel so the next one reaches your team.",
    ),
    secondaryLink("Connect an alert channel", appLink("/app/integrations/new")),
  ].join("");
  const text = [
    subject,
    "",
    `The first scheduled check for "${name}" failed, so Fajita started its verification process. An incident opens only after consecutive failures confirm the problem is real.`,
    "",
    `Review the evidence: ${appLink(href)}`,
    "",
    "No alert channel is connected yet. Connect one so the next confirmed incident reaches your team:",
    appLink("/app/integrations/new"),
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderAlertChannelReminder: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const count = num(p, "active_monitor_count", 1);
  const subject = "Fajita found the signal. Choose where it should go.";
  const previewText =
    "A monitor can find the problem. An alert channel makes sure your team hears about it.";
  const body = [
    heading("Decide where Fajita should reach you."),
    paragraph(
      `${count === 1 ? "Your monitor is" : `${count} monitors are`} running in ${org}, but a confirmed incident currently has nowhere to go. A monitor can find the problem. An alert channel makes sure your team hears about it.`,
    ),
    paragraph(
      "Email is the fastest to set up. Slack and Discord reach the room where your team already is. Webhooks feed your own automation. Every channel is tested before it carries a real alert.",
    ),
    primaryButton("Connect an alert channel", appLink("/app/integrations/new")),
  ].join("");
  const text = [
    subject,
    "",
    `${count === 1 ? "Your monitor is" : `${count} monitors are`} running in ${org}, but a confirmed incident currently has nowhere to go.`,
    "",
    "Email, Slack, Discord, or webhook. Every channel is tested before it carries a real alert.",
    "",
    `Connect an alert channel: ${appLink("/app/integrations/new")}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderStatusPageReminder: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const subject = "Give customers one place to check";
  const previewText =
    "Publish live component status, incidents, and uptime history from a page that looks like your company.";
  const body = [
    heading("Give customers one place to check."),
    paragraph(
      "Your monitoring and alerting are connected. The last piece is public: a status page that answers customer questions before they reach support.",
    ),
    paragraph(
      "Publish live component status, incidents, maintenance, and uptime history from a hosted page. Name a component, map a monitor, publish. A custom domain can wait.",
    ),
    primaryButton("Create a status page", appLink("/app/status-pages/new")),
  ].join("");
  const text = [
    subject,
    "",
    "Your monitoring and alerting are connected. The last piece is public: a status page that answers customer questions before they reach support.",
    "",
    `Create a status page: ${appLink("/app/status-pages/new")}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderActivationComplete: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const monitors = num(p, "active_monitor_count", 1);
  const channels = num(p, "verified_channel_count", 1);
  const pages = num(p, "published_status_page_count", 1);
  const subject = "Fajita is fully connected";
  const previewText =
    "Monitoring, alerting, and your status page are working together.";
  const body = [
    heading("Everything is connected."),
    paragraph(
      `${org} now has the full loop: monitors watching, alerts routed to your team, and a public status page your customers can trust.`,
    ),
    detailTable([
      {
        label: "Monitors",
        value: `${monitors} active`,
      },
      { label: "Alert channels", value: `${channels} verified` },
      { label: "Status pages", value: `${pages} published` },
    ]),
    primaryButton("Open the overview", appLink("/app")),
    paragraph(
      "One worthwhile next step: add an SSL certificate monitor. Expiring certificates are the quietest outages there are.",
      true,
    ),
    secondaryLink("Add an SSL monitor", appLink("/app/monitors/new/ssl")),
  ].join("");
  const text = [
    subject,
    "",
    `${org} now has the full loop: monitors watching, alerts routed to your team, and a public status page your customers can trust.`,
    "",
    `Monitors: ${monitors} active`,
    `Alert channels: ${channels} verified`,
    `Status pages: ${pages} published`,
    "",
    `Open the overview: ${appLink("/app")}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

const renderUsageLimitNotice: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const usage = num(p, "usage");
  const limit = num(p, "limit");
  const threshold = num(p, "threshold", 80);
  const limitKey = str(p, "limit_key", "active_monitors");
  const atLimit = threshold >= 100;
  const isChecks = limitKey === "monthly_checks";
  const resourceLabel = isChecks ? "checks this period" : "active monitors";
  const subject = atLimit
    ? isChecks
      ? "Scheduled monitoring is paused"
      : "You have reached your monitor limit"
    : isChecks
      ? "You are approaching your check allowance"
      : "You are approaching your monitor limit";
  const previewText = `${usage} of ${limit} ${resourceLabel} in use.`;
  const atLimitBody = isChecks
    ? `${org} has used ${usage} of ${limit} included checks this billing period. Scheduled monitoring is paused until you upgrade or the period resets.`
    : `${org} is using ${usage} of ${limit} active monitors on the current plan. New monitors cannot be activated until something changes.`;
  const warnBody = isChecks
    ? `${org} has used ${usage} of ${limit} included checks this billing period. Nothing is paused yet.`
    : `${org} is using ${usage} of ${limit} active monitors on the current plan.`;
  const atLimitAction = isChecks
    ? "Upgrade to a plan with more included checks, or wait for your billing period to reset. There are no overage charges."
    : "You can pause a monitor you no longer need, or move to a plan with more room. Nothing running is affected, and there are no overage charges.";
  const warnAction = isChecks
    ? "If you expect usage to keep climbing, a larger plan avoids hitting the ceiling mid-period. There are no overage charges."
    : "Nothing is affected yet. If you expect to add more, a larger plan avoids hitting the ceiling mid-setup. There are no overage charges either way.";
  const body = [
    heading(
      atLimit
        ? isChecks
          ? "Check allowance reached"
          : "Monitor limit reached"
        : isChecks
          ? "Approaching your check allowance"
          : "Approaching your monitor limit",
    ),
    paragraph(`${atLimit ? atLimitBody : warnBody}${atLimit && !isChecks ? " New monitors cannot be activated until something changes." : ""}`),
    paragraph(atLimit ? atLimitAction : warnAction),
    primaryButton("Review usage and plans", appLink("/app/settings/billing/usage")),
  ].join("");
  const text = [
    subject,
    "",
    atLimit ? atLimitBody : warnBody,
    atLimit ? atLimitAction : warnAction,
    "",
    `Review usage and plans: ${appLink("/app/settings/billing/usage")}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

/* ------------------------------------------------------------------ */
/* Report class                                                        */
/* ------------------------------------------------------------------ */

const renderWeeklyReport: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const periodLabel = str(p, "period_label", "the past week");
  const reportId = str(p, "report_id");
  const successRate = str(p, "success_rate_label", "");
  const checks = num(p, "checks_completed");
  const monitors = num(p, "active_monitors");
  const failures = num(p, "monitors_with_failures");
  const incidents = num(p, "incident_count");
  const avgMs = num(p, "avg_response_ms");
  const completeness = str(p, "data_completeness", "complete");
  const warnings = strings(p, "warnings");
  const actions = strings(p, "recommended_actions");
  const href = reportId ? `/app/reports/weekly/${reportId}` : "/app/reports";

  const subject = `Fajita weekly reliability report: ${periodLabel}`;
  const previewText = successRate
    ? `${successRate} check success across ${monitors} monitors.`
    : `Reliability summary for ${periodLabel}.`;

  const body = [
    heading("Weekly reliability report"),
    paragraph(`${org} · ${periodLabel}`, true),
    completeness !== "complete"
      ? warningPanel(
          "Some monitoring data was unavailable this week",
          "Fajita experienced a platform issue during part of this period. Affected intervals are excluded from success-rate calculations and are not counted as your downtime.",
        )
      : "",
    metricRow([
      { label: "Check success", value: successRate || "n/a" },
      { label: "Checks completed", value: checks.toLocaleString("en-US") },
      {
        label: "Incidents",
        value: String(incidents),
        tone: incidents > 0 ? "down" : undefined,
      },
    ]),
    metricRow([
      { label: "Active monitors", value: String(monitors) },
      {
        label: "Monitors with failures",
        value: String(failures),
        tone: failures > 0 ? "warn" : undefined,
      },
      {
        label: "Avg response",
        value: avgMs > 0 ? `${avgMs} ms` : "n/a",
      },
    ]),
    warnings.length > 0 ? sectionHeading("Needs attention") : "",
    listItems(warnings),
    actions.length > 0 ? sectionHeading("Recommended actions") : "",
    listItems(actions),
    primaryButton("View full report", appLink(href)),
  ].join("");
  const text = [
    subject,
    "",
    `${org} · ${periodLabel}`,
    completeness !== "complete"
      ? "\nNote: some monitoring data was unavailable this week. Affected intervals are excluded from success-rate calculations.\n"
      : "",
    `Check success: ${successRate || "n/a"}`,
    `Checks completed: ${checks}`,
    `Incidents: ${incidents}`,
    `Active monitors: ${monitors}`,
    `Monitors with failures: ${failures}`,
    `Average response: ${avgMs > 0 ? `${avgMs} ms` : "n/a"}`,
    warnings.length > 0 ? `\nNeeds attention:\n${warnings.map((w) => `- ${w}`).join("\n")}` : "",
    actions.length > 0 ? `\nRecommended actions:\n${actions.map((a) => `- ${a}`).join("\n")}` : "",
    "",
    `View full report: ${appLink(href)}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
      senderLabel: "Fajita Reports",
    }),
    text,
  };
};

const renderIncidentRecap: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const title = str(p, "incident_title", "Incident");
  const severity = str(p, "severity_label", "");
  const duration = str(p, "duration_label", "");
  const startedAt = str(p, "started_at");
  const resolvedAt = str(p, "resolved_at");
  const affected = strings(p, "affected_monitors");
  const resolution = str(p, "resolution_summary");
  const incidentId = str(p, "incident_id");
  const href = incidentId ? `/app/incidents/${incidentId}` : "/app/incidents";

  const subject = `Incident recap: ${title}`;
  const previewText = duration
    ? `${severity || "Incident"} · ${duration} · resolved.`
    : "Resolved incident summary.";

  const rows = [
    ...(severity ? [{ label: "Severity", value: severity }] : []),
    ...(startedAt ? [{ label: "Started", value: fmtTime(startedAt) }] : []),
    ...(resolvedAt ? [{ label: "Resolved", value: fmtTime(resolvedAt) }] : []),
    ...(duration ? [{ label: "Duration", value: duration }] : []),
    ...(affected.length > 0
      ? [{ label: "Affected", value: affected.join(", ") }]
      : []),
  ];

  const body = [
    heading(`Incident recap: ${title}`),
    paragraph(
      "The incident is resolved and has stayed resolved. This recap is the factual record for your team.",
    ),
    detailTable(rows),
    resolution ? paragraph(resolution) : "",
    primaryButton("View incident", appLink(href)),
  ].join("");
  const text = [
    subject,
    "",
    "The incident is resolved and has stayed resolved. This recap is the factual record for your team.",
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
    resolution ? `\n${resolution}` : "",
    "",
    `View incident: ${appLink(href)}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
      senderLabel: "Fajita Reports",
    }),
    text,
  };
};

/* ------------------------------------------------------------------ */
/* Required + reactivation classes                                     */
/* ------------------------------------------------------------------ */

const renderCancellationConfirmation: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const effectiveAt = str(p, "effective_at");
  const monitors = num(p, "active_monitor_count");
  const pages = num(p, "published_status_page_count");
  const subject = "Your Fajita cancellation is scheduled";
  const previewText = effectiveAt
    ? `Access continues until ${fmtTime(effectiveAt)}.`
    : "Your cancellation details and export options.";
  const body = [
    heading("Cancellation scheduled. No surprises."),
    paragraph(
      effectiveAt
        ? `Your subscription for ${org} ends on ${fmtTime(effectiveAt)}. Until then, everything keeps working: monitors, alerts, and status pages.`
        : `Your subscription for ${org} is scheduled to end. Until then, everything keeps working: monitors, alerts, and status pages.`,
    ),
    detailTable([
      { label: "Active monitors", value: String(monitors) },
      { label: "Published status pages", value: String(pages) },
      ...(effectiveAt
        ? [{ label: "Access until", value: fmtTime(effectiveAt) }]
        : []),
    ]),
    paragraph(
      "Your data stays exportable through the retention period, and you can reactivate any time before deletion with the configuration intact.",
    ),
    primaryButton("Export your data", appLink("/app/settings/data")),
    secondaryLink("Reactivate subscription", appLink("/app/settings/billing")),
  ].join("");
  const text = [
    subject,
    "",
    effectiveAt
      ? `Your subscription for ${org} ends on ${fmtTime(effectiveAt)}. Until then, everything keeps working.`
      : `Your subscription for ${org} is scheduled to end.`,
    "",
    `Active monitors: ${monitors}`,
    `Published status pages: ${pages}`,
    "",
    `Export your data: ${appLink("/app/settings/data")}`,
    `Reactivate: ${appLink("/app/settings/billing")}`,
    textFooter(false),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: false,
    }),
    text,
  };
};

const renderPreDeletionReminder: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const scheduledFor = str(p, "deletion_scheduled_for");
  const stage = str(p, "stage", "7d");
  const subject =
    stage === "1d"
      ? "Final notice: your Fajita data is deleted tomorrow"
      : "Your Fajita data is scheduled for deletion";
  const previewText = scheduledFor
    ? `Deletion is scheduled for ${fmtTime(scheduledFor)}.`
    : "Export your data before deletion.";
  const body = [
    heading(stage === "1d" ? "Deletion happens tomorrow." : "Deletion is scheduled."),
    paragraph(
      scheduledFor
        ? `The organization ${org} and all of its data (monitors, incident history, status pages, and subscribers) will be permanently deleted on ${fmtTime(scheduledFor)}.`
        : `The organization ${org} and all of its data will be permanently deleted soon.`,
    ),
    paragraph(
      "If this is intentional, nothing more is needed. If not, you can export everything or cancel the deletion now.",
    ),
    primaryButton("Export your data", appLink("/app/settings/data")),
    secondaryLink("Cancel deletion", appLink("/app/settings/data")),
  ].join("");
  const text = [
    subject,
    "",
    scheduledFor
      ? `The organization ${org} and all of its data will be permanently deleted on ${fmtTime(scheduledFor)}.`
      : `The organization ${org} and all of its data will be permanently deleted soon.`,
    "",
    "If this is intentional, nothing more is needed. If not:",
    `Export your data: ${appLink("/app/settings/data")}`,
    `Cancel deletion: ${appLink("/app/settings/data")}`,
    textFooter(false),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: false,
    }),
    text,
  };
};

const renderReactivationReminder: Renderer = (p) => {
  const org = str(p, "organization_name", "your organization");
  const monitors = num(p, "active_monitor_count");
  const pages = num(p, "published_status_page_count");
  const subject = "Your Fajita data is still available";
  const previewText =
    "Reactivate before the retention period ends to resume monitoring with the existing configuration.";
  const body = [
    heading("Everything is where you left it."),
    paragraph(
      `Your Fajita subscription is canceled, but ${org} still holds its configuration: ${monitors} ${monitors === 1 ? "monitor" : "monitors"} and ${pages} ${pages === 1 ? "status page" : "status pages"}, paused and intact.`,
    ),
    paragraph(
      "Reactivate before the retention period ends and monitoring resumes with the existing setup. Or export everything first; both paths stay open until deletion.",
    ),
    primaryButton("Reactivate subscription", appLink("/app/settings/billing")),
    secondaryLink("Export your data", appLink("/app/settings/data")),
  ].join("");
  const text = [
    subject,
    "",
    `Your Fajita subscription is canceled, but ${org} still holds its configuration, paused and intact.`,
    "",
    `Reactivate: ${appLink("/app/settings/billing")}`,
    `Export your data: ${appLink("/app/settings/data")}`,
    textFooter(true),
  ].join("\n");
  return {
    subject,
    previewText,
    html: lifecycleShell({
      previewText,
      bodyHtml: body,
      organizationName: org,
      showPreferenceFooter: true,
    }),
    text,
  };
};

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

/** message key -> template version -> renderer. */
const TEMPLATES: Record<LifecycleMessageKey, Record<number, Renderer>> = {
  welcome: { 1: renderWelcome },
  setup_reminder: { 1: renderSetupReminder },
  monitor_draft_reminder: { 1: renderDraftReminder },
  first_monitor_live: { 1: renderFirstMonitorLive },
  first_failure_education: { 1: renderFirstFailureEducation },
  alert_channel_reminder: { 1: renderAlertChannelReminder },
  status_page_reminder: { 1: renderStatusPageReminder },
  activation_complete: { 1: renderActivationComplete },
  weekly_report: { 1: renderWeeklyReport },
  incident_recap: { 1: renderIncidentRecap },
  usage_limit_notice: { 1: renderUsageLimitNotice },
  cancellation_confirmation: { 1: renderCancellationConfirmation },
  pre_deletion_reminder: { 1: renderPreDeletionReminder },
  reactivation_reminder: { 1: renderReactivationReminder },
};

export function renderLifecycleEmail(
  messageKey: string,
  templateVersion: number,
  payload: Payload,
): RenderedLifecycleEmail | null {
  const definition = lifecycleMessage(messageKey);
  if (!definition) return null;
  const versions = TEMPLATES[messageKey as LifecycleMessageKey];
  if (!versions) return null;
  const renderer = versions[templateVersion] ?? versions[definition.templateVersion];
  if (!renderer) return null;
  return renderer(payload);
}

export type { RenderedLifecycleEmail };
