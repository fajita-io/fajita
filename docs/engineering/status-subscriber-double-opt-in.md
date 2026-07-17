# Double opt-in and tokens (Phase 9)

No operational update is ever sent before confirmation. A submitted form is not
consent to receive incident email.

## Subscribe (step 1)

`POST /api/status-subscriptions/subscribe` (`recordSubscriptionRequest` in
`src/lib/subscribers/subscribe.ts`):

1. Normalize + validate the address (`normalize.ts`). Conservative: lowercase
   domain and local, trim, never strip Gmail dots or plus aliases, never rewrite
   silently. Suggest a correction for known domain typos.
2. Rate-limit per IP and per email hash (separate windows,
   `SUBSCRIBER_RATE_LIMITS`). Honeypot field (`website`) silently accepts.
3. Verify the page exists, is public, has subscriptions enabled, and is not
   auto-paused.
4. Durable suppression wins: a suppressed / complained address produces no
   record and no email.
5. Create or refresh a `pending` subscriber, write preferences + components,
   write a consent record pinned to `CONSENT_TEXT_VERSION`.
6. Mint a high-entropy confirmation token, store **only its hash**, send exactly
   one confirmation email.

The response is always neutral ("Check your inbox for a confirmation link"), for
every case (new, pending, confirmed, unsubscribed, suppressed), so an attacker
cannot enumerate addresses.

## Confirm (step 2)

`/status-subscriptions/confirm?token=...` -> `confirmSubscription`:

- Look up by token hash, check page availability and subscriber state.
- Enforce single use: the confirmation hash is cleared on success, guarded by a
  `status = 'pending'` update predicate against a concurrent double-confirm.
- Enforce expiry (`CONFIRMATION_TTL_HOURS = 48`). Expired shows a clear message
  and offers a fresh email; never reveals whether an unrelated address exists.
- On success: status -> `confirmed`, consent-completion record written, a
  stateless preference token issued.

## Confirmation resend

`requestConfirmationResend` is cooldown-limited
(`subscriber_confirmation_cooldown_seconds`), invalidates the previous token,
and returns a neutral response.

## Token model

Two token types, both kept out of logs, analytics, and referrers (the confirm /
preference pages set `referrer: no-referrer`):

**Confirmation tokens** (`tokens.ts`): high entropy, single use, time limited,
stored hashed (`confirmation_token_hash`), bound to one subscriber + page,
revocable (regenerated on resend).

**Preference / unsubscribe tokens** (`signing.ts`): stateless, HMAC-signed
`<subscriberId>.<version>.<sig>`. The HMAC key is derived from the platform
keyring (no new secret infra, no per-send DB row). Revocation is by bumping
`link_token_version` on the subscriber row: a deletion request or rotation
invalidates every previously issued link with a single column write. Verified
constant-time; the caller also confirms the version still matches
`link_token_version` so a rotated link is rejected.
