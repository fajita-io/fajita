import type { StatusPageEmailContext } from "./context";
import type { SubscriberEventType } from "./constants";
import {
  EMAIL_COLORS,
  EMAIL_FONT,
  accentButton,
  emailShell,
  escapeHtml,
  poweredByMemoText,
} from "@/lib/email/shell";

/**
 * Controlled subscriber email templates. There is no arbitrary customer HTML,
 * CSS, or script here: templates are code, customers supply only bounded
 * branding (name, logo, accent, links). Every message ships an HTML part and a
 * plain-text part, leads with the operational answer, uses exact timestamps,
 * conveys status with text (not color alone), and carries preference +
 * unsubscribe links. No marketing, no tracking pixels, no food jokes, no em
 * dashes (repo voice rule).
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EmailLinks {
  statusPageUrl: string;
  preferenceUrl: string;
  unsubscribeUrl: string;
}

/** Allowlisted public projection the templates are allowed to render. */
export interface RenderPayload {
  eventType: SubscriberEventType;
  title: string;
  statusLabel: string;
  severityLabel?: string | null;
  affectedComponents?: string[];
  summary?: string | null;
  startedAt?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  resolvedAt?: string | null;
  completedAt?: string | null;
  canceledAt?: string | null;
  durationText?: string | null;
  incidentUrl?: string | null;
}

/* --------------------------------- utils -------------------------------- */

function fmtTime(iso: string | null | undefined, tz: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: tz || "UTC",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString();
  }
}

function safeAccent(accent: string | null): string {
  // Only accept a #rrggbb hex; fall back to Fajita carbon so a bad value can
  // never inject styles or reduce contrast unpredictably.
  if (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) return accent;
  return "#1a1a1a";
}

/* --------------------------------- shell -------------------------------- */

interface ShellParts {
  ctx: StatusPageEmailContext;
  preheader: string;
  bodyHtml: string;
  links?: EmailLinks;
  showManageFooter: boolean;
}

function subscriberHeaderHtml(ctx: StatusPageEmailContext): string {
  if (ctx.logoUrl) {
    return `<img src="${escapeHtml(ctx.logoUrl)}" width="140" alt="${escapeHtml(ctx.name)}" style="max-height:36px;height:auto;width:auto;max-width:200px;display:block;border:0;" />`;
  }
  return `<span style="font-size:17px;font-weight:700;color:#ffffff;font-family:${EMAIL_FONT};">${escapeHtml(ctx.name)}</span>`;
}

function htmlShell(parts: ShellParts): string {
  const { ctx } = parts;

  const manageFooter = parts.showManageFooter && parts.links
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${EMAIL_COLORS.footerMuted};font-family:${EMAIL_FONT};">
         <a href="${escapeHtml(parts.links.statusPageUrl)}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">View status page</a>
         &nbsp;·&nbsp;
         <a href="${escapeHtml(parts.links.preferenceUrl)}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Update preferences</a>
         &nbsp;·&nbsp;
         <a href="${escapeHtml(parts.links.unsubscribeUrl)}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Unsubscribe</a>
       </p>`
    : "";

  const privacy = ctx.privacyUrl
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${EMAIL_COLORS.faint};font-family:${EMAIL_FONT};"><a href="${escapeHtml(ctx.privacyUrl)}" style="color:${EMAIL_COLORS.faint};text-decoration:underline;">Subscriber privacy notice</a></p>`
    : "";

  const deliveredBy = ctx.poweredByRemoved
    ? ""
    : `<p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_COLORS.faint};font-family:${EMAIL_FONT};">Status updates delivered by <a href="https://fajita.io" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Fajita</a></p>`;

  return emailShell({
    previewText: parts.preheader,
    title: ctx.name,
    headerHtml: subscriberHeaderHtml(ctx),
    bodyHtml: parts.bodyHtml,
    footerHtml: `${manageFooter}${privacy}${deliveredBy}`,
  });
}

function button(label: string, url: string, accent: string): string {
  return accentButton(label, url, accent);
}

function textFooter(links: EmailLinks, ctx: StatusPageEmailContext): string {
  const lines = [
    "",
    "----",
    `View status page: ${links.statusPageUrl}`,
    `Update preferences: ${links.preferenceUrl}`,
    `Unsubscribe: ${links.unsubscribeUrl}`,
  ];
  if (ctx.privacyUrl) lines.push(`Privacy: ${ctx.privacyUrl}`);
  if (!ctx.poweredByRemoved) lines.push("Status updates delivered by Fajita (https://fajita.io).");
  lines.push(poweredByMemoText());
  return lines.join("\n");
}

/* ----------------------------- confirmation ----------------------------- */

export interface ConfirmationInput {
  confirmUrl: string;
  expiresHours: number;
  scopeSummary: string;   // "All components" or "Selected components: A, B"
  eventSummary: string;   // which event types were chosen
  explanation: string;
}

