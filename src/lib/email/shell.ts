/**
 * Shared Fajita email chrome: table layout, brand tokens, and the Memo
 * attribution tag. Lifecycle, subscriber, and alert renderers compose body
 * content into this shell.
 */

import { appUrl } from "@/lib/env";

export const MEMO_URL = "https://memo.ly";

/** PNG lockups for clients that block SVG (Outlook, Gmail). */
export const FAJITA_EMAIL_LOGO_URL = `${appUrl}/brand/email/fajita-logo-header-dark.png`;
/** Same mark as memo.ly/brand/icon.svg, hosted for PNG email support. */
export const MEMO_EMAIL_ICON_URL = `${appUrl}/brand/email/memo-icon.png`;

/** Brand literals for email clients (mirrors src/styles/tokens.css). */
export const EMAIL_COLORS = {
  carbon: "#17130e",
  soot: "#3e382f",
  body: "#333330",
  muted: "#6f6a60",
  faint: "#8a8578",
  footerMuted: "#5c544a",
  cream: "#fffdf7",
  creamInset: "#faf5ea",
  surface: "#ffffff",
  border: "#e8e2d4",
  ember: "#b53a0a",
  emberDark: "#8a2c07",
  pepper: "#a61e1e",
  green: "#2b8a3e",
  amber: "#7a5200",
} as const;

export const EMAIL_FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Centered "Powered by Memo" pill linking to memo.ly. */
export function poweredByMemoHtml(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 0;">
  <tr><td align="center">
    <a href="${MEMO_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0db;border-radius:999px;background:#f9f9f7;">
        <tr><td style="padding:7px 14px 7px 10px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;line-height:0;padding-right:8px;">
              <img src="${MEMO_EMAIL_ICON_URL}" width="18" height="18" alt="" style="display:block;border:0;border-radius:4px;width:18px;height:18px;" />
            </td>
            <td style="font-family:${EMAIL_FONT};font-size:13px;line-height:1.2;color:#666666;white-space:nowrap;vertical-align:middle;">
              Powered by <strong style="color:#111111;font-weight:700;">Memo</strong>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </a>
  </td></tr>
</table>`;
}

export function poweredByMemoText(): string {
  return `Powered by Memo: ${MEMO_URL}`;
}

export interface FajitaHeaderOptions {
  /** Image alt text. Defaults to Fajita. */
  label?: string;
  rightHtml?: string;
}

/** Dark header row with the site horizontal logo lockup. */
export function fajitaHeaderHtml(opts: FajitaHeaderOptions = {}): string {
  const alt = escapeHtml(opts.label ?? "Fajita");
  const right = opts.rightHtml ?? "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="vertical-align:middle;">
      <a href="${escapeHtml(appUrl)}" style="text-decoration:none;display:inline-block;line-height:0;">
        <img src="${FAJITA_EMAIL_LOGO_URL}" width="110" height="38" alt="${alt}" style="display:block;border:0;outline:none;text-decoration:none;width:110px;max-width:110px;height:auto;" />
      </a>
    </td>
    <td align="right" style="vertical-align:middle;">${right}</td>
  </tr></table>`;
}

export interface EmailShellOptions {
  previewText: string;
  bodyHtml: string;
  headerHtml: string;
  footerHtml: string;
  /** Document title attribute; defaults to Fajita. */
  title?: string;
}

/**
 * Learn Domains-style card on cream: dark header, white body, inset footer,
 * centered Memo tag below footer copy (still inside the card).
 */
export function emailShell(opts: EmailShellOptions): string {
  const title = escapeHtml(opts.title ?? "Fajita");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_COLORS.cream};color:${EMAIL_COLORS.carbon};font-family:${EMAIL_FONT};">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(opts.previewText)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_COLORS.cream};">
  <tr><td align="center" style="padding:28px 16px;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${EMAIL_COLORS.surface};border-radius:12px;border:1px solid ${EMAIL_COLORS.border};overflow:hidden;">
      <tr><td style="padding:18px 28px;background:${EMAIL_COLORS.carbon};">
        ${opts.headerHtml}
      </td></tr>
      <tr><td style="padding:32px 32px 28px;">${opts.bodyHtml}</td></tr>
      <tr><td style="padding:20px 32px 24px;background:${EMAIL_COLORS.creamInset};border-top:1px solid ${EMAIL_COLORS.border};">
        ${opts.footerHtml}
        ${poweredByMemoHtml()}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Bulletproof ember CTA button (brand primary action). */
export function emberButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 8px;"><tr>
    <td align="center" style="border-radius:10px;background:${EMAIL_COLORS.ember};">
      <a href="${escapeHtml(url)}" style="display:block;padding:14px 24px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;text-align:center;font-family:${EMAIL_FONT};">${escapeHtml(label)}</a>
    </td></tr></table>`;
}

/** Accent-colored CTA for customer-branded subscriber mail. */
export function accentButton(label: string, url: string, accent: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 8px;"><tr>
    <td align="center" style="border-radius:10px;background:${accent};">
      <a href="${escapeHtml(url)}" style="display:block;padding:14px 24px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;text-align:center;font-family:${EMAIL_FONT};">${escapeHtml(label)}</a>
    </td></tr></table>`;
}
