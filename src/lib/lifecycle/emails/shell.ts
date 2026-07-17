import { appUrl } from "@/lib/env";

/**
 * Fajita lifecycle email design system.
 *
 * One shell, a small set of components, no JavaScript, no forms, no animated
 * dependencies, minimal external assets (no images required at all: the
 * wordmark is text so the email reads identically with images disabled).
 * Every email ships an HTML part and a plain-text part.
 *
 * This is organization lifecycle mail from Fajita to its customers. It is
 * deliberately distinct from subscriber email (which carries the customer's
 * status-page branding) and never reuses that branding.
 */

export interface RenderedLifecycleEmail {
  subject: string;
  previewText: string;
  html: string;
  text: string;
}

/* Brand constants (mirrors src/styles/tokens.css; emails need literals). */
export const EMAIL_COLORS = {
  carbon: "#17130e",
  soot: "#3e382f",
  body: "#333330",
  muted: "#6f6a60",
  faint: "#8a8578",
  cream: "#faf5ea",
  surface: "#ffffff",
  border: "#e8e2d4",
  ember: "#b53a0a",
  emberDark: "#8a2c07",
  pepper: "#a61e1e",
  green: "#2b8a3e",
  amber: "#7a5200",
} as const;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function fmtTime(
  iso: string | null | undefined,
  tz = "UTC",
): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: tz,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString();
  }
}

/** App link builder: allowlisted internal paths only, never raw URLs. */
export function appLink(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${appUrl}${clean}`;
}

export const PREFERENCES_PATH = "/app/settings/notifications/lifecycle";

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

export function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:700;color:${EMAIL_COLORS.carbon};">${escapeHtml(text)}</h1>`;
}

export function paragraph(text: string, muted = false): string {
  const color = muted ? EMAIL_COLORS.muted : EMAIL_COLORS.body;
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${color};">${escapeHtml(text)}</p>`;
}

export function primaryButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr>
    <td style="border-radius:8px;background:${EMAIL_COLORS.carbon};">
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
    </td></tr></table>`;
}

export function secondaryLink(label: string, url: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;"><a href="${escapeHtml(url)}" style="color:${EMAIL_COLORS.ember};font-weight:600;text-decoration:none;">${escapeHtml(label)}</a></p>`;
}

/** Label/value detail rows (timestamps, counts). Meaning never color-only. */
export function detailTable(
  rows: Array<{ label: string; value: string }>,
): string {
  if (rows.length === 0) return "";
  const cells = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 14px 4px 0;font-size:13px;color:${EMAIL_COLORS.muted};vertical-align:top;white-space:nowrap;">${escapeHtml(r.label)}</td><td style="padding:4px 0;font-size:14px;color:${EMAIL_COLORS.carbon};">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">${cells}</table>`;
}

/** Compact metric cards for reports. Renders as a simple two-column table. */
export function metricRow(
  metrics: Array<{ label: string; value: string; tone?: "warn" | "down" }>,
): string {
  const cells = metrics
    .map((m) => {
      const color =
        m.tone === "down"
          ? EMAIL_COLORS.pepper
          : m.tone === "warn"
            ? EMAIL_COLORS.amber
            : EMAIL_COLORS.carbon;
      return `<td style="padding:12px 16px;border:1px solid ${EMAIL_COLORS.border};border-radius:8px;">
        <div style="font-size:12px;color:${EMAIL_COLORS.muted};margin-bottom:4px;">${escapeHtml(m.label)}</div>
        <div style="font-size:20px;font-weight:700;color:${color};">${escapeHtml(m.value)}</div>
      </td><td style="width:8px;"></td>`;
    })
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:separate;"><tr>${cells}</tr></table>`;
}

/** Warning panel: text carries the meaning, the border reinforces it. */
export function warningPanel(title: string, body: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr>
    <td style="padding:14px 16px;border:1px solid ${EMAIL_COLORS.amber};border-left-width:4px;border-radius:8px;">
      <div style="font-size:14px;font-weight:700;color:${EMAIL_COLORS.carbon};margin-bottom:4px;">${escapeHtml(title)}</div>
      <div style="font-size:14px;line-height:1.5;color:${EMAIL_COLORS.body};">${escapeHtml(body)}</div>
    </td></tr></table>`;
}

/** Section heading inside a longer email (weekly report). */
export function sectionHeading(text: string): string {
  return `<h2 style="margin:22px 0 10px;font-size:15px;font-weight:700;letter-spacing:0.02em;color:${EMAIL_COLORS.carbon};">${escapeHtml(text)}</h2>`;
}

export function listItems(items: string[]): string {
  if (items.length === 0) return "";
  const lis = items
    .map(
      (i) =>
        `<li style="margin:0 0 6px;font-size:14px;line-height:1.5;color:${EMAIL_COLORS.body};">${escapeHtml(i)}</li>`,
    )
    .join("");
  return `<ul style="margin:0 0 14px;padding-left:20px;">${lis}</ul>`;
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export interface LifecycleShellOptions {
  previewText: string;
  bodyHtml: string;
  organizationName?: string | null;
  /** Show the preference-management footer (all optional classes). */
  showPreferenceFooter: boolean;
  /** Sender label in the header. Reports use "Fajita Reports". */
  senderLabel?: string;
}

export function lifecycleShell(opts: LifecycleShellOptions): string {
  const orgLabel = opts.organizationName
    ? `<span style="font-size:13px;color:#b8ae9c;">${escapeHtml(opts.organizationName)}</span>`
    : "";

  const preferenceFooter = opts.showPreferenceFooter
    ? `<p style="margin:0 0 6px;font-size:12px;color:${EMAIL_COLORS.faint};">
        You can choose which of these emails you receive.
        <a href="${appLink(PREFERENCES_PATH)}" style="color:${EMAIL_COLORS.muted};">Manage email preferences</a>
      </p>`
    : `<p style="margin:0 0 6px;font-size:12px;color:${EMAIL_COLORS.faint};">
        This is a service message about your Fajita account.
      </p>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>Fajita</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_COLORS.cream};color:${EMAIL_COLORS.carbon};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(opts.previewText)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_COLORS.cream};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${EMAIL_COLORS.surface};border-radius:12px;border:1px solid ${EMAIL_COLORS.border};">
      <tr><td style="padding:20px 28px;background:${EMAIL_COLORS.carbon};border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:17px;font-weight:800;letter-spacing:0.04em;color:#ffffff;">${escapeHtml(opts.senderLabel ?? "Fajita")}</td>
          <td align="right">${orgLabel}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:28px;">${opts.bodyHtml}</td></tr>
      <tr><td style="padding:18px 28px 26px;border-top:1px solid ${EMAIL_COLORS.border};">
        ${preferenceFooter}
        <p style="margin:0;font-size:12px;color:${EMAIL_COLORS.faint};">Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Plain-text footer matching the shell footer. */
export function textFooter(showPreferenceFooter: boolean): string {
  const lines = ["", "----"];
  if (showPreferenceFooter) {
    lines.push(`Manage email preferences: ${appLink(PREFERENCES_PATH)}`);
  } else {
    lines.push("This is a service message about your Fajita account.");
  }
  lines.push("Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901");
  return lines.join("\n");
}
