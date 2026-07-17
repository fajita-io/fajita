# Status-page subscriber architecture (Phase 9)

Status-page subscriber email is **operational communication**. It turns a
published public status event into a consent-based, deduplicated, retryable
email. It is never a marketing list.

## Pipeline

Publishing a public event does not send email inline and never blocks on
delivery. The flow is a two-stage, restartable pipeline modeled on the Phase 7
alert engine:

```
publish public event
  -> emitSubscriberEvent()            (records ONE row in status_page_subscriber_events)
  -> fan-out worker (runFanoutPass)   (events -> delivery intents, preference + suppression aware)
  -> delivery worker (runSubscriberDeliveryPass)  (intents -> Resend send)
  -> provider callback route          (delivered / bounced / complained -> final state + suppression)
  -> reconciliation                   (repair drift)
```

Both workers are driven by:

- `POST /api/internal/subscribers/run` (bearer `SUBSCRIBER_WORKER_TOKEN`), or
- `tsx scripts/subscriber-worker.ts` (long-running loop).

## Event source of truth

The only approved source of subscriber email is a **published public status
event**. `emitSubscriberEvent` (`src/lib/subscribers/events.ts`) is wired into
`publishIncidentToStatusPage` and `publishMaintenanceToStatusPage`
(`src/lib/status-pages/publication.ts`). It:

- honors the page's per-event settings (`subscriber_*_enabled`),
- refuses when subscriptions are disabled, the page is suspended, or the form is
  auto-paused,
- is idempotent per `(status_page, event_type, subject, revision)`,
- writes only an **allowlisted public payload** (title, status label, public
  summary, affected component names, timestamps). Internal notes, monitor
  names, assignees, and evidence never cross this boundary.

## Fan-out

`src/lib/subscribers/delivery/fanout.ts` claims pending events and pages through
eligible subscribers with the `next_subscriber_fanout_batch` RPC (keyset
pagination, never loads all subscribers into memory). For each subscriber it
evaluates the event preference and component match, then either creates a
deduplicated delivery intent (`create_subscriber_intent`) or records a
suppression with a human explanation (`record_subscriber_suppression`).
Confirmed subscribers only; unsubscribed / bounced / complained / suppressed are
excluded in the SQL.

## Delivery

`src/lib/subscribers/delivery/worker.ts` leases pending intents
(`lease_subscriber_deliveries`), decrypts the address, renders the branded
template, and sends through Resend (`sender.ts`). `record_subscriber_attempt`
records the outcome and advances retry / dead-letter state. Errors are
categorized (`src/lib/alerts/errors.ts`); only transient categories retry with
bounded backoff. Permanent failures (hard bounce, complaint, unsubscribed,
suppressed, malformed) never retry.

## Deduplication

The `status_page_subscriber_delivery_deduplication` table enforces uniqueness on
`(subscriber, event, revision, message kind)`. A duplicate event, a retried
worker pass, or a duplicate provider callback cannot produce a second send.

## Tenancy and safety

Every table is scoped by `organization_id` and `status_page_id`. Workers use the
service role; RLS is defense in depth. Address plaintext is never stored: only a
keyed hash (dedup / suppression lookup) and an AES-256-GCM envelope (send /
permissioned display).
