# Alert delivery security review

Scope: Phase 7 alert channels, routing, and outbound delivery. Aligns with
`security-and-privacy.mdc`, `monitoring-ssrf-defense.md`, and
`monitor-secret-encryption.md`.

## Trust boundaries

| Boundary | Control |
| --- | --- |
| Tenant isolation | Every table carries `organization_id`; all reads scope by it; RLS is SELECT-only for members, writes go through the service role after a page/action guard. |
| Configuration writes | `integrations:manage` permission + feature availability + per-actor rate limit + Zod validation + audit, in every server action (`src/lib/app/actions/alerts.ts`). |
| Outbound network | SSRF-safe sender for chat and generic webhooks (below). |
| Secrets at rest | Envelope encryption (AES-256-GCM), key-versioned; decrypt at send time only. |
| Secret exposure | UI and logs see masked labels only; webhook signing secret shown once, stored as a hash. |

## SSRF defense (chat + generic webhooks)

`src/lib/alerts/providers/http.ts` (`safePost`) applies the monitor-path
defenses at send time, not only at preflight:

- URL hygiene, HTTPS required, no embedded credentials (`validateUrl`).
- A custom DNS `lookup` that rejects loopback, private, link-local, carrier-NAT,
  reserved, and cloud-metadata addresses, and pins the socket to the exact
  resolved public address (defeats DNS-rebinding / TOCTOU).
- Redirects are never followed; a 3xx is surfaced as a blocked outcome.
- Hard timeout; the response body is drained and discarded (never stored),
  bounded to 64 KB.

Covered by `tests/alerts-ssrf.test.ts`. Background: `dns-rebinding-defense.md`,
`outbound-network-isolation.md`.

## Webhook authenticity

Generic webhooks are signed HMAC-SHA-256 over `timestamp.body` with per-channel
keys. Headers carry the event id, type, timestamp, schema version, and
signature. Customers verify with the once-shown secret. Reserved `Fajita-*`
headers and hop-by-hop headers cannot be overridden by customer custom headers
(`BLOCKED_WEBHOOK_HEADERS`). Covered by `tests/alerts-signing.test.ts`.

## Email safety

Recipients must verify before they can receive an alert. Suppressed recipients
(hard bounces/complaints) are never sent to and surface as a permanent,
non-retryable outcome.

## Data minimization and logging

- Delivery attempts store status, category, HTTP status, duration, and a safe
  summary. They never store the rendered message body, credentials, or provider
  tokens.
- Customer-facing error copy is drawn from a fixed taxonomy
  (`src/lib/alerts/errors.ts`); internal detail stays server-side.
- CSV export contains outcomes and metadata only: no secrets, no bodies.

## Ten-question checklist (per `security-and-privacy.mdc`)

1. Who initiates? An org member with `integrations:manage`.
2. Who views results? Members (read); managers act.
3. Server-side enforcement? Yes, in every action + RLS.
4. What is stored? Channel config, encrypted secrets, intents, immutable
   attempts, dead letters.
5. Where? Supabase Postgres, this project only.
6. Retention? Attempts/intents retained for the delivery log; export available.
   Automated pruning is deferred (see handoff).
7. What is logged? Non-secret outcome metadata.
8. Deletion? Soft-delete channels; secrets revoked on rotation/delete.
9. On failure? Retry with backoff, then dead-letter with a recovery path.
10. Investigate abuse? Audit log + delivery log + dead-letter queue.

## Known residual risk

- Email/provider sending keys (`RESEND_API_KEY`, `ALERT_EMAIL_FROM`) and
  `ALERT_WORKER_TOKEN` must be set in production env and never in the client
  bundle. Validated in `src/lib/env.ts` (server schema).
- Retention/pruning of old attempts is deferred; growth is bounded by the
  delivery volume until then.
