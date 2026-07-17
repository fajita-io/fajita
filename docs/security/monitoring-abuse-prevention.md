# Monitoring abuse prevention

Phase 4. Controls that keep the engine from being used as a proxy, scanner, or
amplifier, and that protect Fajita's own resources.

## Rate limits

Applied server-side (never relying on frontend debouncing):

| Surface | Limit basis |
| --- | --- |
| Monitor test execution | user + organization |
| Monitor activation / update / pause / resume | user + organization |
| Secret rotation | user + organization |
| Heartbeat ingestion | client IP + token |
| Failed destination validation | organization |
| Worker-management APIs | platform admin only |

Server actions call `limitOrThrow(profileId, bucket, perMinute)`; the heartbeat
route uses `rateLimit` keyed by client IP.

## Header controls

Customer-configurable headers are limited to safe values (for example
`Authorization`, `Accept`, `Content-Type`, approved custom headers). Controlled
or blocked: `Host`, `Connection`, `Proxy-Authorization`, `Proxy-Connection`,
`Transfer-Encoding`, `Content-Length`, `Upgrade`, `Forwarded`,
`X-Forwarded-For`, internal Fajita headers, and hop-by-hop headers. Customers
cannot spoof Fajita worker identity. Secret header values are never logged; only
masked names appear in safe summaries.

## Method and body limits

Default `GET`; `HEAD` and safe `POST` supported. Request bodies are size-limited
with approved content types only. No file uploads, multipart, streaming, or
code-generated bodies.

## Response limits

Bounded header size, decompressed body size, JSON parse size, assertion scan
length, redirect count, and request duration. Oversized responses stop reading
safely, classify as `response_too_large`, store bounded metadata only, and never
crash the worker or retry indefinitely.

## Prevented behaviors

Monitor-creation floods, test-check floods, heartbeat floods, rapid destination
rotation, proxy use, port scanning (ports restricted to 80/443), and DoS
amplification.

## Security events

Abuse-relevant events are recorded in `monitor_security_events` (see
`docs/observability/monitoring-engine.md`): blocked private/metadata address,
unsupported scheme, blocked port, DNS-rebinding attempt, redirect to blocked
destination, excessive redirects, oversized response, repeated abusive tests,
invalid heartbeat-token volume, and rate-limit enforcement. One blocked
configuration does not accuse a customer of malice; events support
investigation.
