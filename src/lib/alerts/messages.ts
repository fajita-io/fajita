/**
 * Provider message rendering. Pure module (client + server safe) so the app can
 * render previews and the delivery worker can render sends from the exact same
 * code. Every renderer works from a normalized, secret-free context: no tokens,
 * no full URLs, no response bodies, no internal notes.
 */

import { WEBHOOK_SCHEMA_VERSION } from "@/lib/alerts/constants";
import {
  EMAIL_COLORS,
  EMAIL_FONT,
  emailShell,
  emberButton,
  escapeHtml,
  fajitaHeaderHtml,
  poweredByMemoText,
} from "@/lib/email/shell";

export interface AlertRenderContext {
  eventType: string;
  severity: string | null;
  isRecovery: boolean;
  isTest: boolean;
  organizationName: string;
  /** Best display name: incident title, monitor name, or maintenance title. */
  title: string;
  monitorName?: string | null;
  /** Safe hostname only. Never a full URL with path or query. */
  hostSafe?: string | null;
  currentState?: string | null;
  openedAt?: string | null;
  resolvedAt?: string | null;
  latestUpdate?: string | null;
  evidenceSummary?: string | null;
  maintenance?: {
    startsAt?: string | null;
    endsAt?: string | null;
    timezone?: string | null;
  } | null;
  /** Absolute authenticated Fajita link (safe; no secrets). */
  link: string;
}

const SEVERITY_TAG: Record<string, string> = {
  critical: "Critical",
  major: "Major",
  minor: "Minor",
  maintenance: "Maintenance",
  informational: "Update",
};

function fmtTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

/** Centralized subject-line system. Useful on a mobile lock screen. No emoji. */
export function buildSubject(ctx: AlertRenderContext): string {
  if (ctx.isTest) return "[Test] Fajita alert channel test";
  const name = ctx.title || ctx.monitorName || "A monitored service";
  switch (ctx.eventType) {
    case "incident.opened":
    case "incident.reopened":
      return `[${SEVERITY_TAG[ctx.severity ?? "major"] ?? "Major"}] ${name}`;
    case "incident.resolved":
      return `[Resolved] ${name} is operational`;
    case "incident.recovery_started":
      return `[Recovering] ${name}`;
    case "incident.updated":
      return `[Update] ${name}`;
    case "maintenance.scheduled":
      return `[Maintenance] ${name} starts ${fmtTime(ctx.maintenance?.startsAt)}`;
    case "maintenance.started":
      return `[Maintenance] ${name} has started`;
    case "maintenance.updated":
      return `[Maintenance] ${name} was updated`;
    case "maintenance.completed":
      return `[Maintenance] ${name} is complete`;
    case "maintenance.canceled":
      return `[Maintenance] ${name} was canceled`;
    case "monitor.ssl_critical":
      return `[SSL Critical] ${ctx.hostSafe ?? name} needs attention`;
    case "monitor.ssl_restored":
      return `[Resolved] ${ctx.hostSafe ?? name} certificate renewed`;
    case "monitor.heartbeat_missed":
      return `[Heartbeat Missed] ${name} did not check in`;
    case "monitor.heartbeat_restored":
      return `[Resolved] ${name} checked in`;
    case "monitor.flapping":
      return `[Warning] ${name} is flapping`;
    default:
      return `[Fajita] ${name}`;
  }
}

function summaryLine(ctx: AlertRenderContext): string {
  if (ctx.isTest) {
    return "This is a test alert from Fajita. No incident was created.";
  }
  if (ctx.eventType.startsWith("maintenance.")) {
    const parts = [
      ctx.maintenance?.startsAt ? `Starts ${fmtTime(ctx.maintenance.startsAt)}` : null,
      ctx.maintenance?.endsAt ? `Ends ${fmtTime(ctx.maintenance.endsAt)}` : null,
    ].filter(Boolean);
    return parts.join(". ") || ctx.title;
  }
  if (ctx.isRecovery) {
    return `${ctx.title} has recovered.`;
  }
  return ctx.evidenceSummary || `${ctx.title} needs attention.`;
}

