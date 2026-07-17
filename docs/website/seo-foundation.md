# SEO foundation (Phase 2)

## Metadata

- Root layout: `metadataBase`, title template `%s · Fajita`, default
  description, default OG image (`src/app/opengraph-image.tsx`, rendered
  from the brand OG template SVG).
- Every route: `buildMetadata` (`src/lib/site/metadata.ts`) provides
  unique title, unique description, canonical path, OG and Twitter
  mirrors. Feature pages use `generateMetadata` from the typed content
  source.
- Noindex: `/login` (metadata), Brand Lab (metadata + 404 in prod),
  404/500.

## Per-page Open Graph images

`scripts/generate-og-pages.ts` typesets each page headline in Fraunces
(brand display instance) at build time and writes
`public/brand/social/pages/<slug>.svg`; per-route `opengraph-image.tsx`
files render them to PNG via `pageOgImage()` (`src/lib/site/og.tsx`).
Zero runtime font dependencies. Re-run the script when headlines change.

Covered: pricing, features hub, all six feature pages, integrations,
security, about, contact, changelog, roadmap. Everything else inherits
the root default.

## Robots, sitemap, llms.txt

- `src/app/robots.ts`: allow all, disallow `/api/` and `/internal/`,
  sitemap reference.
- `src/app/sitemap.ts`: all 18 indexable routes with priorities;
  excludes `/login`, API, internal. Test-enforced
  (`tests/site-seo.test.ts`).
- `src/app/llms.txt/route.ts`: what Fajita is, who it is for, early
  access state, key URLs, plan structure without invented prices,
  company identity. No internal architecture, prompts, or security
  detail.

## Structured data

| Schema | Location |
| --- | --- |
| Organization + WebSite | root layout |
| SoftwareApplication | homepage |
| FAQPage | homepage (matches visible FAQ content) |
| BreadcrumbList | feature pages |
| ContactPage | `/contact` |
| AboutPage | `/about` |

No aggregateRating, no reviews, no invented entities.

## Verification performed

- `curl` smoke: all routes 200, unknown routes 404, sitemap/robots/llms
  reachable through middleware.
- Sitemap/robots/canonical/noindex covered by unit tests.
- JSON-LD is generated from the same typed sources as visible content.

## Post-deploy checklist (not yet possible locally)

- Verify Search Console property; submit sitemap.
- Rich results test on `/` (FAQ) and a feature page (breadcrumbs).
- Confirm AI crawler tracking fires in middleware logs.
