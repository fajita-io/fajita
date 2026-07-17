# Status page versioning

## Model

Every publish creates an immutable row in `status_page_versions` with a monotonically increasing `version_number`, a `snapshot` (bounded JSON of the versioned config), a `content_hash`, and the actor.

Versioned config includes: title, description, header/footer content, component structure and order, monitor mappings, theme and appearance, logo/favicon, visibility, SEO settings, powered-by, and uptime/response-time display settings. Secrets (passwords, private-link tokens) are never included in a snapshot.

## Publish

`publishStatusPage` (`src/lib/status-pages/publish.ts`):

1. Validate the draft (required fields, valid subdomain/domain state, component mappings, accessible colors, no duplicate component slugs, no unsafe content).
2. Create a new immutable version.
3. Build and store the public snapshot atomically.
4. Set the page `published`, update `published_version_id`.
5. Invalidate cache and record an audit event.

The previous published version is preserved. The active version is never mutated in place.

## Rollback

`rollbackToVersion` selects a prior version, validates current domain and assets, creates a **new** version based on the old one, and publishes it. It does not reactivate an old immutable row directly, so history stays linear and auditable.

## UI

`/app/status-pages/[id]/versions` lists versions with the live one badged and offers rollback to any earlier version (publish permission required).
