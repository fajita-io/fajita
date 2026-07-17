# Phase 15 handoff

## What shipped

- Editorial blog with 8 published launch articles, categories, authors, RSS, updates, search, plain-text routes
- Comparison index, methodology, 4 published comparison pages, competitor-fact registry, correction intake API
- Four free tools (uptime, webhook signature, cron, status checklist); HTTP status checker deferred
- Research foundation with methodology template and data-insufficient proposed study (no fabricated findings)
- Content manifest, split sitemaps, `llms.txt` / `llms-full.txt` updates
- Internal content ops + content lab
- Analytics goals for content surfaces
- Validation script `npm run content:validate`

## How to add an article

1. Create `src/lib/content/articles/<name>.ts` with `defineArticle`
2. Export from `articles/index.ts`
3. Set review gates true only after human reviews
4. Run `npm run content:validate` and `npm test`
5. Confirm related glossary/docs/tool slugs exist

## How to update a comparison

1. Update competitor facts in `comparisons/facts.ts` with new `dateVerified`
2. Edit page body; bump `contentVersion` and `updatedAt`
3. Keep Fajita limitations and competitor strengths
4. Do not guess prices; use `pricingStatus: "link-only"` or `"unknown"`

## How to disable a tool

Set `status` away from `published` or `indexable: false` / `deprecated: true` on the tool definition. Networked tools must not ship without security review.

## Transfer notes

- Content source: git-tracked TypeScript
- No separate CMS hosting
- OG images inherit site defaults unless per-route images are added later
- Feedback/correction APIs acknowledge intake; durable storage can wire in Phase 17
- Search Console integration is foundation-ready via sitemaps; connect property operationally before launch (Phase 18)

## Intentionally deferred

- Pamphlet chatbot (Phase 16)
- Full admin OS (Phase 17)
- Final legal/security launch hardening (Phase 18)
- HTTP status checker public tool
- Automated social posting / backlink outreach
- Fabricated research publications
