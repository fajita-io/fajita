import { sanitizeAnswerHref } from "./links";

/**
 * Minimal Markdown subset for chat answers. Not a full MD engine.
 * Strips HTML, scripts, and unsafe URLs.
 */
export function renderSafeChatMarkdown(input: string): string {
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  let out = escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
    const safe = sanitizeAnswerHref(href);
    if (!safe) return label;
    const external = safe.startsWith("https://");
    const rel = external ? ' rel="noopener noreferrer" target="_blank"' : "";
    return `<a href="${safe}"${rel}>${label}</a>`;
  });

  out = out
    .split("\n")
    .map((line) => {
      if (/^-\s+/.test(line)) return `<li>${line.replace(/^-\s+/, "")}</li>`;
      return line;
    })
    .join("\n");

  out = out.replace(/(?:<li>.*<\/li>\n?)+/g, (block) => `<ul>${block}</ul>`);
  out = out
    .split(/\n{2,}/)
    .map((p) => (p.startsWith("<ul>") ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
    .join("");

  return out;
}

export function stripEmDashes(text: string): string {
  return text.replace(/\u2014/g, ",").replace(/\u2013/g, "-");
}

export function containsEmDash(text: string): boolean {
  return /\u2014|\u2013/.test(text);
}
