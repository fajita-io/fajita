# Phase 13 load results

Internal. Load-test plan and status for the documentation platform.

**Date:** 2026-07-17

## Status

Load tests are planned but not executed in this environment. They require a
deployed target with CDN in front. No load numbers are fabricated. This file
records the plan and the reasoning so the tests can be run against staging or
production.

## Why the platform is expected to hold

- Public docs are static or SSG, so page serving is CDN-cacheable and does not
  hit application servers.
- Search is a single server route over an in-memory index built once; it does
  not query a database.
- `llms-full.txt`, `llms.txt`, `manifest.json`, and raw routes set long cache
  headers and are CDN-cacheable.
- Feedback is the only write path; it is rate-limited.

## Planned scenarios

| Scenario | Measure |
| --- | --- |
| 100 / 500 / 1,000 pages | Build time, page latency, memory |
| Search burst | Search latency, throughput |
| Docs launch traffic | CDN hit ratio, page latency |
| Webhook reference traffic | Page latency |
| `llms.txt` / `llms-full.txt` / raw traffic | Response time, cache behavior |
| Feedback submissions | Endpoint throughput, rate-limit behavior |

## Constraint

Do not generate abusive traffic against external links during load testing.

## Deferred to Phase 14 readiness

Run the scenarios against staging, record measured latencies and CDN hit
ratios, and update `docs/performance/documentation-budget.md` with field values.
