# Affiliate referral cookie model (Phase 12)

Internal engineering reference. Not customer-facing.

## Purpose

Persist a first-party pointer to a referral session across a visitor's journey
on Fajita's public site, so attribution can be bound server-side at signup and
organization creation. The cookie is a pointer, never a source of truth.

## Cookie

- Name: `fj_ref`
- Format version: `1`
- Payload: `1.<sessionId>.<expiresEpoch>.<signature>`
  - `sessionId`: opaque UUID of an `affiliate_sessions` row
  - `expiresEpoch`: epoch seconds, matches the published attribution window
  - `signature`: base64url HMAC-SHA256 of `1.<sessionId>.<expiresEpoch>` using
    `AFFILIATE_COOKIE_SECRET`
- Attributes: `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Path=/`,
  `Max-Age` = attribution window (30 days).

Implementation: `src/lib/affiliates/cookie.ts`.

## What the cookie never contains

- Affiliate identity or code
- Customer identity
- Commission or revenue data
- Any longer window than the published attribution window

## Tamper resistance

The signature is verified constant-time on every read. A tampered payload,
swapped session id, wrong version, or expired timestamp yields `null` (no
attribution). If no secret is configured, a cookie that claims to be signed is
rejected; an unsigned cookie is accepted only in development.

## Consent classification

The referral cookie is a **functional attribution** cookie tied to a commercial
program, not strictly necessary. It must be disclosed and, where a jurisdiction
requires prior consent for non-essential cookies, gated by the site consent
mechanism. It must not be classified as strictly necessary without review, and
we do not claim anonymous tracking because a stable (opaque) session identifier
is used. Advertising-profile enrichment is prohibited. See
`/docs/privacy/phase-12-data-map.md` and the referral cookie disclosure draft
(`/docs/legal/affiliate-disclosure-guide.md`).

Status: consent-gating hook is a documented follow-up in this slice; the cookie
is `HttpOnly`/`Lax` and set only on top-level, user-initiated referral
navigations.

## Lifecycle

1. A top-level navigation carrying `?ref=<code>` (optionally `&fjc=<campaign>`)
   is detected in `src/middleware.ts` and redirected to `/api/ref`.
2. `/api/ref` (`src/app/api/ref/route.ts`, Node runtime) validates the code and
   destination, records a privacy-minimized click and first-party session,
   sets/refreshes `fj_ref`, and redirects to a clean allowlisted destination
   (referral params stripped from the visible URL).
3. Subsequent public navigations carry the cookie; the session id stays stable.
4. At organization creation, `bindReferralOnOrgCreation` reads the cookie and
   binds attribution server-side (`src/lib/affiliates/bind.ts`).

## Anti cookie-stuffing

Only `Sec-Fetch-Dest: document` navigations create attribution (middleware and
route both enforce). Subresource requests (images, iframes, background fetches)
never set the cookie. The referral endpoint is rate-limited per instance.
