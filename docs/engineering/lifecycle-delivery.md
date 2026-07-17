# Lifecycle delivery

Phase 11. Reliable, idempotent lifecycle email built on the same
intent/attempt pattern as Phase 7 alert delivery and Phase 9 subscriber
delivery, kept logically separate from both.

## Flow

1. A rule creates a row in `lifecycle_delivery_intents` through
   `create_lifecycle_intent` (RPC, dedup-safe on the unique `dedup_key`).
2. The worker (`runLifecycleDeliveryPass`) expires stale leases, then leases
   due intents with `lease_lifecycle_deliveries` (`FOR UPDATE SKIP LOCKED`).
3. Eligibility is re-checked at send time (`checkRecipientEligibility`):
   active membership, verified email, preference for the message class,
   suppression ledger.
4. The template renders from the versioned registry
   (`renderLifecycleEmail`); render failures are permanent failures, not
   retries.
5. `sendLifecycleEmail` sends through Resend with class-appropriate sender
   display names and `List-Unsubscribe` headers on optional classes.
6. `record_lifecycle_attempt` (RPC) stores the attempt, applies exponential
   backoff for retryable failures, marks `delivered`, `failed`,
   `dead_letter`, or `suppressed`, and stamps `completed_at`.

## Statuses

`pending`, `scheduled`, `processing`, `delivered`, `failed`, `dead_letter`,
`suppressed`, `canceled`. Suppressed and canceled intents keep their reason;
nothing is deleted.

## Boundaries

- Lifecycle email never sends inside a customer browser action; only the
  worker sends.
- Incident alert email (Phase 7), status-page subscriber email (Phase 9),
  and Stripe billing email (Phase 10) remain separate systems with separate
  recipients and preferences.
- The worker runs behind `/api/internal/lifecycle/run`, authenticated with
  `LIFECYCLE_WORKER_TOKEN`, and accepts a `jobs` array (`rules`, `reports`,
  `recaps`, `delivery`, `reconcile`).

## Retry policy

`max_attempts` defaults to 5 with exponential backoff computed in
`record_lifecycle_attempt`. Exhausted intents move to `dead_letter` and
appear in `/internal/lifecycle` for inspection.
