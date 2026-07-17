# Status page cache strategy

## Two layers

1. **Snapshot store** (`status_page_public_snapshots`): the pre-computed public projection. Rebuilt on change, read on render.
2. **HTTP/CDN cache**: Next.js ISR (`revalidate`) plus the hosting CDN in front of the public routes.

## Revalidation windows

| Surface | `revalidate` |
| --- | --- |
| Public page | 30s |
| Incident detail | 30s |
| Incident archive | 60s |
| JSON API | 30s |
| SVG badge | short, cacheable |
| OG image | matches page |

## Invalidation on change

Any action that alters a published page calls `refreshIfPublished`, which:

- Rebuilds the snapshot (`refreshSnapshot`).
- Calls `revalidatePath('/status/<slug>')` so the next request regenerates HTML.

Triggers include: settings/appearance/display/SEO changes, component and group edits, incident publish/unpublish, maintenance publish/unpublish, notices, publish/rollback/unpublish, domain changes.

## Bounded, per-customer

Invalidation is scoped to the affected page's slug path. One customer's update never purges the platform-wide cache.

## Deferred

A dedicated `status_page_cache_invalidations` audit/queue table and a background reconciliation sweep (detecting snapshot-behind-version drift) are modeled but the automated sweep job is deferred to the operations phase. Manual rebuild is available by re-publishing.
