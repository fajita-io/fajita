# Documentation search

Internal. Search index, ranking, typo tolerance, synonyms, and query redaction.

**Date:** 2026-07-17

## Where search runs

Search runs server-side at `/api/docs/search?q=`. The full corpus is never
placed in a page bundle. The client dialog (`components/docs/search.tsx`) opens
on Cmd/Ctrl+K, debounces input, fetches results, and supports keyboard
navigation. The index is built once at module load from `publicDocs()`.

## Indexed fields

Per page the index stores title, description, category label, headings, body
text (from serialized blocks), keywords, page type, and search boost. Drafts,
deprecated pages, internal pages, and noindex pages are excluded.

## Ranking

Scores combine, in decreasing weight:

1. Exact title match
2. Heading match
3. Keyword match (error codes are keywords, so error-code queries rank their
   troubleshooting page)
4. Body match
5. Frontmatter `searchBoost`
6. Page-type nudge so task and troubleshooting pages rank above concepts for
   action and error queries

## Typo tolerance and synonyms

Short query tokens are matched within one edit (`withinOneEdit`). Synonyms live
in `src/lib/docs/synonyms.ts` and are versioned; queries are expanded before
scoring (for example `cron` and `job monitor` reach heartbeat, `outage` reaches
incident, `certificate` reaches SSL).

## Query redaction

`redactQuery` runs before any analytics logging. It replaces emails, URLs, and
credential-like tokens (bearer strings, `whsec_`/`sk_`-style values, long
high-entropy strings) with placeholders and caps length. Raw sensitive queries
are never stored. No-result queries are logged in redacted form to
`docs_search_no_result` for editorial review.

## Tests

`src/lib/docs/platform.test.ts` covers exact-title ranking, synonym resolution,
typo tolerance, empty-query behavior, troubleshooting precedence for error
queries, and redaction of emails, URLs, and secret-like tokens.
