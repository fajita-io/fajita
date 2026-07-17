# Documentation code style

Internal. Standards for code examples in documentation.

**Date:** 2026-07-17

## Requirements

- Realistic fixture values only. No real secrets, customer IDs, or internal
  URLs.
- Use explicit placeholders that do not resemble real secrets:
  `YOUR_WEBHOOK_SIGNING_SECRET`, `YOUR_HEARTBEAT_TOKEN`, `YOUR_API_TOKEN`.
- Prefer fewer accurate examples over many stale ones.
- Include basic error handling and expected behavior where relevant.
- State the language and any dependency where it matters.

## Rendering

Code blocks (`components/docs/code-block.tsx`) provide a language/title bar, a
copy button, accessible contrast, and horizontal scroll inside the block so the
mobile page never overflows. Copy returns exactly the visible source with no
hidden characters and no injected values.

## Webhook examples

The signature examples for Node.js, Python, and Go implement the exact scheme
used by the outbound signer (`src/lib/alerts/signing.ts`): raw body, timestamp
window, `kid.timestamp.eventId.body` signed input, HMAC-SHA256, constant-time
comparison, and event-ID idempotency. The Node example is verified against the
real signer in `src/lib/docs/platform.test.ts`, which proves the documented
scheme accepts genuine signatures and rejects tampering and stale timestamps.

## Do not

Publish untested snippets written only for appearance, tell developers to parse
and reserialize JSON before verifying a signature, or include insecure defaults.
