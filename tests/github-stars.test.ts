import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatGitHubStarCount,
  getGitHubStarCount,
  parseShieldsStarCount,
} from "@/lib/site/github-stars";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("formatGitHubStarCount", () => {
  it("formats sub-thousand counts with grouping", () => {
    expect(formatGitHubStarCount(19)).toBe("19");
    expect(formatGitHubStarCount(999)).toBe("999");
  });

  it("formats thousands and millions compactly", () => {
    expect(formatGitHubStarCount(1_000)).toBe("1k");
    expect(formatGitHubStarCount(1_200)).toBe("1.2k");
    expect(formatGitHubStarCount(12_500)).toBe("13k");
    expect(formatGitHubStarCount(1_000_000)).toBe("1M");
    expect(formatGitHubStarCount(2_500_000)).toBe("2.5M");
  });
});

describe("parseShieldsStarCount", () => {
  it("parses plain integers and compact suffixes", () => {
    expect(parseShieldsStarCount("19")).toBe(19);
    expect(parseShieldsStarCount("1.2k")).toBe(1_200);
    expect(parseShieldsStarCount("3M")).toBe(3_000_000);
  });

  it("returns null for invalid values instead of a wrong low number", () => {
    expect(parseShieldsStarCount("")).toBeNull();
    expect(parseShieldsStarCount("n/a")).toBeNull();
    expect(parseShieldsStarCount("stars")).toBeNull();
  });
});

describe("getGitHubStarCount", () => {
  it("uses the GitHub API when available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("api.github.com")) {
          return Response.json({ stargazers_count: 19 });
        }
        throw new Error(`unexpected fetch: ${url}`);
      }),
    );

    await expect(getGitHubStarCount()).resolves.toBe(19);
  });

  it("falls back to shields.io when GitHub is rate-limited", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("api.github.com")) {
          return new Response("rate limited", { status: 403 });
        }
        if (url.includes("img.shields.io")) {
          return Response.json({
            label: "stars",
            message: "19",
            value: "19",
          });
        }
        throw new Error(`unexpected fetch: ${url}`);
      }),
    );

    await expect(getGitHubStarCount()).resolves.toBe(19);
  });

  it("returns null when both sources fail to provide a parseable count", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("down", { status: 500 })),
    );

    await expect(getGitHubStarCount()).resolves.toBeNull();
  });

  it("sends Authorization when a GitHub token env is set", async () => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
    let capturedInit: RequestInit | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        capturedInit = init;
        return Response.json({ stargazers_count: 19 });
      }),
    );

    await expect(getGitHubStarCount()).resolves.toBe(19);

    expect(capturedInit).toBeDefined();
    const headers = new Headers(capturedInit?.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-token");
    expect(headers.get("Accept")).toBe("application/vnd.github+json");
    expect(headers.get("User-Agent")).toBe("fajita-io-site");
  });
});
