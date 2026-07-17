# Heartbeat and cron monitoring

Phase 4 builds the heartbeat foundation only. The missed-heartbeat incident
engine is Phase 6 and is **not** built here.

## Model

`heartbeat_tokens` (one or more per heartbeat monitor):

- Stable monitor id
- Token **hash** (SHA-256), never the raw token
- Expected interval and grace period
- Last heartbeat time, next expected time
- Current state
- Rotation and revocation support

`heartbeat_events` records received pings with bounded metadata and idempotency
where an event id is supplied.

## Tokens

- High-entropy tokens generated server-side (`node:crypto` `randomBytes`)
- Stored as SHA-256 hashes; the raw token is shown **once** on creation
- Rotation issues a new token and hash; revocation disables the token

Managed in `src/lib/monitoring/heartbeat.ts`
(`createHeartbeatToken`, `rotateHeartbeatToken`, `revokeHeartbeatToken`,
`listHeartbeatTokens`, `ingestHeartbeat`).

## Ingestion endpoint

`src/app/api/heartbeat/[token]/route.ts` handles `GET` and `POST` at
`/api/heartbeat/{token}`:

- Hashes the supplied token and looks up by hash
- Rate-limits by client IP
- Records the event via `ingestHeartbeat` (idempotent on supplied event id)
- Skips ingestion for suspended organizations
- Returns a generic response regardless of token validity to prevent
  enumeration
- Stores no arbitrary payloads; only bounded, safe metadata

## Deferred to Phase 6

Computing missed windows into incidents, alerting, and notifications. Events and
expected windows are stored now so Phase 6 can evaluate them.
