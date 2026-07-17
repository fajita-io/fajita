# Phase 13 test matrix

Internal. What was tested for the documentation platform and how.

**Date:** 2026-07-17

## Automated (unit, `src/lib/docs/platform.test.ts`)

| Area | Covered |
| --- | --- |
| Registry | Loads, unique slugs, related pages resolve, frontmatter validates |
| Navigation | Grouped by model; prev/next covers ordered public slugs |
| AI corpus | Only published, indexable, LLM-eligible pages; no em dash, phase number, internal terms, secret patterns |
| Raw output | Canonical present; no script tags |
| Webhook signatures | Node example verified against real signer: accepts genuine, rejects tamper, rejects stale timestamp |
| Search | Exact-title ranking, synonym (cron to heartbeat), typo tolerance, empty query, troubleshooting precedence |
| Redaction | Emails, URLs, secret-like tokens replaced; length capped |
| Inline safety | Unsafe link schemes not linked |

## Automated (validation, `npm run docs:validate`)

Frontmatter completeness, related-link resolution, internal-link resolution,
screenshot alt text, AI-corpus exclusion, and secret/internal-term scanning.
Result: pass (70 pages).

## Build and type

Typecheck clean; lint warnings only; production build succeeds; `/docs` static,
`/docs/[...slug]` and `/docs/raw/[...slug]` SSG (233 static pages total).

## Runtime smoke (production server)

| Route | Result |
| --- | --- |
| `/docs` | 200 |
| `/docs/getting-started/create-your-first-monitor` | 200 |
| `/docs/webhooks/signatures` | 200 |
| `/docs/llms.txt`, `/docs/llms-full.txt` | 200, clean text, no secrets |
| `/docs/manifest.json` | 200, valid JSON, 70 pages |
| `/docs/raw/webhooks/signatures` | 200, plain text with canonical |
| `/api/docs/search?q=verify%20webhook` | 200, exact match ranked first |
| `/api/docs/search?q=<secret-like>` | 200, empty results |
| `/internal/docs` | 404 unauthenticated (guard verified) |
| `robots.txt` | disallows `/api/`, `/internal/`, `/docs/raw/` |
| `sitemap.xml` | includes `/docs` and all public pages |

## Deferred (documented, not run here)

Full end-to-end browser matrix, screen-reader passes, 200 percent zoom and
reduced-motion visual review, cross-browser regression, and load tests require
a deployed environment or the fixture app. See the handoff for the list.
