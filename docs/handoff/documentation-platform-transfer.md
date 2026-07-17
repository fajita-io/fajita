# Documentation platform transfer

Internal. Acquisition-ready operating guide for the documentation platform.

**Date:** 2026-07-17

## What it is

A documentation platform built into the existing Next.js app. No separate
repository, service, or hosting. Content is typed TypeScript validated at build
time; navigation, search, sitemap, AI-readable files, and the manifest are
generated from one registry.

## Where everything lives

| Concern | Location |
| --- | --- |
| Content | `src/lib/docs/content/*.ts` |
| Registry and navigation | `src/lib/docs/registry.ts` |
| Frontmatter schema | `src/lib/docs/frontmatter.ts` |
| Search | `src/lib/docs/search.ts`, `src/app/api/docs/search` |
| Serialization | `src/lib/docs/serialize.ts` |
| Health | `src/lib/docs/health.ts` |
| Feedback | `src/lib/docs/feedback.ts`, `src/app/api/docs/feedback` |
| Components | `src/components/docs/*` |
| Routes | `src/app/(docs)/docs/*`, root `llms*.txt` |
| Internal ops | `src/app/internal/docs/*` |
| Styles | `src/styles/docs.css` |
| Validation | `scripts/docs-validate.ts` (`npm run docs:validate`) |
| Feedback tables | `supabase/migrations/20260727000000_phase13_docs_platform.sql` |

## How a future owner does common tasks

| Task | How |
| --- | --- |
| Add a page | Add a `defineDoc(...)` to a content file; it is picked up by the registry |
| Change navigation | Adjust `order`/`category`/`model` on pages and `categories.ts` |
| Rebuild search | Automatic at build; index is derived from published pages |
| Update `llms.txt` / `llms-full.txt` | Edit the route handlers or add/label pages; regenerated on build |
| Replace screenshots | Capture from fixtures, set `src` on the screenshot block |
| Replace diagrams | Edit `components/docs/diagrams.tsx` |
| Update code examples | Edit content; run tests; webhook examples are test-verified |
| Deprecate a page | Set `deprecated` and `replacementSlug`; redirect handled |
| Add redirects | Route-level redirect for changed slugs |
| Review feedback | `/internal/docs/feedback` |
| Find stale pages | `/internal/docs` (uses `health.ts`) |

## Dependencies and cost

No new runtime dependencies were added. Search is in-process (no external search
provider). Feedback uses the existing Supabase project. Hosting is the existing
Vercel deployment. Cost is incremental static pages plus two small tables.

## Environment variables

None added for documentation. The feedback path uses the existing Supabase
service configuration. Public rendering needs no secrets.

## Independence

The platform operates independently of unrelated products. It can be lifted with
the app repository, the two feedback tables, and the existing hosting.
