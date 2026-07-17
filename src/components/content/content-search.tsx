"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import type { ContentSearchHit } from "@/lib/content/search";

export function ContentSearch({
  placeholder = "Search articles, comparisons, and tools",
}: {
  placeholder?: string;
}) {
  const listId = useId();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ContentSearchHit[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const handle = setTimeout(async () => {
      trackGoal(DataFastGoals.contentSearchSubmitted, {
        len: String(q.trim().length),
      });
      const res = await fetch(
        `/api/content/search?q=${encodeURIComponent(q.trim())}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { hits: ContentSearchHit[] };
      setHits(data.hits);
      setOpen(true);
      if (!data.hits.length) {
        trackGoal(DataFastGoals.contentSearchNoResult, {
          len: String(q.trim().length),
        });
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="fj-content-search">
      <label className="fj-content-search__label">
        <span className="fj-sr-only">Search content</span>
        <input
          type="search"
          value={q}
          placeholder={placeholder}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setOpen(true);
            trackGoal(DataFastGoals.contentSearchOpened);
          }}
          aria-controls={listId}
          autoComplete="off"
        />
      </label>
      {open && hits.length > 0 ? (
        <ul id={listId} className="fj-content-search__list">
          {hits.map((hit) => (
            <li key={`${hit.type}-${hit.slug}`}>
              <Link
                href={hit.href}
                onClick={() =>
                  trackGoal(DataFastGoals.contentSearchResultSelected, {
                    type: hit.type,
                  })
                }
              >
                <span className="fj-content-search__type">{hit.type}</span>
                {hit.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
