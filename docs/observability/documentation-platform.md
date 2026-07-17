# Documentation platform observability

Internal. Signals to watch for the documentation platform.

**Date:** 2026-07-17

## Build-time signals

| Signal | Source |
| --- | --- |
| Build success/failure | `npm run build` |
| Content validation pass/fail | `npm run docs:validate` |
| Duplicate slug / missing replacement | registry integrity (throws) |
| Broken internal link | validation script |
| Missing owner / review date | validation script |
| Stale page count | `health.ts` (`stalePages`, `healthSummary`) |

## Runtime signals

| Signal | Where |
| --- | --- |
| Page latency | Hosting metrics (static/SSG) |
| Search latency | `/api/docs/search` |
| No-result search rate | `docs_search_no_result` (redacted) |
| Feedback rate and negative-feedback pages | `docs_feedback` |
| LLM/raw request volume | Route handlers / hosting metrics |

## Internal ops view

`/internal/docs` (platform-admin) surfaces total pages, published/draft/
deprecated counts, and stale pages. `/internal/docs/feedback` lists recent
feedback for triage.

## Label hygiene

Never use raw search queries as metric labels. Use bounded labels only (page
slug, category, reason enum, version). This matches the platform logging policy.

## Deferred

A dedicated error-monitoring vendor is not wired for the docs surface; it
inherits the app's hosting logs. Alert thresholds are set with the platform
observability plan.