interface KeyValue {
  label: string;
  value: string;
}

function fields(ctx: AlertRenderContext): KeyValue[] {
  const rows: KeyValue[] = [{ label: "Organization", value: ctx.organizationName }];
  if (ctx.severity && !ctx.eventType.startsWith("maintenance.")) {
    rows.push({ label: "Severity", value: SEVERITY_TAG[ctx.severity] ?? ctx.severity });
  }
  if (ctx.currentState) rows.push({ label: "Current state", value: ctx.currentState });
  if (ctx.monitorName) rows.push({ label: "Monitor", value: ctx.monitorName });
  if (ctx.hostSafe) rows.push({ label: "Host", value: ctx.hostSafe });
  if (ctx.openedAt) rows.push({ label: "Opened", value: fmtTime(ctx.openedAt) });
  if (ctx.resolvedAt) rows.push({ label: "Resolved", value: fmtTime(ctx.resolvedAt) });
  if (ctx.maintenance?.startsAt) rows.push({ label: "Starts", value: fmtTime(ctx.maintenance.startsAt) });
  if (ctx.maintenance?.endsAt) rows.push({ label: "Ends", value: fmtTime(ctx.maintenance.endsAt) });
  return rows;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Accessible, mobile-friendly transactional email. No large artwork. */
export function renderEmail(ctx: AlertRenderContext): RenderedEmail {
  const subject = buildSubject(ctx);
  const summary = summaryLine(ctx);
  const rows = fields(ctx);
  const cta = ctx.isTest ? null : { href: ctx.link, label: "Open in Fajita" };

  const rowsHtml = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 16px 4px 0;color:${EMAIL_COLORS.muted};font-size:13px;font-family:${EMAIL_FONT};">${escapeHtml(r.label)}</td>` +
        `<td style="padding:4px 0;color:${EMAIL_COLORS.carbon};font-size:13px;font-weight:600;font-family:${EMAIL_FONT};">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");

  const bodyHtml =
    `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:${EMAIL_COLORS.carbon};font-family:${EMAIL_FONT};font-weight:700;">${escapeHtml(subject)}</h1>` +
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:${EMAIL_COLORS.body};font-family:${EMAIL_FONT};">${escapeHtml(summary)}</p>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;">${rowsHtml}</table>` +
    (ctx.latestUpdate
      ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:${EMAIL_COLORS.body};font-family:${EMAIL_FONT};border-left:3px solid ${EMAIL_COLORS.border};padding-left:12px;">${escapeHtml(ctx.latestUpdate)}</p>`
      : "") +
    (cta ? emberButton(cta.label, cta.href) : "");

  const footerHtml =
    `<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${EMAIL_COLORS.muted};font-family:${EMAIL_FONT};">` +
    `Questions? Reply to this email or visit <a href="https://fajita.io/contact" style="color:${EMAIL_COLORS.carbon};text-decoration:underline;">fajita.io/contact</a>.` +
    `</p>` +
    `<p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_COLORS.faint};font-family:${EMAIL_FONT};">` +
    `Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901 · ` +
    `<a href="https://fajita.io" style="color:${EMAIL_COLORS.faint};text-decoration:underline;">fajita.io</a>` +
    `</p>`;

  const html = emailShell({
    previewText: summary,
    title: subject,
    headerHtml: fajitaHeaderHtml({ label: "Fajita alert" }),
    bodyHtml,
    footerHtml,
  });

  const textLines = [
    subject,
    "",
    summary,
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
  ];
  if (ctx.latestUpdate) textLines.push("", ctx.latestUpdate);
  if (cta) textLines.push("", `Open in Fajita: ${cta.href}`);
  textLines.push("", "Fajita, 1001 S Main St, Ste 600, Kalispell, MT 59901", poweredByMemoText());

  return { subject, html, text: textLines.join("\n") };
}

