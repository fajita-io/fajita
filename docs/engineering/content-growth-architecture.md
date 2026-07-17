# Content growth architecture (Phase 15)

## Summary

Phase 15 adds an organic growth layer inside the existing Next.js app: blog, comparisons, free tools, and research foundations. Content is source-controlled TypeScript registries (same pattern as docs and glossary). There is no runtime AI publishing, no public CMS, and no second analytics identity.

## Registries

| Registry | Path |
| --- | --- |
| Articles | `src/lib/content/articles/` |
| Comparisons | `src/lib/content/comparisons/` |
| Tools | `src/lib/content/tools/` |
| Research | `src/lib/content/research/` |
| Shared schema | `src/lib/content/schema.ts` |
| Integrity + APIs | `src/lib/content/registry.ts` |

## Public routes

- `/blog`, `/blog/[slug]`, `/blog/category/[category]`, `/blog/author/[author]`, `/blog/updates`, `/blog/rss.xml`, `/blog/raw/[slug]`
- `/compare`, `/compare/[slug]`, `/compare/raw/[slug]`
- `/tools`, `/tools/[slug]`, `/tools/raw/[slug]`
- `/research`, `/research/[slug]`, `/research/raw/[slug]`
- `/content/manifest.json`
- Split sitemaps: `/sitemap-blog.xml`, `/sitemap-comparisons.xml`, `/sitemap-tools.xml`, `/sitemap-research.xml`

## Publication gates

`defineArticle` / `defineComparison` / `defineTool` / `defineResearch` enforce reviews at module load. `registry.ts` runs anti-AI-slop scans, em-dash checks, forbidden product claims, and related-link integrity. `npm run content:validate` repeats soft warnings.

## Tools

Launch tools are client-side only: uptime calculator, webhook signature generator/verifier, cron explainer, status-page checklist. HTTP status checker is deferred until public fetch capacity is proven separate from paid monitoring workers.

## Attribution

Phase 12 affiliate attribution remains authoritative for commissions. Organic assistance is a separate reporting dimension (`src/lib/content/attribution.ts`).

## Internal ops

`/internal/content/*` and `/internal/content-lab` are noindex and restricted to development or platform admins.
