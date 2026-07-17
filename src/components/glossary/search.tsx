"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

interface Hit {
  slug: string;
  term: string;
  shortDefinition: string;
  categoryLabel: string;
  score: number;
  anchor?: string;
}

export function GlossarySearch({
  autoFocus = false,
  variant = "trigger",
}: {
  autoFocus?: boolean;
  variant?: "trigger" | "inline";
}) {
  const [open, setOpen] = useState(variant === "inline" || autoFocus);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && variant === "trigger") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && variant === "trigger") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  useEffect(() => {
    if (open) {
      trackGoal(DataFastGoals.glossarySearchOpened);
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
        const res = await fetch(`/api/glossary/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results: Hit[] };
        if (!cancelled) {
          setResults(data.results);
          setActive(0);
          trackGoal(DataFastGoals.glossarySearchSubmitted, {
            results: String(data.results.length),
          });
          if (data.results.length === 0) {
            trackGoal(DataFastGoals.glossarySearchNoResult);
          }
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
    (hit: Hit) => {
      trackGoal(DataFastGoals.glossarySearchResultSelected, { slug: hit.slug });
      if (variant === "trigger") {
        setOpen(false);
        setQuery("");
      }
      router.push(`/glossary/${hit.slug}${hit.anchor ? `#${hit.anchor}` : ""}`);
    },
    [router, variant],
  );

  const panel = (
    <div className="fj-glossary-search__panel">
      <label className="fj-sr-only" htmlFor="glossary-search-input">
        Search the glossary
      </label>
      <input
        id="glossary-search-input"
        ref={inputRef}
        className="fj-glossary-search__input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search terms, acronyms, synonyms…"
        autoComplete="off"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            go(results[active]);
          }
        }}
      />
      {loading ? <p className="fj-glossary-search__status">Searching…</p> : null}
      {query.trim().length >= 2 && !loading && results.length === 0 ? (
        <p className="fj-glossary-search__status">
          No terms matched. Try a synonym or browse by category.
        </p>
      ) : null}
      {results.length > 0 ? (
        <ul className="fj-glossary-search__results" role="listbox">
          {results.map((hit, i) => (
            <li key={hit.slug} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={
                  i === active
                    ? "fj-glossary-search__hit fj-glossary-search__hit--active"
                    : "fj-glossary-search__hit"
                }
                onClick={() => go(hit)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="fj-glossary-search__hit-term">{hit.term}</span>
                <span className="fj-glossary-search__hit-cat">{hit.categoryLabel}</span>
                <span className="fj-glossary-search__hit-def">{hit.shortDefinition}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {variant === "inline" ? (
        <p className="fj-glossary-search__hint">
          Or <Link href="/glossary">browse all terms</Link>
        </p>
      ) : null}
    </div>
  );

  if (variant === "inline") {
    return <div className="fj-glossary-search fj-glossary-search--inline">{panel}</div>;
  }

  return (
    <>
      <button
        type="button"
        className="fj-docs-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search the glossary"
      >
        <span>Search the glossary</span>
        <kbd className="fj-docs-search-trigger__kbd">Ctrl K</kbd>
      </button>
      {open ? (
        <div
          className="fj-docs-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Glossary search"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="fj-docs-search-modal fj-glossary-search">{panel}</div>
        </div>
      ) : null}
    </>
  );
}
