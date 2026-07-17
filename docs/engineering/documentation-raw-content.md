# Documentation raw content routes

Internal. Plain-text representations of documentation pages.

**Date:** 2026-07-17

## Route

`/docs/raw/[...slug]` serves a single page as plain text (Markdown-flavored).
It is SSG with `dynamicParams = false` and additionally allowlisted to
LLM-eligible pages (`llmDocs()`), so only approved public content is reachable.
Unknown or non-eligible slugs return 404.

## Content

Each response is `pageToPlainText(page)`: a heading, the description, a metadata
header (canonical URL, docs version, product version, last reviewed), then the
serialized body. No layout markup, no scripts, no internal frontmatter (owner,
reviewers), and no repository paths.

## Headers and caching

Responses are `text/plain; charset=utf-8` with long cache headers so they are
CDN-cacheable. They are linked from the manifest as each page's `plainTextUrl`.

## Indexing

`/docs/raw/` is disallowed in `robots.txt` so plain-text duplicates are not
indexed as competing content, while remaining available to agents and tools
that request them directly.
