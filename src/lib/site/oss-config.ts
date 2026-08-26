/**
 * Open-source public site configuration. Centralizes launch gating, GitHub
 * URLs, and deployment-path copy so components do not scatter env checks.
 */

export const OSS_GITHUB_ORG = "Accomplish-Labs";
export const OSS_GITHUB_REPO = "fajita-io";
export const OSS_GITHUB_SLUG = `${OSS_GITHUB_ORG}/${OSS_GITHUB_REPO}`;

export const OSS_GITHUB_URL = `https://github.com/${OSS_GITHUB_SLUG}`;
export const OSS_GITHUB_LICENSE_URL = `${OSS_GITHUB_URL}/blob/main/LICENSE`;
export const OSS_GITHUB_SECURITY_URL = `${OSS_GITHUB_URL}/blob/main/SECURITY.md`;
export const OSS_GITHUB_CONTRIBUTING_URL = `${OSS_GITHUB_URL}/blob/main/CONTRIBUTING.md`;
export const OSS_GITHUB_CHANGELOG_URL = `${OSS_GITHUB_URL}/blob/main/CHANGELOG.md`;
export const OSS_GITHUB_ROADMAP_URL = `${OSS_GITHUB_URL}/blob/main/ROADMAP.md`;
export const OSS_GITHUB_DISCUSSIONS_URL = `${OSS_GITHUB_URL}/discussions`;
export const OSS_GITHUB_RELEASES_URL = `${OSS_GITHUB_URL}/releases`;

export const OSS_LICENSE = "AGPL-3.0";
export const OSS_INITIAL_VERSION = "0.1.0";

export const OSS_TRADEMARKS_URL = `${OSS_GITHUB_URL}/blob/main/TRADEMARKS.md`;

/** Public marketing routes for the OSS launch surface. */
export const OSS_ROUTES = {
  openSource: "/open-source",
  selfHost: "/self-host",
  selfHostDocs: "/docs/self-hosting/quickstart",
  architectureDocs: "/docs/open-source/architecture",
} as const;

/**
 * When false (default), OSS pages ship with noindex, are omitted from the
 * sitemap, and GitHub CTAs stay hidden until launch day.
 */
export function isOssLaunched(): boolean {
  return process.env.NEXT_PUBLIC_OSS_LAUNCHED === "true";
}

/** Whether OSS marketing routes should be indexed and linked in nav. */
export function ossPublicVisible(): boolean {
  return isOssLaunched();
}

/** GitHub links visible when OSS launch flag is on (repository is public). */
export function ossGitHubVisible(): boolean {
  return isOssLaunched();
}

/** Metadata noindex for pre-launch OSS pages. */
export function ossNoindexWhenHidden(): boolean {
  return !isOssLaunched();
}
