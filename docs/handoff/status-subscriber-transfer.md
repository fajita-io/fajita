# Status-subscriber transfer checklist (acquisition readiness)

No secret values appear here. A future operator can run the subscriber system
end to end using this checklist.

## Provider and domain

- Email provider: **Resend** (shared transactional stream with Phase 7 alerts).
- Sending identity: `ALERT_EMAIL_FROM` (verified domain). Subscriber mail is
  sent as `<Status Page Name> via Fajita` (`senderFrom` in
  `src/lib/subscribers/delivery/sender.ts`). Custom customer sending domains are
  deferred.
- DNS to verify on transfer: SPF, DKIM, DMARC, return-path/bounce domain for the
  Resend sending domain.
- Provider webhook: point Resend's `email.delivered`, `email.bounced`,
  `email.complained`, `email.delivery_delayed` events at
  `POST /api/webhooks/subscriber-email`. Set `SUBSCRIBER_EMAIL_WEBHOOK_SECRET`
  to the endpoint signing secret (fails closed if unset).

## Environment variables

| Var | Purpose |
| --- | --- |
| `MONITOR_SECRET_KEYRING` | AES-256-GCM keyring; encrypts addresses and derives the link-signing key. Rotate by adding a higher version. |
| `RESEND_API_KEY` | Email send |
| `ALERT_EMAIL_FROM` | Sender identity |
| `SUBSCRIBER_WORKER_TOKEN` | Auth for `POST /api/internal/subscribers/run` |
| `SUBSCRIBER_EMAIL_WEBHOOK_SECRET` | Verify inbound bounce/complaint callbacks |

## Workers

- Cron/HTTP: `POST /api/internal/subscribers/run` with the bearer token.
- Long-running: `tsx scripts/subscriber-worker.ts`
  (`SUBSCRIBER_WORKER_INTERVAL_MS`, `SUBSCRIBER_WORKER_ID`).

## Operator runbook

- Diagnose failed confirmation email: check Resend logs for the send, then
  `status_page_subscriber_delivery_intents` is not used for confirmations (they
  send inline from the subscribe route); confirm `RESEND_API_KEY` and
  `ALERT_EMAIL_FROM` are set and the domain is verified.
- Diagnose failed incident email: inspect `status_page_subscriber_events`
  (fan-out status), then intents/attempts and dead letters for the event.
- Handle a complaint/bounce: arrives via the verified callback; the address is
  suppressed automatically and pending deliveries canceled. Complaint
  suppression is not casually reversible.
- Disable a compromised form: set `subscriptions_enabled = false` (Subscribers
  settings) or rely on the auto-pause fields.
- Delete subscriber data: owner action / subscriber request moves to
  `pending_deletion`; the deletion sweep anonymizes and preserves a suppression
  hash.
- Rotate keys: add a higher `MONITOR_SECRET_KEYRING` version; old versions stay
  to decrypt existing rows.

## Known transfer gaps

Import/export processing, reconciliation scheduling, and the internal subscriber
lab are listed as deferred in `docs/handoff/phase-9-handoff.md`.
