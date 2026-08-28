"use client";

import { useEffect, useState } from "react";

import { GitHubStarLinkView } from "@/components/site/oss/github-star-link";

/**
 * Header star widget: paints the server count immediately, then refreshes
 * from /api/github/stars so the badge stays current without a full reload.
 */
export function GitHubStarLinkLive({
  initialStarCount = null,
  className,
}: {
  initialStarCount?: number | null;
  className?: string;
}) {
  const [starCount, setStarCount] = useState<number | null>(initialStarCount);

  useEffect(() => {
    setStarCount(initialStarCount);
  }, [initialStarCount]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch("/api/github/stars");
        if (!response.ok) return;

        const payload: unknown = await response.json();
        if (
          cancelled ||
          typeof payload !== "object" ||
          payload === null ||
          !("count" in payload) ||
          (payload.count !== null && typeof payload.count !== "number")
        ) {
          return;
        }

        setStarCount(payload.count);
      } catch {
        // Keep the server-rendered count when refresh fails.
      }
    }

    void refresh();

    return () => {
      cancelled = true;
    };
  }, []);

  return <GitHubStarLinkView starCount={starCount} className={className} />;
}
