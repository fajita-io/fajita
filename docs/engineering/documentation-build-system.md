# Documentation build system

Internal. How documentation is generated and validated during the build.

**Date:** 2026-07-17

## Generation

Documentation uses the existing Next.js build. No separate pipeline.

- `/docs/[...slug]` and `/docs/raw/[...slug]` use `generateStaticParams` with
  `dynamicParams = false`, so exactly one static page is produced per registry
  entry and unknown slugs return 404 without server work.
- `/docs/llms.txt`, `/docs/llms-full.txt`, and `/docs/manifest.json` are route
  handlers that read the registry at request time and set long cache headers.
- The sitemap (`src/app/sitemap.ts`) and root AI files are generated from
  `publicDocs()` and `llmDocs()`.

## Build-time validation

Two layers run before content can ship:

1. **Load-time integrity** in `registry.ts`: duplicate slugs throw; a deprecated
   page pointing at a missing replacement throws; unresolved related references
   are dropped with a warning outside production.
2. **`npm run docs:validate`** (`scripts/docs-validate.ts`): required
   frontmatter on published pages, related pages resolve, internal `/docs`
   links resolve, screenshots carry alt text, the AI corpus contains only
   published and indexable pages, and the corpus is scanned for em dashes,
   phase numbers, internal terms, and secret patterns. Non-zero exit blocks CI.

## Generated artifacts

| Artifact | Source |
| --- | --- |
| Sidebar navigation | `buildNavigation()` |
| Previous/next order | `orderedPublicSlugs()` |
| Search results | `searchDocs()` over `publicDocs()` |
| Sitemap entries | `publicDocs()` minus deprecated/noindex |
| `llms.txt` / `llms-full.txt` | `llmDocs()` |
| `manifest.json` | `llmDocs()` with content hashes |
| Raw text | `pageToPlainText()` per LLM-eligible page |

## Dynamic values from live configuration

The permission matrix is generated from `src/lib/auth/roles.ts` and the billing
plan table from `src/lib/stripe/plans.ts`. Neither is hand-maintained, so plan
limits and role capabilities in docs always match the product.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Full production build, generates all docs artifacts |
| `npm run docs:validate` | Content and safety validation |
| `npm run typecheck` | Type safety across content and platform |
| `npm test` | Unit tests including the docs platform suite |
