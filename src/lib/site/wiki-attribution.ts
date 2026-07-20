/** Public marketing routes that show the Powered by Wiki attribution. */
export const WIKI_ATTRIBUTION_INFO_PREFIXES = [
  "/about",
  "/security",
  "/contact",
  "/support",
  "/changelog",
  "/roadmap",
  "/status",
  "/integrations",
  "/features",
] as const;

export const WIKI_URL = "https://wiki.co";

export function shouldShowWikiAttributionOnSite(pathname: string): boolean {
  return WIKI_ATTRIBUTION_INFO_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