export function renderConfirmationEmail(
  ctx: StatusPageEmailContext,
  input: ConfirmationInput,
): RenderedEmail {
  const accent = safeAccent(ctx.accentColor);
  const subject = `Confirm your subscription to ${ctx.name}`;
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${EMAIL_COLORS.carbon};font-family:${EMAIL_FONT};">Confirm your subscription</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:${EMAIL_COLORS.body};font-family:${EMAIL_FONT};">${escapeHtml(input.explanation)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;font-size:14px;color:${EMAIL_COLORS.body};font-family:${EMAIL_FONT};">
      <tr><td style="padding:2px 0;">Components: ${escapeHtml(input.scopeSummary)}</td></tr>
      <tr><td style="padding:2px 0;">Updates: ${escapeHtml(input.eventSummary)}</td></tr>
    </table>
    ${button("Confirm subscription", input.confirmUrl, accent)}
    <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${EMAIL_COLORS.muted};font-family:${EMAIL_FONT};">Or paste this link into your browser:<br />
      <a href="${escapeHtml(input.confirmUrl)}" style="color:${EMAIL_COLORS.muted};word-break:break-all;text-decoration:underline;">${escapeHtml(input.confirmUrl)}</a></p>
    <p style="margin:8px 0 0;font-size:13px;color:${EMAIL_COLORS.faint};font-family:${EMAIL_FONT};">This link expires in ${input.expiresHours} hours. If you did not request this, ignore this email and nothing will happen.</p>
  `;
  const html = htmlShell({ ctx, preheader: input.explanation, bodyHtml: body, showManageFooter: false });
  const text = [
    `Confirm your subscription to ${ctx.name}`,
    "",
    input.explanation,
    "",
    `Components: ${input.scopeSummary}`,
    `Updates: ${input.eventSummary}`,
    "",
    `Confirm: ${input.confirmUrl}`,
    "",
    `This link expires in ${input.expiresHours} hours. If you did not request this, ignore this email.`,
    ctx.privacyUrl ? `\nPrivacy: ${ctx.privacyUrl}` : "",
    ctx.poweredByRemoved ? "" : "Status updates delivered by Fajita (https://fajita.io).",
    poweredByMemoText(),
  ].join("\n");
  return { subject, html, text };
}

/* ------------------------------- events --------------------------------- */

const SUBJECT_PREFIX: Record<SubscriberEventType, (p: RenderPayload) => string> = {
  incident_opened: (p) => `[${p.severityLabel || "Incident"}] ${p.title}`,
  incident_update: (p) => `[${p.statusLabel || "Update"}] ${p.title}`,
  incident_resolved: (p) => `[Resolved] ${p.title}`,
  incident_reopened: (p) => `[Reopened] ${p.title}`,
  maintenance_scheduled: (p) => `[Scheduled Maintenance] ${p.title}`,
  maintenance_started: (p) => `[Maintenance Started] ${p.title}`,
  maintenance_updated: (p) => `[Maintenance Update] ${p.title}`,
  maintenance_completed: (p) => `[Maintenance Completed] ${p.title}`,
  maintenance_canceled: (p) => `[Maintenance Canceled] ${p.title}`,
  manual_notice: (p) => `[${p.statusLabel || "Notice"}] ${p.title}`,
};

function detailRows(p: RenderPayload, tz: string): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  rows.push({ label: "Current status", value: p.statusLabel });
  if (p.severityLabel) rows.push({ label: "Severity", value: p.severityLabel });
  if (p.affectedComponents && p.affectedComponents.length > 0) {
    rows.push({ label: "Affected", value: p.affectedComponents.join(", ") });
  }
  if (p.startedAt) rows.push({ label: "Started", value: fmtTime(p.startedAt, tz) });
  if (p.scheduledStart) rows.push({ label: "Scheduled start", value: fmtTime(p.scheduledStart, tz) });
  if (p.scheduledEnd) rows.push({ label: "Scheduled end", value: fmtTime(p.scheduledEnd, tz) });
  if (p.resolvedAt) rows.push({ label: "Resolved", value: fmtTime(p.resolvedAt, tz) });
  if (p.completedAt) rows.push({ label: "Completed", value: fmtTime(p.completedAt, tz) });
  if (p.canceledAt) rows.push({ label: "Canceled", value: fmtTime(p.canceledAt, tz) });
  if (p.durationText) rows.push({ label: "Duration", value: p.durationText });
  return rows;
}

export function renderEventEmail(
  ctx: StatusPageEmailContext,
  payload: RenderPayload,
  links: EmailLinks,
): RenderedEmail {
  const accent = safeAccent(ctx.accentColor);
  const subject = SUBJECT_PREFIX[payload.eventType](payload);
  const rows = detailRows(payload, ctx.timezone);
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 12px 4px 0;font-size:13px;color:${EMAIL_COLORS.muted};vertical-align:top;white-space:nowrap;font-family:${EMAIL_FONT};">${escapeHtml(r.label)}</td><td style="padding:4px 0;font-size:14px;color:${EMAIL_COLORS.carbon};font-family:${EMAIL_FONT};">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");
  const summaryHtml = payload.summary
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.body};white-space:pre-wrap;font-family:${EMAIL_FONT};">${escapeHtml(payload.summary)}</p>`
    : "";
  const link = payload.incidentUrl || links.statusPageUrl;

  const body = `
    <h1 style="margin:0 0 6px;font-size:24px;line-height:1.25;color:${EMAIL_COLORS.carbon};font-family:${EMAIL_FONT};">${escapeHtml(payload.title)}</h1>
    <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:${accent};font-family:${EMAIL_FONT};">${escapeHtml(payload.statusLabel)}</p>
    ${summaryHtml}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 4px;">${rowsHtml}</table>
    ${button("View status page", link, accent)}
  `;
  const preheader = payload.summary?.slice(0, 120) || payload.statusLabel;
  const html = htmlShell({ ctx, preheader, bodyHtml: body, links, showManageFooter: true });

  const textLines = [
    subject,
    "",
    payload.title,
    payload.statusLabel,
    "",
  ];
  if (payload.summary) textLines.push(payload.summary, "");
  for (const r of rows) textLines.push(`${r.label}: ${r.value}`);
  textLines.push("", `View status page: ${link}`, textFooter(links, ctx));
  return { subject, html, text: textLines.join("\n") };
}
