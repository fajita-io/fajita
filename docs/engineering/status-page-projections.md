# Status page public-safe projections

The projection is the single source of truth for the public renderer. It is built server-side and stored in `status_page_public_snapshots`.

## Shape

The snapshot shape is defined in `src/lib/status-pages/snapshot-types.ts` (`PublicSnapshotData`). Every field is deliberately allowlisted. There are no internal ids, monitor names, secrets, internal notes, worker details, assignees, or subscriber data.

Top-level: `schemaVersion`, `page` (name/title/description/headline/support+website URL/timezone/locale), `theme` (key/appearance/logoUrl), `seo`, `display`, `overall`, `groups`, `ungrouped`, `activeIncidents`, `notices`, `activeMaintenance`, `upcomingMaintenance`, `recentIncidents`, `generatedAt`, `lastUpdatedAt`.

## Build pipeline

`buildSnapshotData(orgId, statusPageId)` in `src/lib/status-pages/projection.ts`:

1. Load the page config, groups, and visible components.
2. Resolve mapped monitor states (Phase 4/6 engine state).
3. Compute each component's public state via `public-state.ts` (respecting manual overrides and calculation mode).
4. Load per-component daily uptime via the `public.status_page_component_uptime` RPC (service-role only).
5. Load published incidents, maintenance, and notices, sanitizing all public text.
6. Compute overall state (maintenance never hides an unrelated outage).
7. Emit the allowlisted `PublicSnapshotData`.

`refreshSnapshot()` persists the built data with a content hash and `generated_at`. It runs after any action that affects a published page (`refreshIfPublished`).

## Uptime function

`public.status_page_component_uptime(p_org, p_monitor_ids, p_since)` is `security definer`, granted to `service_role` only (revoked from `anon`/`authenticated`). The app calls it only after an explicit org authorization check. It mirrors the Phase 5 `monitor_result_stats` pattern. See migration `20260722000300_phase8_uptime_public.sql`.

## Why a projection store

- Anonymous reads never touch RLS-protected customer tables.
- Rendering does not run live dashboard queries per request.
- The snapshot is versioned (schema version) and rebuildable from source at any time.
- A dashboard disruption does not take the public page down: the last snapshot keeps serving.
