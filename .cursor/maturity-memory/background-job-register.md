# Background job register

Every background operation in Fajita and its recovery contract. Governed by `operations-and-observability.mdc`. Update via `operations-and-observability-architect`. **Populate known operations only.**

Today there is no background-job runner or queue configured. The only server-side event processing is the synchronous Stripe webhook route. All other entries are planned/`[UNRESOLVED]` and are listed to define contracts before implementation.

---

## Background Operation: Stripe webhook processing

Status: Partial (exists; incomplete)
Trigger: Stripe delivers a signed event to `POST /api/webhooks/stripe`
Purpose: React to billing events (checkout, subscription changes, invoices)
Inputs: Raw payload + `stripe-signature` header
Outputs: Currently DataFast goal events only. Intended: persist subscription state to `billing_subscriptions`
User-visible state: None directly
Expected duration: Sub-second
Idempotency: **Not implemented** (no event-ID dedupe). Gap.
Retry policy: Relies on Stripe's own retries on non-2xx; no app-side retry
Failure threshold: `[UNRESOLVED]`
Alert: `[UNRESOLVED]` (should alert on sustained webhook failures)
Recovery: Manual reconciliation against Stripe; safe replay requires idempotency first
Cancellation: N/A
Sensitive-data restrictions: No card data; verify signature before processing; do not log payload secrets
Owner: `[UNRESOLVED]`
Tests: `[UNRESOLVED]` (need signature-rejection and idempotency tests)

---

## Background Operation: Monitor check `[UNRESOLVED]`

Status: Not implemented
Trigger: Scheduled per monitor interval
Purpose: Check target (website, API, certificate, cron) health
Inputs: Monitor config (target, type, interval)
Outputs: Check result, status transition, potential incident
User-visible state: Monitor status, last-check timestamp
Expected duration: Seconds per check
Idempotency: `[UNRESOLVED]`
Retry policy: `[UNRESOLVED]` (verify before declaring down)
Failure threshold: `[UNRESOLVED]`
Alert: On verified failure -> incident + alert delivery
Recovery: `[UNRESOLVED]`
Cancellation: Pause/disable monitor
Sensitive-data restrictions: Do not log full response bodies or credentials
Owner: `[UNRESOLVED]`
Tests: `[UNRESOLVED]`

---

## Background Operation: Alert delivery `[UNRESOLVED]`

Status: Not implemented
Trigger: Verified incident
Purpose: Notify on-call via configured channels before customers report
Inputs: Incident, alert channel(s)
Outputs: Delivered alert, delivery record
User-visible state: Incident timeline shows notification sent
Expected duration: Seconds
Idempotency: Required (dedupe per incident + channel)
Retry policy: Backoff with limit; escalate on repeated failure
Failure threshold: `[UNRESOLVED]`
Alert: On delivery failure (meta-alert)
Recovery: Retry / escalate / manual notify
Cancellation: On incident resolve/acknowledge
Sensitive-data restrictions: Scope to recipient; no secrets
Owner: `[UNRESOLVED]`
Tests: `[UNRESOLVED]`

---

## Background Operation: Email send `[UNRESOLVED]`

Status: Not implemented (no provider)
Trigger: Communication event (`communication-map.md`)
Purpose: Deliver transactional/lifecycle email
Inputs: Template, recipient, data
Outputs: Provider send result
User-visible state: Depends on message
Expected duration: Seconds
Idempotency: Required (send key to prevent duplicates from retries)
Retry policy: Backoff with limit
Failure threshold: `[UNRESOLVED]`
Alert: On sustained send failures
Recovery: Retry / dead-letter
Cancellation: N/A
Sensitive-data restrictions: No secrets/credentials in body or subject; scope to recipient
Owner: `[UNRESOLVED]`
Tests: `[UNRESOLVED]`

---

## Status

Installation baseline recorded 2026-07-16. Only the Stripe webhook exists (incomplete). Define contracts and add idempotency/retry/recovery via `operations-and-observability-architect` at Gate 5 before implementing any job.
