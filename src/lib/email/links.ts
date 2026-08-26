/**
 * Origin for absolute links in outbound email. Prefer EMAIL_LINK_ORIGIN when
 * set (Fajita Cloud). Falls back to NEXT_PUBLIC_APP_URL, then fajita.io.
 * Local and preview hosts are unreachable from customer inboxes; set
 * EMAIL_LINK_ORIGIN explicitly in production.
 */
export const EMAIL_LINK_ORIGIN = (
  process.env.EMAIL_LINK_ORIGIN?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://fajita.io"
).replace(/\/$/, "");

/** Build an absolute Fajita app URL for email CTAs, footers, and headers. */
export function emailAppLink(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${EMAIL_LINK_ORIGIN}${clean}`;
}
