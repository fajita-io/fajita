/**
 * Inline markup parser for documentation text.
 *
 * Supports a deliberately tiny, safe subset:
 *   `code`        -> inline code segment
 *   [label](href) -> link
 *
 * No raw HTML is ever produced or interpreted. Link hrefs are restricted to
 * internal paths ("/...", "#...") and https URLs; anything else renders as
 * plain text so a malformed or unsafe href can never become an href attribute.
 */

export type InlineSegment =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string; external: boolean };

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const CODE_RE = /`([^`]+)`/g;

function isSafeHref(href: string): { ok: boolean; external: boolean } {
  if (href.startsWith("/") || href.startsWith("#")) {
    return { ok: true, external: false };
  }
  if (href.startsWith("https://")) {
    return { ok: true, external: true };
  }
  return { ok: false, external: false };
}

/**
 * Parse a string into ordered inline segments. Links are matched first, then
 * inline code inside the remaining text spans.
 */
export function parseInline(input: string): InlineSegment[] {
  const segments: InlineSegment[] = [];

  const pushText = (value: string) => {
    if (!value) return;
    let last = 0;
    CODE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = CODE_RE.exec(value)) !== null) {
      if (m.index > last) {
        segments.push({ type: "text", value: value.slice(last, m.index) });
      }
      segments.push({ type: "code", value: m[1] });
      last = m.index + m[0].length;
    }
    if (last < value.length) {
      segments.push({ type: "text", value: value.slice(last) });
    }
  };

  let last = 0;
  LINK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LINK_RE.exec(input)) !== null) {
    if (match.index > last) pushText(input.slice(last, match.index));
    const label = match[1];
    const href = match[2].trim();
    const safety = isSafeHref(href);
    if (safety.ok) {
      segments.push({ type: "link", label, href, external: safety.external });
    } else {
      pushText(match[0]);
    }
    last = match.index + match[0].length;
  }
  if (last < input.length) pushText(input.slice(last));

  return segments;
}

/** Strip inline markup to readable plain text (raw routes, llms, search). */
export function inlineToPlainText(input: string): string {
  return parseInline(input)
    .map((seg) => (seg.type === "link" ? seg.label : seg.value))
    .join("");
}
