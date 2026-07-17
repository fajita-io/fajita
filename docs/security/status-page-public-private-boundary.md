# Status page public/private boundary

## The one path

Internal data becomes public only through `status_page_public_snapshots.data`, whose shape is `PublicSnapshotData` (`src/lib/status-pages/snapshot-types.ts`). The public renderer reads only this snapshot. It performs no internal joins at request time.

## Allowlist, not denylist

The projection builder (`projection.ts`) constructs the snapshot field by field. Nothing is included unless explicitly mapped. Adding an internal field to an internal table does not risk exposure, because the builder never spreads raw rows into the snapshot.

## Excluded fields (verified by tests)

Internal notes, internal incident title, assignees, acknowledgment, monitor ids and names, secret URLs, evidence, internal error taxonomy, worker details, audit events, alert-delivery history, subscriber emails/preferences, passwords, private-link tokens.

## Public text is sanitized

All customer-provided public strings pass through `sanitizePlainText` / `renderSafeRichText`. Only plain text plus bold, italic, safe links (http/https/mailto), and simple lists survive. Script, style, iframe, form, object, embed, event handlers, `data:`/`javascript:` URLs, and remote images are stripped.

## OG and sitemaps

Status-aware OG images and sitemaps use only public snapshot data. Private/password pages are noindex and excluded from sitemaps; their titles never leak.
