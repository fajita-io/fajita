# Billing security review

Scope: Phase 10 Stripe billing, checkout, webhooks, entitlements, and RLS.

## Card data and PCI scope

Fajita never receives, processes, or stores raw card numbers, CVC, or full
payment tokens. Card entry happens on Stripe-hosted Checkout; payment-method
management happens in the Stripe Customer Portal. Fajita stores only safe
references and summaries (Stripe customer id, subscription id, invoice id,
billing email, `tax_id_present` flag, amounts in cents). Using Stripe reduces
PCI scope but does not remove Fajita's other security responsibilities, and no
specific PCI compliance level is claimed without a proper assessment.

## Checkout

- Checkout can only be started by an authenticated user with `billing:manage`
  on the active organization (`startCheckoutAction`).
- Plan and price are selected server-side from the catalog by immutable lookup
  key. The client never supplies a Stripe customer id or price id. The
  `/api/stripe/checkout` route only accepts an org id and plan key and delegates
  to the authorized action.
- A live subscription blocks a new base-plan checkout in code, and a partial
  unique index (`billing_subscriptions_one_live_idx`) blocks duplicates at the
  database layer.
- Success and cancel URLs are built server-side from the app URL. The success
  redirect is never treated as authorization; the page polls for the
  webhook-verified state.
- Metadata carries only safe internal references (org id, checkout intent id,
  plan key). No monitor URLs, secrets, subscriber emails, incident content, or
  tokens.

## Webhooks

- Every event is verified with `stripe.webhooks.constructEvent` against the raw
  request body and the endpoint secret. Unsigned or malformed events are
  rejected.
- Idempotency: the inbox is keyed by `stripe_event_id` (primary key), inserted
  with `ignoreDuplicates`. A previously processed event returns `duplicate`
  without reprocessing.
- Out-of-order events are guarded by `shouldApplyEvent` using the Stripe object
  timestamp, so an older event never overwrites a newer subscription state.
- Only required events are handled; unknown events are acknowledged and marked
  ignored.
- Processing failures return 500 with no internal detail in the body, so Stripe
  retries and no attacker learns processing internals. Errors are truncated in
  `last_error` and never include raw payment payloads.

## Authorization and tenancy

- All billing mutations run through server actions that authorize with the
  central permission model and write via the service role. Customers write
  nothing directly.
- RLS isolates reads: sensitive rows (subscription, invoices, customer mapping,
  grace, cancellation, downgrade) require org `admin`+; counts and the current
  entitlement snapshot are member-readable; checkout intents, webhook events,
  admin overrides, and reconciliation runs have no customer policy and are
  service-role only. See `docs/database/phase-10-rls.md`.
- Customer Portal sessions are created server-side after an authorization
  check; the Stripe customer id is resolved from the org mapping, never
  accepted from the client.

## What customers cannot forge

Subscription status, invoice state, entitlement snapshots, grace periods,
refund records, usage counts, webhook status, and Stripe customer ids are all
service-role writes behind authorized actions. A client cannot attach another
organization's subscription or read another organization's invoices.

## Refunds

Refunds are recorded from verified `charge.refunded` webhooks. Customer-facing
refund self-service is not built. Organization admins cannot issue refunds; a
refund admin path is platform-admin only (deferred UI).

## Logging and analytics

No secrets or raw webhook payloads are logged. Billing detail (card brand,
last four, invoice number, tax id, billing address, coupon code, Stripe ids)
is never sent to product analytics.

## Environment separation

Test and live Stripe keys and webhook secrets are environment-scoped. A live
checkout never uses a test price and a test checkout never uses a live price,
because prices are resolved from lookup keys against the active Stripe mode.

## Known gaps (tracked for follow-up)

- Reconciliation between Stripe and Fajita is designed and has a table, but the
  scheduled job is not yet running.
- Step-up authentication for platform-admin refund and override actions is
  policy, not yet enforced in code (platform-admin UI deferred).
- Rate limiting on checkout creation relies on Stripe Radar and existing
  account requirements; a dedicated per-org checkout throttle is not yet added.
