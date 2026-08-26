import { OSS_GITHUB_SLUG } from "@/lib/site/oss-config";

/** Public repo metadata for the header star widget. Revalidates hourly. */
export async function getGitHubStarCount(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${OSS_GITHUB_SLUG}`, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "fajita-io-site",
      },
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (
      typeof payload === "object" &&
      payload !== null &&
      "stargazers_count" in payload &&
      typeof payload.stargazers_count === "number"
    ) {
      return payload.stargazers_count;
    }

    return null;
  } catch {
    return null;
  }
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
