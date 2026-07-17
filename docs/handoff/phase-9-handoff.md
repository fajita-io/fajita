# Phase 9 handoff: status-page subscribers

This is an honest account of what was built, what was verified, and what was
intentionally deferred. It does not claim the full 113-section brief shipped.
The **delivery backbone** (consent, double opt-in, tokens, fan-out, delivery,
callbacks, suppression, public flows, and a first admin surface) is
production-grade and end-to-end. Several **operations surfaces** (import/export
UI, delivery-history UI, preview UI, reconciliation scheduling, internal lab,
load tests) are deferred and listed precisely below.

## 1. What ships and works

### Public subscription
- `POST /api/status-subscriptions/subscribe`: normalize + validate, per-IP and
  per-email-hash rate limits, honeypot, page-eligibility check, component slug
  resolution, consent + preference capture, neutral response for enumeration
  safety.
- Public `SubscribeForm` on hosted and custom-domain status pages, lightweight
  (single fetch, no email SDK), with component and event preference selection,
  clear operational (non-marketing) consent copy.

### Double opt-in
- Confirmation token: high entropy, hashed at rest, single use, 48h expiry,
  bound to one subscriber + page, revocable, kept out of logs/analytics/referrer.
- `/status-subscriptions/confirm`: valid, already-confirmed, expired, and
  invalid states; issues a preference token on success; concurrency-safe single
  use via a `status = 'pending'` guarded update.
- Confirmation resend with cooldown and previous-token invalidation.

### Preferences, unsubscribe, deletion
- Passwordless preference center (`/status-subscriptions/preferences`) with a
  stateless HMAC token, masked email, all/selected components, incident and
  maintenance toggles, save / unsubscribe / request-deletion.
- `/status-subscriptions/unsubscribe` confirm page + server action.
- `POST /api/status-subscriptions/one-click-unsubscribe`: RFC 8058, idempotent,
  200 on any validly formed request, never exposes a raw subscriber id.
- Deletion request rotates `link_token_version` (kills every issued link) and
  preserves a suppression hash.

### Delivery engine
- `emitSubscriberEvent` wired into incident and maintenance publication,
  best-effort and non-blocking, allowlisted public payload only.
- Fan-out worker: keyset-paginated, confirmed-only, preference- and
  component-aware, deduplicated intents, recorded suppression explanations.
- Delivery worker: leased intents, decrypt, render, send via Resend, recorded
  attempts, bounded retry with backoff, dead-letter on exhaustion.
- Deduplication table prevents duplicate sends across retries and duplicate
  events/callbacks.
- Templates for confirmation, incident opened/update/resolved/reopened, and
  maintenance scheduled/started/updated/completed/canceled, with HTML + plain
  text, customer branding, restrained Fajita footer, no marketing, no em dashes.

### Bounce / complaint / callbacks
- `POST /api/webhooks/subscriber-email`: Svix signature verification, timestamp
  replay window, idempotent apply, fail-closed, safe summary only.
- Hard bounce and complaint suppress immediately and cancel pending deliveries;
  soft bounce retries and suppresses after a threshold.

### Administration (first surface)
- `/app/status-pages/[statusPageId]/subscribers`: counts, delivery health,
  settings form (per-event toggles, component selection, cooldown, privacy URL),
  masked/paginated subscriber list. Guarded by feature flag + granular
  permissions; sensitive display requires `subscribers:read_sensitive`.
- Server actions: `updateSubscriberSettings`, `operatorUnsubscribe`,
  `operatorSuppress`, each permissioned, tenant-scoped, audited, and unable to
  override complaint/hard-bounce suppression or fabricate consent.
- Subscribers tab added to the status-page subnav (flag + permission gated).

### Security / privacy
- Addresses encrypted (AES-256-GCM keyring); dedup + suppression via keyed hash.
- RLS on all Phase 9 tables; PII tables service-role only; operational tables
  member-readable, service-role write only.
- Split permissions in the central role model
  (`subscribers:read_summary/read_sensitive/manage/suppress/delete/import/export/
  delivery_read/delivery_retry/settings_manage`).
- Consent records pinned to a consent text version; unsubscribe records its
  source.

## 2. Verification performed

- `npx next build`: passes (public + app + API routes compile).
- `npx vitest run`: 40 unit tests pass across normalization, masking, labels,
  preference-token signing, email crypto (hash + envelope + ip hash), and
  provider-callback mapping + signature verification (including replay and
  forged-signature rejection).
- `npx next lint --dir src`: passes (warnings only).
- Migrations applied to the linked Supabase project; Supabase types regenerated.

## 3. Files created (high level)

- Migrations: `20260723000000_phase9_subscriber_schema.sql`,
  `..._engine.sql`, `..._rls.sql`, `..._link_token.sql`, `..._consent_events.sql`.
