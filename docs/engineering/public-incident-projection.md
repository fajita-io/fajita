# Public incident projection (Phase 8 foundation)

`public.incident_public_projections` holds a public-safe view of an incident,
separate from internal incident data. It is populated by
`app.upsert_incident_projection` on every transition and manual operation. It is
not exposed through any public route in Phase 6.

## Allowlisted fields only

Public title, public summary, public status, severity, affected public component
placeholders, opened time, update history (public-ready updates only), resolved
time, and scheduled maintenance information.

## Never included

Internal notes, secret URLs, private monitor names (unless explicitly mapped),
response bodies, internal error detail, worker detail, user emails, internal
correlation IDs, security events, credentials, and administrative actions.

## Visibility control

Each incident carries a `public_visibility` value:
`internal` (default), `status_page_ready`, `published` (reserved for Phase 8),
and `hidden`. Phase 6 keeps projections inactive: there is no public route, no
`authenticated` or `anon` read policy, and the UI labels public-ready updates as
saved but not published.

## Phase 8 contract

Status pages should read only from this projection, filtered by
`public_visibility = 'published'`, mapped through customer-defined component
names. They must never read internal incident tables directly. Publishing is a
deliberate Phase 8 action; Phase 6 only prepares the data.
