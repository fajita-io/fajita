"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import type { SearchHit } from "@/lib/docs/search";

/**
 * Documentation search. Opens with Cmd/Ctrl+K or a button. The index is loaded
 * lazily via the search API only after the reader types, so no corpus ships in
 * the page bundle. Results are keyboard navigable.
 */
export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      trackGoal(DataFastGoals.docsSearchOpened);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/docs/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results: SearchHit[] };
        if (!cancelled) {
          setResults(data.results);
          setActive(0);
          trackGoal(DataFastGoals.docsSearchSubmitted, {
            results: String(data.results.length),
          });
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const go = useCallback(
    (hit: SearchHit) => {
      trackGoal(DataFastGoals.docsSearchResultSelected, { slug: hit.slug });
      setOpen(false);
      setQuery("");
      router.push(`/docs/${hit.slug}${hit.anchor ? `#${hit.anchor}` : ""}`);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        className="fj-docs-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
      >
        <span>Search docs</span>
        <kbd className="fj-docs-search-trigger__kbd">Ctrl K</kbd>
      </button>

      {open ? (
        <div
          className="fj-docs-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="fj-docs-search-panel">
            <input
              ref={inputRef}
              type="search"
              className="fj-docs-search-input"
              placeholder="Search the documentation"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                }
                if (e.key === "Enter" && results[active]) go(results[active]);
              }}
              aria-controls="fj-docs-search-results"
            />
            <ul id="fj-docs-search-results" className="fj-docs-search-results">
              {results.map((hit, i) => (
                <li key={hit.slug}>
                  <Link
                    href={`/docs/${hit.slug}${hit.anchor ? `#${hit.anchor}` : ""}`}
                    className={`fj-docs-search-result${i === active ? " is-active" : ""}`}
                    onClick={() => go(hit)}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className="fj-docs-search-result__title">{hit.title}</span>
                    <span className="fj-docs-search-result__cat">{hit.categoryLabel}</span>
                    <span className="fj-docs-search-result__desc">{hit.description}</span>
                  </Link>
                </li>
              ))}
              {query.trim().length >= 2 && !loading && results.length === 0 ? (
                <li className="fj-docs-search-empty">
                  No results for “{query}”. Try a different term or browse the categories.
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