- Domain libs: `src/lib/subscribers/{constants,normalize,mask,consent,tokens,
  signing,email-crypto,prefs,context,events,subscribe,confirm,preferences,
  lifecycle,labels,affected-components,templates,admin}.ts` and
  `src/lib/subscribers/delivery/{fanout,worker,sender,callbacks,confirmation}.ts`.
- App: `src/lib/app/{subscriber-context.ts, actions/subscribers.ts}`,
  `src/components/app/subscribers/settings-form.tsx`, the subscribers admin page,
  subnav entry.
- Public: `src/app/status-subscriptions/{layout,confirm,preferences,unsubscribe}`,
  `src/components/status-public/subscribe-form.tsx`.
- API: `subscribe`, `one-click-unsubscribe`, `webhooks/subscriber-email`,
  `internal/subscribers/run`.
- Worker: `scripts/subscriber-worker.ts`.
- Tests + config: `vitest.config.ts`, `test/stubs/server-only.ts`, six `*.test.ts`.
- Docs: this file plus architecture, double-opt-in, security review, data map,
  schema, RLS, analytics events, transfer checklist.

## 4. Environment variables added

- `SUBSCRIBER_WORKER_TOKEN` (worker trigger auth)
- `SUBSCRIBER_EMAIL_WEBHOOK_SECRET` (callback verification; fails closed)
- Documented existing shared keys in `.env.example`: `MONITOR_SECRET_KEYRING`,
  `RESEND_API_KEY`, `ALERT_EMAIL_FROM`.

No new dependencies beyond `vitest` (dev) for unit testing.

## 5. Items intentionally deferred (not built in this pass)

These have schema and/or permissions in place but no finished UI/processing:

- **Subscriber import**: upload, CSV parse, consent attestation, formula-injection
  guard, background job, results report. Tables exist.
- **Subscriber export**: background generation, expiring signed URL, CSV safety.
  Tables exist.
- **Subscriber detail page** and **delivery-history / delivery-detail** UI
  (`/subscribers/[id]`, `/subscriber-deliveries`). Data functions partially
  exist (`getDeliveryHealth`); full views not built.
- **Email preview + test-send UI**. Templates render server-side; no preview
  route or authorized test-send yet.
- **Reconciliation scheduling** and the `reconcile_subscriber_delivery` sweep as
  a scheduled job (function exists; not scheduled).
- **Automatic form-pause** wiring to provider-health signals (fields exist; the
  safety trigger is not automated).
- **In-app notifications** for complaint/bounce/dead-letter/domain issues
  (notification center exists from Phase 3; not wired).
- **Internal subscriber lab** (`/internal/subscriber-lab`) and full fixture set.
- **DataFast goal wiring** for the Phase 9 event names (audit log covers the key
  operator actions today).
- **Automated RLS, integration, e2e, accessibility, and load tests**, and the
  staging bounce/complaint sandbox runs. Unit tests cover pure logic only.
- Overview/status-page-management metric integration beyond the subscribers page.

## 6. Not implemented (correctly out of scope)

No SMS, phone, WhatsApp, Telegram, or mobile push. No marketing campaigns,
newsletters, product announcements, cross-promotions, affiliate promotions, drip
or lifecycle sales email. No Stripe billing or paid subscriber tiers. No
affiliate tracking, no Pamphlet chatbot, no AI-generated incident or email copy,
no custom customer sending domains, no arbitrary customer HTML/CSS/JS. Open
tracking is deliberately absent.

## 7. Readiness notes for Phase 10 (billing / entitlements)

- Entitlement seams are in place but not enforced: `subscriber_powered_by_removed`
  (per-page column) and the `subscriber_email_remove_powered_by` entitlement name
  are reserved. The footer renderer should read the resolved entitlement rather
  than the raw column once Phase 10 wires plan-gating.
- Subscriber counts and delivery volume are the natural metering inputs if a
  future plan meters subscribers; no plan names are hardcoded anywhere in Phase 9.
- Feature access is currently gated by the `statusSubscribers` feature flag
  (`private_beta`); Phase 10 can layer plan entitlement on top of the existing
  `requireSubscriberContext` guard without changing call sites.

## 8. Known limitations

- `email_normalized` plaintext is retained alongside the encrypted envelope to
  serve the current admin/import path; treat as sensitive and drop once
  encrypted-search fully replaces it.
- Confirmation email sends inline from the subscribe route (not through the
  intent pipeline); a broad confirmation-delivery outage is not retried by the
  delivery worker. Acceptable for double opt-in; revisit if confirmation volume
  grows.
- Delivery has been exercised by unit tests and a successful build, not by a
  staging send against Resend or a load test. Do not claim measured throughput
  until `docs/testing/phase-9-load-results.md` is populated.
