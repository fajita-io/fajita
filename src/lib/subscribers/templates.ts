import type { StatusPageEmailContext } from "./context";
import type { SubscriberEventType } from "./constants";

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

function htmlShell(parts: ShellParts): string {
  const { ctx } = parts;
  const accent = safeAccent(ctx.accentColor);
  const logo = ctx.logoUrl
    ? `<img src="${escapeHtml(ctx.logoUrl)}" width="120" alt="${escapeHtml(ctx.name)}" style="max-height:40px;height:auto;width:auto;max-width:180px;display:block;border:0;" />`
    : `<span style="font-size:18px;font-weight:700;color:#111;">${escapeHtml(ctx.name)}</span>`;

  const poweredBy = ctx.poweredByRemoved
    ? ""
    : `<p style="margin:16px 0 0;font-size:12px;color:#777;">Status updates delivered by <a href="https://fajita.io" style="color:#777;">Fajita</a>.</p>`;

  const manageFooter = parts.showManageFooter && parts.links
    ? `<p style="margin:0 0 6px;font-size:12px;color:#777;">
         <a href="${escapeHtml(parts.links.statusPageUrl)}" style="color:#555;">View status page</a>
         &nbsp;·&nbsp;
         <a href="${escapeHtml(parts.links.preferenceUrl)}" style="color:#555;">Update preferences</a>
         &nbsp;·&nbsp;
         <a href="${escapeHtml(parts.links.unsubscribeUrl)}" style="color:#555;">Unsubscribe</a>
       </p>`
    : "";

  const privacy = ctx.privacyUrl
    ? `<p style="margin:0;font-size:12px;color:#999;"><a href="${escapeHtml(ctx.privacyUrl)}" style="color:#999;">Subscriber privacy notice</a></p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>${escapeHtml(ctx.name)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;color:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(parts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e5e5e7;">
      <tr><td style="padding:24px 28px;border-bottom:4px solid ${accent};">${logo}</td></tr>
      <tr><td style="padding:28px;">${parts.bodyHtml}</td></tr>
      <tr><td style="padding:20px 28px 28px;border-top:1px solid #eee;">
        ${manageFooter}
        ${privacy}
        ${poweredBy}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function button(label: string, url: string, accent: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr>
    <td style="border-radius:8px;background:${accent};">
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
    </td></tr></table>`;
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
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111;">Confirm your subscription</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#333;">${escapeHtml(input.explanation)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;font-size:14px;color:#333;">
      <tr><td style="padding:2px 0;">Components: ${escapeHtml(input.scopeSummary)}</td></tr>
      <tr><td style="padding:2px 0;">Updates: ${escapeHtml(input.eventSummary)}</td></tr>
    </table>
    ${button("Confirm subscription", input.confirmUrl, accent)}
    <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#555;">Or paste this link into your browser:<br />
      <a href="${escapeHtml(input.confirmUrl)}" style="color:#555;word-break:break-all;">${escapeHtml(input.confirmUrl)}</a></p>
    <p style="margin:8px 0 0;font-size:13px;color:#777;">This link expires in ${input.expiresHours} hours. If you did not request this, ignore this email and nothing will happen.</p>
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
        `<tr><td style="padding:4px 12px 4px 0;font-size:13px;color:#777;vertical-align:top;white-space:nowrap;">${escapeHtml(r.label)}</td><td style="padding:4px 0;font-size:14px;color:#111;">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");
  const summaryHtml = payload.summary
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;white-space:pre-wrap;">${escapeHtml(payload.summary)}</p>`
    : "";
  const link = payload.incidentUrl || links.statusPageUrl;

  const body = `
    <h1 style="margin:0 0 6px;font-size:21px;line-height:1.3;color:#111;">${escapeHtml(payload.title)}</h1>
    <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:${accent};">${escapeHtml(payload.statusLabel)}</p>
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