/** Slack Block Kit message. Readable without images. No excessive emoji. */
export function renderSlack(ctx: AlertRenderContext): Record<string, unknown> {
  const subject = buildSubject(ctx);
  const summary = summaryLine(ctx);
  const rows = fields(ctx);

  const blocks: Array<Record<string, unknown>> = [
    { type: "header", text: { type: "plain_text", text: subject.slice(0, 150), emoji: false } },
    { type: "section", text: { type: "mrkdwn", text: summary } },
  ];
  if (rows.length > 0) {
    blocks.push({
      type: "section",
      fields: rows
        .slice(0, 10)
        .map((r) => ({ type: "mrkdwn", text: `*${r.label}*\n${r.value}` })),
    });
  }
  if (ctx.latestUpdate) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `> ${ctx.latestUpdate}` } });
  }
  if (!ctx.isTest) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Open in Fajita", emoji: false },
          url: ctx.link,
        },
      ],
    });
  }
  return { text: subject, blocks };
}

/** Discord embed. Plain text remains understandable if embeds change. */
export function renderDiscord(ctx: AlertRenderContext): Record<string, unknown> {
  const subject = buildSubject(ctx);
  const summary = summaryLine(ctx);
  const rows = fields(ctx);
  const color = ctx.isRecovery
    ? 0x4f9d3a
    : ctx.severity === "critical" || ctx.severity === "major"
      ? 0xc0392b
      : ctx.eventType.startsWith("maintenance.")
        ? 0xb8860b
        : 0xa15a2b;

  return {
    content: subject,
    embeds: [
      {
        title: subject.slice(0, 250),
        description: summary.slice(0, 2000),
        color,
        url: ctx.isTest ? undefined : ctx.link,
        fields: rows.slice(0, 10).map((r) => ({ name: r.label, value: r.value, inline: true })),
        footer: { text: "Fajita" },
      },
    ],
  };
}

/** Versioned, documented generic-webhook envelope. Secret-free. */
export function buildWebhookEnvelope(params: {
  eventId: string;
  ctx: AlertRenderContext;
  organizationId: string;
  incidentId: string | null;
  monitorId: string | null;
  createdAt: string;
}): Record<string, unknown> {
  const { ctx } = params;
  return {
    id: params.eventId,
    type: ctx.eventType,
    created_at: params.createdAt,
    schema_version: WEBHOOK_SCHEMA_VERSION,
    organization: { id: params.organizationId, name: ctx.organizationName },
    data: {
      incident_id: params.incidentId,
      monitor_id: params.monitorId,
      title: ctx.title,
      severity: ctx.severity,
      current_state: ctx.currentState ?? null,
      monitor_name: ctx.monitorName ?? null,
      host: ctx.hostSafe ?? null,
      opened_at: ctx.openedAt ?? null,
      resolved_at: ctx.resolvedAt ?? null,
      summary: summaryLine(ctx),
      link: ctx.isTest ? null : ctx.link,
      test: ctx.isTest,
    },
  };
}

/** Deterministic fixture context for previews and tests. Never real data. */
export function previewContext(
  provider: string,
  eventType = "incident.opened",
): AlertRenderContext {
  return {
    eventType,
    severity: "major",
    isRecovery: eventType.includes("resolved") || eventType.includes("restored"),
    isTest: false,
    organizationName: "Northwind Labs",
    title: "Checkout API is down",
    monitorName: "Checkout API",
    hostSafe: "api.example.com",
    currentState: "Down",
    openedAt: "2026-07-21T12:00:00.000Z",
    latestUpdate: "Investigating elevated 500s from the checkout service.",
    evidenceSummary: "3 consecutive failures, HTTP 503 from api.example.com.",
    link: "https://fajita.io/app/incidents/preview",
  };
}
