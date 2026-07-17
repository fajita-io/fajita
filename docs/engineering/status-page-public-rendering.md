# Status page public rendering

The public renderer lives in the `(status)` route group and is deliberately isolated from the authenticated app.

## Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/status/[slug]` | `src/app/(status)/status/[slug]/page.tsx` | Main public page |
| `/status/[slug]/incidents/[incidentSlug]` | `.../incidents/[incidentSlug]/page.tsx` | Incident detail |
| `/status/[slug]/history` | `.../history/page.tsx` | Incident archive (paginated) |
| `/status/[slug]/api` | `.../api/route.ts` | Read-only public JSON |
| `/status/[slug]/badge` | `.../badge/route.ts` | Embeddable SVG badge |
| `/status/[slug]/opengraph-image` | `.../opengraph-image.tsx` | Status-aware OG image |
| custom domains | `src/app/(status)/_status-host/[host]/[[...path]]/page.tsx` | Rewritten by middleware |

## Resilience properties

- **Server-rendered from the snapshot.** No client fetch is required for core meaning; content is in the initial HTML.
- **Own stylesheet only.** `src/app/(status)/status-page.css` is self-contained. Themes are applied with CSS variables on `.sp-root`, so every theme renders with no extra JS.
- **No auth bundle.** The `(status)` layout imports no Clerk, no app context, no marketing animation.
- **ISR caching.** Pages set `export const revalidate` (30s for pages, 60s for archive) so the CDN serves cached HTML and revalidates in the background.
- **Graceful staleness.** The view compares `generatedAt` to now and shows a subtle freshness note when the projection is old, rather than fabricating "all operational".

## Accessibility

- State is never color-only. `StatePill` communicates via label, shape glyph, and color.
- The uptime bar (`UptimeBar`) has a screen-reader summary, per-day titles, and non-color patterning.
- Exact timestamps in the page timezone (`src/lib/status-pages/format.ts`), relative time only as a secondary convenience.
- No auto-refresh that disrupts screen readers; ISR revalidation happens server-side.

## Minimal JavaScript

Public components (`src/components/status-public/*`) are server components. The only interactivity is native (details/summary where used) and links. There is no client state machine on the public page.
