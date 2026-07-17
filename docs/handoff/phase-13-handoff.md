# Phase 13 handoff: Documentation platform

Internal. What was built, verified, and deferred for the documentation platform.

**Date:** 2026-07-17
**Docs version:** `2026-07-17`
**Product version:** `2026.07`
**Supabase project:** `olvnjsqspvywvwfchtuc`

## Outcome

A production-quality public documentation platform built into the existing app.
Typed content, static rendering, server-side search, page feedback, versioning,
AI-readable files, a machine manifest, plain-text routes, and a platform-admin
editorial view. Navigation, search, sitemap, and AI files are generated from one
registry. 70 published pages covering the core information architecture.

## Built

- Route group `(docs)`: landing, `[...slug]` (SSG), raw `[...slug]` (SSG),
  `llms.txt`, `llms-full.txt`, `manifest.json`, plus root `llms*.txt`.
- APIs: `/api/docs/search` (server-side, redacted analytics), `/api/docs/feedback`
  (anonymous, rate-limited, sanitized).
- Library: content model, frontmatter schema, registry with integrity checks,
  serializer, search with ranking/synonyms/typo tolerance/redaction, health.
- Components: server renderers plus client search, code copy, tabs, feedback,
  navigation.
- Content: getting started, monitors (website/API/SSL/heartbeat/states/retries),
  assertions, incidents, alerts (email/Slack/Discord/webhooks/routing/quiet
  hours/recovery/dead letters), webhooks (overview/events/payload/signatures/
  retries), status pages and subscribers, maintenance, teams (generated matrix),
  billing (generated plan table), affiliates, security, privacy, account,
  troubleshooting, migrations, reference.
- Generated-from-live-config: permission matrix (`roles.ts`), plan table
  (`plans.ts`).
- Styles: `src/styles/docs.css` using Fajita tokens.
- Internal ops: `/internal/docs`, `/internal/docs/feedback` (platform-admin).
- SEO: sitemap includes docs; robots disallows `/api/`, `/internal/`,
  `/docs/raw/`; root `llms.txt` points at docs.
- Validation: `scripts/docs-validate.ts` (`npm run docs:validate`).
- Tests: `src/lib/docs/platform.test.ts` (22 tests).
- Storage: `docs_feedback`, `docs_search_no_result` (RLS on, service-write only,
  applied live).

## Verified

Typecheck clean; lint warnings only; `docs:validate` passes (70 pages);
`npm test` 24 files / 209 tests pass; production build succeeds with docs SSG
(233 static pages total); runtime smoke of all public routes returns 200 with
clean bodies; `/internal/docs` returns 404 unauthenticated. Webhook signature
examples are verified against the real signer.

## Accuracy guarantees

Plan limits and role capabilities come from live registries. Webhook examples
match `src/lib/alerts/signing.ts`. Only implemented features are documented. No
SMS, phone, on-call, AI diagnosis, browser monitoring, SDK, public write API, or
MCP content exists.

## Deferred to Phase 14 readiness

- Screenshot capture from a controlled fixture environment (framework, alt-text
  enforcement, placeholders, and freshness hooks are done).
- Additional diagrams beyond monitoring-flow and retry-vs-verification (prose
  and tables carry the meaning today).
- Remaining long-tail IA pages beyond the 70 shipped (structure supports one
  `defineDoc` per page).
- Field Core Web Vitals, cross-browser and screen-reader passes, and load tests
  against a deployed target.
- A documentation changelog route and full redirect manifest UI (versioning
  fields and deprecation redirects are implemented).

## Not built (correctly out of scope)

No new repository, glossary, blog, comparison pages, free tools, Pamphlet
chatbot, AI support bot, public write API, SDK packages, MCP server, SMS or
phone-alert docs, multilingual docs, paid docs, competitor-copied content, real
customer screenshots, or internal infrastructure disclosures.
