# Documentation AI-readable files

Internal. `llms.txt`, `llms-full.txt`, and the manifest.

**Date:** 2026-07-17

## Files and placement

| Route | Content |
| --- | --- |
| `/llms.txt` | Site-root concise index; product summary plus docs pointer |
| `/llms-full.txt` | Site-root full public corpus as text |
| `/docs/llms.txt` | Docs concise index |
| `/docs/llms-full.txt` | Docs full corpus (same corpus as root) |
| `/docs/manifest.json` | Machine-readable page manifest |

Root and docs full-text files share one corpus so there is a single source of
truth.

## Corpus selection

All AI-readable output is generated from `llmDocs()`: pages that are
`status: "published"`, not `noindex`, and `llmInclude: true`. Drafts, internal
pages, deprecated pages, and noindex pages are excluded. Tests assert this
invariant.

## `llms.txt`

Contains the product summary, who it is for, core product areas, a documentation
index with canonical links, key concepts, security guidance, support contact
per company identity, and the last-updated date. It stays small.

## `llms-full.txt`

Contains the full approved public content as text with stable headings,
canonical URLs, content version, and last-reviewed dates. No navigation chrome,
no scripts, no private data, no internal or draft content. Responses set long
cache headers.

## Manifest

`/docs/manifest.json` lists product, docs version, generated-at, and per page:
title, canonical URL, description, product area, content type, last reviewed,
product version, deprecated flag, replacement URL, plain-text URL, and a content
hash. It exposes no repository paths and no owner emails.

## Safety

The validation script scans the generated corpus for em dashes, phase numbers,
internal terms, and secret patterns and fails the build on any match.
