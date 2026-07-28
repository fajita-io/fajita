import { headers } from "next/headers";

import { SiteHeaderContent } from "@/components/site/site-header-content";

/**
 * Global navigation. Server-rendered shell with a small client island for
 * the features menu and scroll styling.
 */
export async function SiteHeader() {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  return <SiteHeaderContent pathname={pathname} />;
}
