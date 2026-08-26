import { headers } from "next/headers";

import { SiteHeaderContent } from "@/components/site/site-header-content";
import { getGitHubStarCount } from "@/lib/site/github-stars";
import { ossGitHubVisible } from "@/lib/site/oss-config";

/**
 * Global navigation. Server-rendered shell with a small client island for
 * the features menu and scroll styling.
 */
export async function SiteHeader() {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const githubStarCount = ossGitHubVisible() ? await getGitHubStarCount() : null;

  return (
    <SiteHeaderContent pathname={pathname} githubStarCount={githubStarCount} />
  );
}
