import { SiteHeaderContent } from "@/components/site/site-header-content";

/**
 * Global navigation. Fully static so marketing pages can cache at the edge.
 * Active-route state and GitHub star counts hydrate in small client islands.
 */
export function SiteHeader() {
  return <SiteHeaderContent />;
}
