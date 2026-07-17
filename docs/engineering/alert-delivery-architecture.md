# Alert delivery architecture

Phase 7 turns recorded incident and maintenance events into delivered alerts
across Email, Slack, Discord, and generic signed webhooks. It is authored from
first principles for Fajita and does not adapt code from any competitor.

The guiding rule: the right people hear about the problem before the wrong
people do. Every stage is transactional, idempotent, retryable, and observable,
and no destination receives a real alert until it has passed a test.

## The pipeline

```
incident/maintenance engine (Phase 6)
        │  writes an allowlisted row
        ▼
incident_delivery_outbox            (durable, one row per event)
        │  app.claim_alert_outbox    (FOR UPDATE SKIP LOCKED)
        ▼
consumer  (src/lib/alerts/delivery/consumer.ts)
        │  evaluateRouting()  →  who should hear about this?
        ▼
alert_delivery_intents              (one row per channel that should receive it)
alert_delivery_suppressions         (why a channel was intentionally not sent)
        │  app.lease_alert_deliveries (leased, backoff-aware)
        ▼
worker    (src/lib/alerts/delivery/worker.ts)
        │  resolve secrets → render → provider adapter → record attempt
        ▼
alert_delivery_attempts             (immutable, one row per try)
        │  on final failure
        ▼
alert_delivery_dead_letters         (needs-review queue, retryable/dismissable)
```

Two stages, two queues. The consumer decides routing once per event and writes
intents. The worker delivers intents independently, so a slow provider never
blocks routing and a routing change never rewrites in-flight deliveries.

## Why two queues

- **Outbox → intents** is fan-out. One `incident.opened` can become five
  intents (three channels via a monitor rule, two via an org rule). Doing this
  once, transactionally, keeps routing deterministic and auditable.
- **Intents → attempts** is delivery. Each intent retries on its own schedule
  with its own backoff and dead-letter, isolated from its siblings.

## Idempotency and concurrency

- Outbox rows are claimed with `FOR UPDATE SKIP LOCKED`; a claimed row is marked
  and never double-consumed.
- `alert_delivery_deduplication` collapses repeat events for the same incident +
  channel within a window when a rule opts into deduplication.
- Intents are leased with an expiry. `app.expire_stale_alert_leases` returns a
  crashed worker's leases to the pool. A lease carries the attempt number so a
  duplicate lease cannot double-count attempts.
- Every write that can be retried is keyed so a replay is safe.

## Retries, backoff, dead-letter

- Transient failures (timeouts, 5xx, rate limits) are retried with the backoff
  in `RETRY_BACKOFF_SECONDS` (`30s, 2m, 10m, 30m, 2h`), capped at
  `defaultMaxAttempts` (5).
- Permanent failures (auth rejected, blocked destination, payload rejected,
  suppressed recipient) are not retried; they go straight to dead-letter with a
  suggested action.
- A dead-letter can be retried (a fresh intent) or dismissed by an operator, and
  a channel with a configured fallback enqueues the fallback on final failure.

## Error taxonomy

`src/lib/alerts/errors.ts` maps every provider outcome to a provider-agnostic
category with a customer-facing message that never leaks tokens, bodies, stack
traces, or SQL. The category decides retryability and the log label.

## Where the work runs

Delivery runs off the request path as a Node process using the Supabase service
role. Two entry points share the same functions:

| Entry | Path | Use |
| --- | --- | --- |
| Standalone loop | `scripts/alert-worker.ts` | Long-running worker |
| Internal tick | `src/app/api/internal/alerts/run/route.ts` | Cron/manual single pass, `ALERT_WORKER_TOKEN` |

## Provider adapters

`src/lib/alerts/providers/` holds one adapter per provider. Chat and generic
webhooks send through `safePost` (SSRF-safe; see the security review). Email
sends through the configured provider API. Each adapter returns a normalized
`ProviderOutcome` that the worker records verbatim (minus secrets).

## Secrets

Channel credentials are envelope-encrypted (AES-256-GCM) with key versioning,
reusing the Phase 4 secret system. The worker decrypts at send time only; the UI
and logs only ever see masked labels. Webhook signing secrets are shown once and
stored as a hash.

## Related

- Routing model: `alert-routing.md`
- Outbox contract: `incident-outbox.md`
- Security review: `../security/alert-delivery-review.md`
- Handoff: `../handoff/phase-7-handoff.md`
