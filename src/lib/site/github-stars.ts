import { OSS_GITHUB_SLUG } from "@/lib/site/oss-config";

const REVALIDATE_SECONDS = 60;
const CACHE_TAGS = ["github-stars"] as const;

function githubAuthToken(): string | undefined {
  return (
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.FAJITA_GITHUB_TOKEN ||
    undefined
  );
}

/**
 * Parse shields.io star badge message/value strings.
 * Accepts plain integers ("19") and compact suffixes ("1.2k", "3M").
 * Returns null on empty/invalid input so callers never show a wrong low count.
 */
export function parseShieldsStarCount(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  const match = /^(\d+(?:\.\d+)?)([km])?$/i.exec(trimmed);
  if (!match) return null;

  const base = Number(match[1]);
  if (!Number.isFinite(base) || base < 0) return null;

  const suffix = match[2]?.toLowerCase();
  if (suffix === "k") return Math.round(base * 1_000);
  if (suffix === "m") return Math.round(base * 1_000_000);
  return Math.round(base);
}

async function fetchStarCountFromGitHub(): Promise<number | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "fajita-io-site",
    };

    const token = githubAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${OSS_GITHUB_SLUG}`,
      {
        next: { revalidate: REVALIDATE_SECONDS, tags: [...CACHE_TAGS] },
        headers,
      },
    );

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (
      typeof payload === "object" &&
      payload !== null &&
      "stargazers_count" in payload &&
      typeof payload.stargazers_count === "number" &&
      Number.isFinite(payload.stargazers_count) &&
      payload.stargazers_count >= 0
    ) {
      return payload.stargazers_count;
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchStarCountFromShields(): Promise<number | null> {
  try {
    const response = await fetch(
      `https://img.shields.io/github/stars/${OSS_GITHUB_SLUG}.json`,
      {
        next: { revalidate: REVALIDATE_SECONDS, tags: [...CACHE_TAGS] },
        headers: {
          Accept: "application/json",
          "User-Agent": "fajita-io-site",
        },
      },
    );

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null) return null;

    const message =
      "message" in payload && typeof payload.message === "string"
        ? payload.message
        : null;
    const value =
      "value" in payload && typeof payload.value === "string"
        ? payload.value
        : null;

    const raw = message ?? value;
    if (!raw) return null;

    return parseShieldsStarCount(raw);
  } catch {
    return null;
  }
}

/**
 * Public repo star count for the header widget.
 * Prefers the GitHub API (authenticated when a token is present), then falls
 * back to shields.io so shared-IP rate limits cannot blank or stale the badge.
 * Revalidates every 60s.
 */
export async function getGitHubStarCount(): Promise<number | null> {
  const fromGitHub = await fetchStarCountFromGitHub();
  if (fromGitHub !== null) return fromGitHub;
  return fetchStarCountFromShields();
}

export function formatGitHubStarCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (count >= 10_000) {
    return `${Math.round(count / 1_000)}k`;
  }

  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value.toFixed(1).replace(/\.0$/, "")}k`;
  }

  return count.toLocaleString("en-US");
}
