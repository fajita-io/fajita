/**
 * Production URLs for links in outbound email. Never use `appUrl` from env:
 * local and preview hosts are unreachable from customer inboxes.
 */
export const EMAIL_LINK_ORIGIN = "https://fajita.io";

/** Build an absolute Fajita app URL for email CTAs, footers, and headers. */
export function emailAppLink(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${EMAIL_LINK_ORIGIN}${clean}`;
}
