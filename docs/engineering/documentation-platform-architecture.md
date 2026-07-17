# Documentation platform architecture

Internal. How the public documentation platform is built and where each part
lives. No secrets. Customer-safe content is generated from one typed registry.

**Date:** 2026-07-17
**Docs version:** `2026-07-17`
**Product version:** `2026.07`

## Summary

Documentation is a first-class part of the existing Next.js App Router app. It
is not a separate repository, service, or template. Pages are authored as typed
TypeScript content (not runtime MDX), validated at build time, and rendered as
static HTML. Navigation, search, the sitemap, AI-readable files, and the
machine manifest are all generated from a single registry.

## Route group

All public docs live under the `(docs)` route group so they share the marketing
header and footer without inheriting the authenticated app shell.

| Route | Type | Purpose |
| --- | --- | --- |
| `/docs` | Static | Landing page |
| `/docs/[...slug]` | SSG | One page per registry entry (`dynamicParams=false`) |
| `/docs/llms.txt` | Route handler | Concise AI index |
| `/docs/llms-full.txt` | Route handler | Full public corpus as text |
| `/docs/manifest.json` | Route handler | Machine-readable page manifest |
| `/docs/raw/[...slug]` | SSG | Plain-text per page (LLM-eligible only) |
| `/api/docs/search` | Route handler | Server-side search |
| `/api/docs/feedback` | Route handler | Anonymous, rate-limited feedback |
| `/internal/docs`, `/internal/docs/feedback` | Dynamic | Platform-admin editorial ops |

Root duplicates `/llms.txt` and `/llms-full.txt` exist for canonical placement
at the site root and share the same corpus.

## Library layout (`src/lib/docs`)

| File | Responsibility |
| --- | --- |
| `blocks.ts` | Typed content-block model and authoring helpers |
| `inline.ts` | Safe inline markup (`code`, `[label](href)`), no raw HTML |
| `frontmatter.ts` | Zod frontmatter schema, `DOCS_VERSION` |
| `types.ts` | `DocPage`, `defineDoc` (build-time validation) |
| `categories.ts` | Category to mental-model mapping and order |
| `content/*.ts` | The pages, grouped by area |
| `registry.ts` | Aggregation, integrity checks, navigation |
| `serialize.ts` | Blocks to Markdown/plain text for raw and LLM output |
| `search.ts` | Index build, ranking, typo tolerance, query redaction |
| `synonyms.ts` | Controlled search synonyms |
| `health.ts` | Stale-page and missing-owner detection |
| `feedback.ts` | Server-side feedback persistence and sanitization |

## Component layout (`src/components/docs`)

Server components render static content (`blocks.tsx`, `inline.tsx`,
`callout.tsx`, `diagrams.tsx`, `page-meta.tsx`, `toc.tsx`). Client components
cover only interactive surfaces (`search.tsx`, `code-block.tsx`, `tabs.tsx`,
`feedback.tsx`, `docs-nav.tsx`). Interactive components never load the search
corpus or the application bundle.

## Rendering guarantees

- Core content renders without JavaScript. Search, copy, tabs, and feedback are
  progressive enhancements.
- No runtime MDX compilation and no arbitrary imports, so there is no MDX
  injection surface.
- Dynamic values (permission matrix, plan table) are generated at build time
  from the live registries (`src/lib/auth/roles.ts`, `src/lib/stripe/plans.ts`)
  so documentation cannot drift from the product.

## Data dependencies

Public rendering needs no database. The only database use is anonymous docs
feedback and search no-result logging (`docs_feedback`,
`docs_search_no_result`), written server-side with the service client.
