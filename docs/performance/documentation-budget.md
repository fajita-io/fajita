# Documentation performance budget

Internal. Performance targets and measured facts for the documentation platform.

**Date:** 2026-07-17

## Design decisions that set the budget

- `/docs` is static; `/docs/[...slug]` and `/docs/raw/[...slug]` are SSG.
- The search corpus is server-side; it never ships in a page bundle. The search
  dialog loads results only when opened.
- Interactive client components are limited to search, code copy, tabs, and
  feedback. No application bundle, billing SDK, monitoring SDK, or chatbot.
- Screenshots (when captured) use fixed dimensions and lazy loading; the LCP
  asset is not lazy-loaded.
- `llms.txt` stays small; `llms-full.txt` and raw routes set long cache headers
  and are CDN-cacheable.

## Measured facts (production build, 2026-07-17)

| Fact | Value |
| --- | --- |
| Docs page First Load JS (`/docs/[...slug]`) | ~110 kB (near shared baseline ~102 kB) |
| Landing (`/docs`) First Load JS | ~106 kB |
| Static pages generated (whole app) | 233, including all docs slugs and raw pages |
| `llms.txt` / `llms-full.txt` / `manifest.json` | Route handlers, long cache headers |

## Targets

| Metric | Target |
| --- | --- |
| LCP (mobile) | <= 2.5s |
| INP | <= 200ms |
| CLS | <= 0.1 |
| Search first result after index load | fast, sub-second on server |
| Docs JS | Significantly below the authenticated app bundle |

## Not yet measured

Field Core Web Vitals and search latency under load are pending a deployed
environment. See `docs/testing/phase-13-load-results.md` for the plan and what
is deferred. No performance claim is published without evidence.
