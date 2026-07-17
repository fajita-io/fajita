# Status page SEO

Route: `/app/status-pages/[id]/seo` (`SeoEditor`).

## Controls

- Index the status page (default on for public pages).
- Index the incident archive (configurable).
- Index individual incidents (default off / noindex).

Password-protected and private-link pages are always noindex and never appear in sitemaps.

## Implementation

Per public route metadata is set with the Next.js Metadata API in the `(status)` routes:

- Canonical URLs (domain-aware: custom domain vs hosted).
- `robots` directives derived from the page's indexing settings.
- Open Graph and X (Twitter) cards; a status-aware OG image at `/status/[slug]/opengraph-image`.

## Boundaries

Private page titles are never leaked through public sitemaps or OG metadata. The public site's sitemap/llms.txt are unaffected by private customer pages.
