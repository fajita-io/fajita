# Incident delivery outbox (Phase 7 foundation)

`public.incident_delivery_outbox` is a transactional outbox. When an incident
transition commits, a delivery event is written in the same transaction. Phase 6
delivers nothing. The records wait for the Phase 7 processor.

## Record shape

Stable id, event type, organization id, incident id, monitor id, occurred-at,
schema version, idempotency key, safe payload (allowlisted fields only),
processing status, created-at.

## Event classes written

incident opened, degraded, updated, recovered, resolved, reopened, canceled;
maintenance started/ended; monitor flapping. Written by
`app.record_incident_outbox`, which is idempotent on
`(incident_id, event_type, idempotency_key)`.

## Status lifecycle

`pending | processing | delivered | failed | suppressed | canceled`. In Phase 6
records remain `pending` (awaiting the Phase 7 processor) or `suppressed` (for
flapping noise control). No retries run in this phase. The UI never claims an
alert was sent; the incident overview shows a neutral "Alert delivery arrives in
a later build" notice.

## Safety

The payload never contains secrets, response bodies, raw headers, full private
URLs, internal notes, or worker error detail. Customers cannot write outbox
delivery state (no `authenticated` write policy; see `../database/phase-6-rls.md`).

## Phase 7 contract

The Phase 7 processor should claim `pending` rows with `FOR UPDATE SKIP LOCKED`,
respect `suppressed`, honor per-organization channel configuration (built in
Phase 7), and transition status to `delivered` or `failed` with bounded retries.
It must treat the payload as the source of truth and must not re-read internal
incident tables for customer-facing content.
