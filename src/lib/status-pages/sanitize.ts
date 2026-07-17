/**
 * Public content sanitization. Everything a customer types that becomes
 * publicly visible passes through here. We never trust input just because an
 * authenticated customer entered it: status pages are an impersonation and
 * phishing target.
 *
 * Policy: plain text plus a tiny, safe inline subset (bold, italic, safe
 * links). No raw HTML, no script, no style, no iframe/form/object/embed, no
 * data: or javascript: URLs, no remote images, no event handlers. Pure and
 * client-safe.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** Collapse whitespace, strip control characters, and clamp length. */
export function sanitizePlainText(
  value: string | null | undefined,
  maxLength = 2000,
): string {
  if (!value) return "";
  const cleaned = value
    .replace(CONTROL_CHARS, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength).trim() : cleaned;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only http(s) and mailto links are allowed in public content. */
export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed)) return true;
  return false;
}

/**
 * Render a bounded safe subset to HTML. Input is escaped first, so only the
 * markup we deliberately emit can appear. Supports paragraphs, single line
 * breaks, unordered list items (`- item`), **bold**, *italic*, and
 * `[label](https://...)` / bare safe URLs. Everything else renders as text.
 */
export function renderSafeRichText(
  value: string | null | undefined,
  maxLength = 4000,
): string {
  const text = sanitizePlainText(value, maxLength);
  if (!text) return "";

  const blocks = text.split(/\n{2,}/);
  const html: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const isList = lines.every((l) => /^\s*-\s+/.test(l));
    if (isList) {
      const items = lines
        .map((l) => l.replace(/^\s*-\s+/, ""))
        .map((l) => `<li>${renderInline(l)}</li>`)
        .join("");
      html.push(`<ul class="fj-sp-prose__list">${items}</ul>`);
    } else {
      const withBreaks = lines.map((l) => renderInline(l)).join("<br />");
      html.push(`<p>${withBreaks}</p>`);
    }
  }
  return html.join("");
}

function renderInline(raw: string): string {
  let out = escapeHtml(raw);

  // [label](url) with an allowlisted protocol.
  out = out.replace(
    /\[([^\]]{1,200})\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    (match, label: string, url: string) => {
      if (!isSafeUrl(url)) return escapeHtml(label);
      return `<a href="${escapeHtml(url)}" rel="nofollow noopener noreferrer" target="_blank">${label}</a>`;
    },
  );

  // Bare http(s) URLs not already inside an anchor href.
  out = out.replace(/(^|[\s(])((?:https?:\/\/)[^\s<]+)/g, (m, pre: string, url: string) => {
    if (out.includes(`href="${escapeHtml(url)}`)) return m;
    if (!isSafeUrl(url)) return m;
    return `${pre}<a href="${escapeHtml(url)}" rel="nofollow noopener noreferrer" target="_blank">${escapeHtml(url)}</a>`;
  });

  // Emphasis. Applied after escaping and linking so markers are literal.
  out = out.replace(/\*\*([^*]{1,200})\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]{1,200})\*/g, "$1<em>$2</em>");

  return out;
}
