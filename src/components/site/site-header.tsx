import { SiteHeaderContent } from "@/components/site/site-header-content";

/**
 * Global navigation. Star count is fetched on the server (60s revalidate) so
 * first paint is correct; the live client island refreshes from /api/github/stars.
 */
export function SiteHeader() {
  return <SiteHeaderContent />;
}
